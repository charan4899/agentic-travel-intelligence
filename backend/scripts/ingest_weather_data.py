from app.core.database import SessionLocal
from app.services.ingestion.weather_service import ingest_weather_data


def run():
    db = SessionLocal()
    try:
        result = ingest_weather_data(db=db)
        print("Weather ingestion completed!")
        print(result)
    finally:
        db.close()


if __name__ == "__main__":
    run()