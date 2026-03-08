from app.core.database import SessionLocal
from app.services.ingestion.flight_service import ingest_flight_data


def run():
    db = SessionLocal()
    try:
        result = ingest_flight_data(db=db)
        print("Flight ingestion completed!")
        print(result)
    finally:
        db.close()


if __name__ == "__main__":
    run()