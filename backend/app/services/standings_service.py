from sqlalchemy.orm import Session, joinedload

from app.models import (
    ConstructorStanding,
    DriverStanding,
    Race,
)


def get_driver_standings_after_round(db: Session, season_id: int, round_number: int):
    race = (
        db.query(Race)
        .filter(Race.season_id == season_id, Race.round == round_number)
        .first()
    )

    if not race:
        return []

    standings = (
        db.query(DriverStanding)
        .options(joinedload(DriverStanding.driver))
        .filter(DriverStanding.race_id == race.id)
        .order_by(DriverStanding.position)
        .all()
    )

    return standings


def get_constructor_standings_after_round(db: Session, season_id: int, round_number: int):
    race = (
        db.query(Race)
        .filter(Race.season_id == season_id, Race.round == round_number)
        .first()
    )

    if not race:
        return []

    standings = (
        db.query(ConstructorStanding)
        .options(joinedload(ConstructorStanding.constructor))
        .filter(ConstructorStanding.race_id == race.id)
        .order_by(ConstructorStanding.position)
        .all()
    )

    return standings


def get_standings_progression(db: Session, season_id: int):
    races = (
        db.query(Race)
        .filter(Race.season_id == season_id)
        .order_by(Race.round)
        .all()
    )

    driver_progression = {}

    for race in races:
        standings = (
            db.query(DriverStanding)
            .options(joinedload(DriverStanding.driver))
            .filter(DriverStanding.race_id == race.id)
            .all()
        )

        for standing in standings:
            driver_id = standing.driver_id
            if driver_id not in driver_progression:
                driver_progression[driver_id] = {
                    "driver": standing.driver,
                    "points_by_round": {},
                }

            driver_progression[driver_id]["points_by_round"][race.round] = standing.points

    return driver_progression
