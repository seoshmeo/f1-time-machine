from sqlalchemy.orm import Session, joinedload

from app.models import Race, Result
from app.models import Session as SessionModel


def get_race_detail_with_results(db: Session, race_id: int):
    race = (
        db.query(Race)
        .options(joinedload(Race.circuit), joinedload(Race.sessions))
        .filter(Race.id == race_id)
        .first()
    )

    if not race:
        return None

    race_session = (
        db.query(SessionModel)
        .filter(SessionModel.race_id == race_id, SessionModel.type == "race")
        .first()
    )

    results = []
    if race_session:
        results = (
            db.query(Result)
            .options(
                joinedload(Result.driver),
                joinedload(Result.constructor),
                joinedload(Result.status),
            )
            .filter(Result.session_id == race_session.id)
            .order_by(Result.position_order)
            .all()
        )

    return {
        "race": race,
        "results": results,
    }
