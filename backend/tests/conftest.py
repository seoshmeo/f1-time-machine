from datetime import date, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models import Circuit, Constructor, Driver, Race, Season


@pytest.fixture(scope="function")
def test_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_season(test_db: Session):
    season = Season(
        year=2024,
        name="2024 FIA Formula 1 World Championship",
        url="https://en.wikipedia.org/wiki/2024_Formula_One_World_Championship",
        start_date=date(2024, 3, 1),
        end_date=date(2024, 12, 8),
    )
    test_db.add(season)
    test_db.commit()
    test_db.refresh(season)
    return season


@pytest.fixture
def sample_circuit(test_db: Session):
    circuit = Circuit(
        circuit_ref="monaco",
        name="Circuit de Monaco",
        location="Monte Carlo",
        country="Monaco",
        lat=43.7347,
        lng=7.4206,
        url="https://en.wikipedia.org/wiki/Circuit_de_Monaco",
    )
    test_db.add(circuit)
    test_db.commit()
    test_db.refresh(circuit)
    return circuit


@pytest.fixture
def sample_driver(test_db: Session):
    driver = Driver(
        driver_ref="verstappen",
        number=1,
        code="VER",
        first_name="Max",
        last_name="Verstappen",
        date_of_birth=date(1997, 9, 30),
        nationality="Dutch",
        url="https://en.wikipedia.org/wiki/Max_Verstappen",
    )
    test_db.add(driver)
    test_db.commit()
    test_db.refresh(driver)
    return driver


@pytest.fixture
def sample_constructor(test_db: Session):
    constructor = Constructor(
        constructor_ref="red_bull",
        name="Red Bull Racing",
        full_name="Oracle Red Bull Racing",
        nationality="Austrian",
        url="https://en.wikipedia.org/wiki/Red_Bull_Racing",
        color_primary="#3671C6",
        color_secondary="#FF0000",
    )
    test_db.add(constructor)
    test_db.commit()
    test_db.refresh(constructor)
    return constructor


@pytest.fixture
def sample_race(test_db: Session, sample_season: Season, sample_circuit: Circuit):
    race = Race(
        season_id=sample_season.id,
        round=1,
        circuit_id=sample_circuit.id,
        name="Monaco Grand Prix",
        official_name="Formula 1 Grand Prix de Monaco 2024",
        date=date(2024, 5, 26),
        url="https://en.wikipedia.org/wiki/2024_Monaco_Grand_Prix",
    )
    test_db.add(race)
    test_db.commit()
    test_db.refresh(race)
    return race
