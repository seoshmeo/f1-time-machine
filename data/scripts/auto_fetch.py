#!/usr/bin/env python3
"""
Automatic F1 session results fetcher — cron entry point.

Usage:
    python auto_fetch.py --year 2026              # normal mode
    python auto_fetch.py --year 2026 --dry-run    # show what would be fetched
    python auto_fetch.py --year 2026 --force-round 5              # force all sessions for round
    python auto_fetch.py --year 2026 --force-round 5 --force-type Q  # force specific session

Cron (every 15 min):
    */15 * * * * cd /home/f1app/f1-time-machine/data/scripts && \
        /usr/bin/python3 auto_fetch.py --year 2026 >> /home/f1app/f1-time-machine/logs/cron.log 2>&1
"""
import argparse
import fcntl
import logging
import os
import sys
from datetime import datetime, timezone, timedelta
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import List, Tuple

import httpx

from common import get_db_connection, get_season_id

_SCRIPTS_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _SCRIPTS_DIR.parent.parent
_LOGS_DIR = _PROJECT_ROOT / "logs"
_LOCK_FILE = _LOGS_DIR / "auto_fetch.lock"

# Session durations in minutes (used to determine when a session has ended)
SESSION_DURATIONS = {
    'FP1': 60,
    'FP2': 60,
    'FP3': 60,
    'Q': 75,
    'SQ': 45,
    'SPRINT': 30,
    'R': 120,
}

# Grace period after session end before we try to fetch (minutes)
GRACE_PERIOD_MINUTES = 60


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

def _setup_logging() -> logging.Logger:
    """Configure rotating file + console logging."""
    _LOGS_DIR.mkdir(parents=True, exist_ok=True)

    logger = logging.getLogger("auto_fetch")
    logger.setLevel(logging.INFO)

    # Rotating file handler: 5 MB, 3 backups
    fh = RotatingFileHandler(
        _LOGS_DIR / "auto_fetch.log",
        maxBytes=5 * 1024 * 1024,
        backupCount=3,
        encoding="utf-8",
    )
    fh.setFormatter(logging.Formatter(
        "%(asctime)s [%(levelname)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
    ))
    logger.addHandler(fh)

    # Console handler
    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
    logger.addHandler(ch)

    return logger


log = _setup_logging()


# ---------------------------------------------------------------------------
# Telegram notification
# ---------------------------------------------------------------------------

