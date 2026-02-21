import json
import re
import time
from collections import defaultdict

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.config import get_settings

router = APIRouter()

# Rate limiting: IP -> list of request timestamps
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_MAX = 10
RATE_LIMIT_WINDOW = 60  # seconds

SYSTEM_PROMPT = """You are a UI theme customizer for an F1 statistics website.
You ONLY output valid JSON matching the ThemeConfig schema.
You change visual appearance AND layout: colors, border radius, font sizes, card sizes, content width, grid columns, spacing.

ThemeConfig schema (all fields optional — return only changed fields):
{
  "colors": {
    "background": "#hex - main page background",
    "backgroundSecondary": "#hex - header/footer/sidebar background",
    "card": "#hex - card component backgrounds",
    "accent": "#hex - brand/accent color (buttons, active states)",
    "accentHover": "#hex - accent hover state",
    "textPrimary": "#hex - main text color",
    "textSecondary": "#hex - secondary text",
    "textMuted": "#hex - muted/disabled text",
    "border": "#hex - border color"
  },
  "borderRadius": "CSS value (e.g., 0.5rem, 8px, 0)",
  "fontSize": {
    "base": "CSS font-size (e.g., 1rem, 16px)",
    "sm": "CSS font-size for small text",
    "lg": "CSS font-size for larger text"
  },
  "layout": {
    "maxWidth": "CSS max-width for content area (e.g., 1400px, 1600px, 100%)",
    "contentPadding": "CSS padding around main content (e.g., 16px, 2rem)",
    "cardColumns": "number of columns in card grids as string (e.g., 2, 3, 4)",
    "cardMinWidth": "CSS min-width for cards in auto-fill grids (e.g., 280px, 400px, 560px). Default is 280px. To make cards bigger, increase this value (e.g., 500px for ~2x bigger). To make cards smaller, decrease it.",
    "cardPadding": "CSS padding inside card components (e.g., 24px, 48px). Default is 24px.",
    "gap": "CSS gap between grid items (e.g., 16px, 1.5rem, 32px)",
    "headerPosition": "sticky or static"
  },
  "reorder": [
    {"match": "text to find in item", "order": -1}
  ]
}

The "reorder" field moves items within grid/flex containers using CSS order.
- "match" is case-insensitive text search within the item content (use a person's last name, team name, etc.)
- "order" is a CSS order integer. Lower values come first. Default is 0. Use -1 to move to start, 999 to move to end.
- You can include multiple rules to reorder several items.
- Examples: [{"match": "Glock", "order": -1}] puts Timo Glock first.
  [{"match": "Ferrari", "order": -2}, {"match": "McLaren", "order": -1}] puts Ferrari first, then McLaren.

STRICT RULES:
- Output ONLY valid JSON. No markdown, no explanations, no code fences.
- Only return the fields the user wants to change.
- All colors must be valid hex (#RRGGBB).
- Ensure sufficient contrast between text and backgrounds.
- Never output text content, URLs, links, HTML, or JavaScript.
- Never include anything discriminatory, offensive, or violating laws.
- Layout values must be valid CSS values.
- cardColumns must be a number between 1 and 6.
- headerPosition must be either "sticky" or "static".
- reorder match strings must be short (1-3 words, max 50 chars), no HTML/JS/special chars.
- reorder order values must be integers between -100 and 1000.
- If asked for something you cannot do, return: {"error": "I can only customize visual appearance, layout, and item ordering."}"""

HEX_COLOR_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")
CSS_UNIT_RE = re.compile(r"^[0-9]+(\.[0-9]+)?(rem|px|em|%|vw)$|^0$|^100%$")

VALID_COLOR_KEYS = {
    "background", "backgroundSecondary", "card", "accent", "accentHover",
    "textPrimary", "textSecondary", "textMuted", "border",
}


class CustomizeRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)
    current_theme: dict | None = None


class CustomizeResponse(BaseModel):
    theme: dict
    message: str


def _check_rate_limit(client_ip: str) -> None:
    now = time.time()
    timestamps = _rate_limit_store[client_ip]
    _rate_limit_store[client_ip] = [
        t for t in timestamps if now - t < RATE_LIMIT_WINDOW
    ]
    if len(_rate_limit_store[client_ip]) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait a minute before trying again.",
        )
    _rate_limit_store[client_ip].append(now)


