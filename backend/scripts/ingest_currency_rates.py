from app.core.database import SessionLocal
from app.services.ingestion.currency_service import ingest_currency_rates


def run():
    db = SessionLocal()
    try:
        result = ingest_currency_rates(db=db, base_currency="USD")
        print("Currency ingestion completed!")
        print(result)
    finally:
        db.close()


if __name__ == "__main__":
    run()