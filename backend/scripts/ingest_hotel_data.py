from app.core.database import SessionLocal
from app.services.ingestion.hotel_service import ingest_hotel_data


def run():
    db = SessionLocal()
    try:
        result = ingest_hotel_data(db=db)
        print("Hotel ingestion completed!")
        print(result)
    finally:
        db.close()


if __name__ == "__main__":
    run()