def _validate_theme(theme: dict) -> dict:
    """Validate and sanitize theme config values."""
    validated = {}

    if "error" in theme:
        return theme

    if "colors" in theme and isinstance(theme["colors"], dict):
        colors = {}
        for key, value in theme["colors"].items():
            if key in VALID_COLOR_KEYS and isinstance(value, str) and HEX_COLOR_RE.match(value):
                colors[key] = value
        if colors:
            validated["colors"] = colors

    if "borderRadius" in theme and isinstance(theme["borderRadius"], str):
        if CSS_UNIT_RE.match(theme["borderRadius"]):
            validated["borderRadius"] = theme["borderRadius"]

    if "fontSize" in theme and isinstance(theme["fontSize"], dict):
        font_sizes = {}
        for key in ("base", "sm", "lg"):
            value = theme["fontSize"].get(key)
            if isinstance(value, str) and CSS_UNIT_RE.match(value):
                font_sizes[key] = value
        if font_sizes:
            validated["fontSize"] = font_sizes

    if "layout" in theme and isinstance(theme["layout"], dict):
        layout = {}
        raw = theme["layout"]

        for key in ("maxWidth", "contentPadding", "cardMinWidth", "cardPadding", "gap"):
            if isinstance(raw.get(key), str) and CSS_UNIT_RE.match(raw[key]):
                layout[key] = raw[key]

        if isinstance(raw.get("cardColumns"), (str, int)):
            cols = str(raw["cardColumns"])
            if cols.isdigit() and 1 <= int(cols) <= 6:
                layout["cardColumns"] = cols

        if raw.get("headerPosition") in ("sticky", "static"):
            layout["headerPosition"] = raw["headerPosition"]

        if layout:
            validated["layout"] = layout

    if "reorder" in theme and isinstance(theme["reorder"], list):
        reorder = []
        safe_text_re = re.compile(r"^[a-zA-Z0-9 .\-']+$")
        for rule in theme["reorder"]:
            if not isinstance(rule, dict):
                continue
            match = rule.get("match")
            order = rule.get("order")
            if (
                isinstance(match, str)
                and 1 <= len(match) <= 50
                and safe_text_re.match(match)
                and isinstance(order, (int, float))
                and -100 <= int(order) <= 1000
            ):
                reorder.append({"match": match, "order": int(order)})
        if reorder:
            validated["reorder"] = reorder

    return validated


@router.post("/customize", response_model=CustomizeResponse)
async def customize_theme(body: CustomizeRequest, request: Request):
    settings = get_settings()

    if not settings.anthropic_api_key:
        raise HTTPException(status_code=500, detail="Anthropic API key not configured")

    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    user_message = body.prompt
    if body.current_theme:
        user_message += f"\n\nCurrent theme: {body.current_theme}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.anthropic_api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-haiku-4-5-20251001",
                    "max_tokens": 1024,
                    "system": SYSTEM_PROMPT,
                    "messages": [
                        {"role": "user", "content": user_message}
                    ],
                },
            )
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="AI service took too long to respond. Please try again.")
        except httpx.RequestError:
            raise HTTPException(status_code=502, detail="Could not reach AI service. Please try again later.")

    if response.status_code != 200:
        # Extract meaningful error from Anthropic response
        try:
            err_data = response.json()
            err_msg = err_data.get("error", {}).get("message", "")
        except (ValueError, TypeError):
            err_msg = ""
        if response.status_code == 429:
            detail = "AI service is busy. Please try again in a minute."
        elif response.status_code in (401, 403):
            detail = "AI service authentication error. Please contact the site administrator."
        else:
            detail = f"AI service error ({response.status_code}). Please try again."
        raise HTTPException(status_code=502, detail=detail)

    try:
        data = response.json()
    except (ValueError, TypeError):
        raise HTTPException(status_code=502, detail="AI service returned an invalid response.")

    content = data.get("content")
    if not isinstance(content, list) or len(content) == 0:
        raise HTTPException(status_code=502, detail="AI service returned an empty response.")

    text = content[0].get("text", "").strip() if isinstance(content[0], dict) else ""

    # Strip markdown code fences if present
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    try:
        theme_raw = json.loads(text)
    except (ValueError, TypeError):
        raise HTTPException(status_code=502, detail="AI returned invalid JSON")

    if not isinstance(theme_raw, dict):
        raise HTTPException(status_code=502, detail="AI returned non-object JSON")

    if "error" in theme_raw:
        return CustomizeResponse(theme={}, message=theme_raw["error"])

    validated = _validate_theme(theme_raw)
    if not validated:
        raise HTTPException(status_code=502, detail="AI returned no valid theme properties")

    return CustomizeResponse(theme=validated, message="Theme applied!")