def _notify_admin(message: str) -> None:
    """Send a Telegram message to the admin chat (best-effort)."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("BOT_ADMIN_CHAT_ID", "")
    if not token or not chat_id or chat_id == "0":
        log.info("Telegram notification skipped (no token/chat_id configured)")
        return

    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(url, json={
                "chat_id": chat_id,
                "text": message,
                "parse_mode": "HTML",
            })
            if resp.status_code == 200:
                log.info("Admin notified via Telegram")
            else:
                log.warning(f"Telegram API returned {resp.status_code}: {resp.text}")
    except Exception as e:
        log.warning(f"Failed to send Telegram notification: {e}")


# ---------------------------------------------------------------------------
# Detect ready sessions
# ---------------------------------------------------------------------------

def _find_ready_sessions(year: int) -> List[Tuple[int, str, int, str]]:
    """
    Find sessions that have ended (datetime + duration + grace < now) but
    have no results in the DB yet.

    Returns:
        List of (round_num, session_type, session_id, race_name)
    """
    now_utc = datetime.now(timezone.utc)
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        season_id = get_season_id(cursor, year)
        if not season_id:
            log.error(f"Season {year} not found in DB")
            return []

        # Get all sessions with their schedule info
        cursor.execute("""
            SELECT
                s.id AS session_id,
                s.type,
                s.date,
                s.time,
                r.round,
                r.name AS race_name
            FROM sessions s
            JOIN races r ON s.race_id = r.id
            WHERE s.season_id = ?
              AND s.type IN ('FP1', 'FP2', 'FP3', 'Q', 'SQ', 'SPRINT', 'R')
            ORDER BY s.date, s.time
        """, (season_id,))

        sessions = cursor.fetchall()
        ready = []

        for session_id, stype, sdate, stime, round_num, race_name in sessions:
            if not sdate or not stime:
                continue

            # Parse session start datetime (UTC assumed)
            try:
                time_str = stime.rstrip('Z')  # handle "07:00:00Z" format
                session_start = datetime.strptime(
                    f"{sdate} {time_str}", "%Y-%m-%d %H:%M:%S"
                ).replace(tzinfo=timezone.utc)
            except ValueError:
                continue

            duration = SESSION_DURATIONS.get(stype, 60)
            session_ready_at = session_start + timedelta(minutes=duration + GRACE_PERIOD_MINUTES)

            if now_utc < session_ready_at:
                continue  # not ready yet

            # Check if results already exist
            cursor.execute(
                "SELECT COUNT(*) FROM results WHERE session_id = ?",
                (session_id,)
            )
            result_count = cursor.fetchone()[0]
            if result_count > 0:
                continue  # already fetched

            ready.append((round_num, stype, session_id, race_name))

        return ready

    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Fetch dispatcher
# ---------------------------------------------------------------------------

def _fetch_session(year: int, round_num: int, session_type: str) -> int:
    """
    Dispatch to the appropriate fetch function for a session type.

    Returns:
        Number of results inserted
    """
    from fetch_round import (
        fetch_race_results_for_round,
        fetch_qualifying_for_round,
        fetch_sprint_for_round,
        fetch_practice_for_round,
        fetch_standings_for_round,
    )

    count = 0

    if session_type == 'R':
        count = fetch_race_results_for_round(year, round_num)
        if count > 0:
            # Also fetch standings after a race
            log.info(f"Fetching standings after race round {round_num}")
            fetch_standings_for_round(year, round_num)
    elif session_type == 'Q':
        count = fetch_qualifying_for_round(year, round_num)
    elif session_type == 'SPRINT':
        count = fetch_sprint_for_round(year, round_num)
    elif session_type in ('FP1', 'FP2', 'FP3', 'SQ'):
        count = fetch_practice_for_round(year, round_num, session_type)

    return count


# ---------------------------------------------------------------------------
# Regenerate events
# ---------------------------------------------------------------------------

def _regenerate_events(year: int) -> None:
    """Re-generate session events after new results are loaded."""
    log.info(f"Regenerating events for {year}...")
    try:
        from generate_events import generate_session_events
        generate_session_events(year)
        log.info("Events regenerated successfully")
    except Exception as e:
        log.error(f"Failed to regenerate events: {e}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Auto-fetch F1 session results")
    parser.add_argument("--year", type=int, required=True, help="Season year")
    parser.add_argument("--dry-run", action="store_true",
                        help="Only show what would be fetched")
    parser.add_argument("--force-round", type=int, default=None,
                        help="Force fetch for a specific round")
    parser.add_argument("--force-type", type=str, default=None,
                        choices=["R", "Q", "SPRINT", "FP1", "FP2", "FP3", "SQ"],
                        help="Force fetch for a specific session type (requires --force-round)")
    args = parser.parse_args()

    log.info(f"=== auto_fetch started: year={args.year} dry_run={args.dry_run} "
             f"force_round={args.force_round} force_type={args.force_type} ===")

    # --- Lock file (prevent parallel runs) ---
    _LOGS_DIR.mkdir(parents=True, exist_ok=True)
    lock_fp = open(_LOCK_FILE, "w")
    try:
        fcntl.flock(lock_fp, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        log.warning("Another auto_fetch instance is running, exiting.")
        sys.exit(0)

    try:
        # --- Determine what to fetch ---
        if args.force_round:
            if args.force_type:
                sessions_to_fetch = [(args.force_round, args.force_type, None, f"Round {args.force_round}")]
            else:
                # Fetch all session types for this round
                all_types = ['FP1', 'FP2', 'FP3', 'SQ', 'SPRINT', 'Q', 'R']
                sessions_to_fetch = [
                    (args.force_round, t, None, f"Round {args.force_round}")
                    for t in all_types
                ]
        else:
            sessions_to_fetch = _find_ready_sessions(args.year)

        if not sessions_to_fetch:
            log.info("No sessions ready to fetch.")
            return

        log.info(f"Sessions to fetch: {len(sessions_to_fetch)}")
        for round_num, stype, sid, rname in sessions_to_fetch:
            log.info(f"  Round {round_num} {stype} - {rname}")

        if args.dry_run:
            log.info("Dry run — exiting without fetching.")
            return

        # --- Fetch each session ---
        fetched_any = False
        summary_lines = []

        for round_num, stype, session_id, race_name in sessions_to_fetch:
            try:
                log.info(f"Fetching: Round {round_num} {stype} ({race_name})")
                count = _fetch_session(args.year, round_num, stype)
                if count > 0:
                    fetched_any = True
                    summary_lines.append(f"Round {round_num} {stype}: {count} results")
                    log.info(f"  OK: {count} results inserted")
                else:
                    log.info(f"  No results available yet for Round {round_num} {stype}")
            except Exception as e:
                log.error(f"  FAILED: Round {round_num} {stype}: {e}")
                summary_lines.append(f"Round {round_num} {stype}: FAILED - {e}")

        # --- Regenerate events ---
        if fetched_any:
            _regenerate_events(args.year)

        # --- Telegram notification ---
        if summary_lines:
            msg = f"<b>F1 Auto-Fetch ({args.year})</b>\n\n" + "\n".join(summary_lines)
            _notify_admin(msg)

        log.info("=== auto_fetch finished ===")

    finally:
        fcntl.flock(lock_fp, fcntl.LOCK_UN)
        lock_fp.close()


if __name__ == "__main__":
    main()
