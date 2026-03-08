from datetime import date, datetime, timedelta
import random

from sqlalchemy.orm import Session

from app.models.tables import HotelRaw, IngestionRun


HOTEL_DATA = [
    {
        "city": "New York",
        "hotel_name": "Manhattan Central Hotel",
        "star_rating": 4.5,
        "base_price": 220.0,
    },
    {
        "city": "London",
        "hotel_name": "London Riverside Suites",
        "star_rating": 4.3,
        "base_price": 180.0,
    },
    {
        "city": "Sydney",
        "hotel_name": "Sydney Harbour Stay",
        "star_rating": 4.4,
        "base_price": 195.0,
    },
    {
        "city": "Tokyo",
        "hotel_name": "Shinjuku Business Hotel",
        "star_rating": 4.2,
        "base_price": 160.0,
    },
]


def generate_mock_hotel_prices() -> list:
    today = date.today()
    generated_rows = []

    for hotel in HOTEL_DATA:
        for day_offset in [7, 14, 30]:
            checkin_date = today + timedelta(days=day_offset)
            checkout_date = checkin_date + timedelta(days=4)

            price_multiplier = random.uniform(0.9, 1.2)
            nightly_price = round(hotel["base_price"] * price_multiplier, 2)

            generated_rows.append(
                {
                    "source": "mock_hotel_provider",
                    "city": hotel["city"],
                    "hotel_name": hotel["hotel_name"],
                    "star_rating": hotel["star_rating"],
                    "room_type": "Standard",
                    "nightly_price": nightly_price,
                    "currency_code": "USD",
                    "available": True,
                    "checkin_date": checkin_date,
                    "checkout_date": checkout_date,
                    "observed_at": datetime.utcnow(),
                }
            )

    return generated_rows


def ingest_hotel_data(db: Session) -> dict:
    ingestion_run = IngestionRun(
        job_name="hotel_ingestion",
        source_name="mock_hotel_provider",
        status="running",
        records_fetched=0,
        records_inserted=0,
    )
    db.add(ingestion_run)
    db.commit()
    db.refresh(ingestion_run)

    try:
        hotel_rows = generate_mock_hotel_prices()

        fetched_count = len(hotel_rows)
        inserted_count = 0

        for row in hotel_rows:
            record = HotelRaw(
                source=row["source"],
                city=row["city"],
                hotel_name=row["hotel_name"],
                star_rating=row["star_rating"],
                room_type=row["room_type"],
                nightly_price=row["nightly_price"],
                currency_code=row["currency_code"],
                available=row["available"],
                checkin_date=row["checkin_date"],
                checkout_date=row["checkout_date"],
                observed_at=row["observed_at"],
                ingestion_run_id=ingestion_run.id,
            )
            db.add(record)
            inserted_count += 1

        ingestion_run.status = "success"
        ingestion_run.records_fetched = fetched_count
        ingestion_run.records_inserted = inserted_count
        db.commit()

        return {
            "status": "success",
            "records_fetched": fetched_count,
            "records_inserted": inserted_count,
        }

    except Exception as e:
        ingestion_run.status = "failed"
        ingestion_run.error_message = str(e)
        db.commit()
        raise e