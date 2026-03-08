from datetime import date, datetime, timedelta
import random

from sqlalchemy.orm import Session

from app.models.tables import FlightRaw, IngestionRun


ROUTES = [
    {
        "origin_city": "Hyderabad",
        "destination_city": "New York",
        "airline": "Emirates",
        "base_price": 920.0,
    },
    {
        "origin_city": "Hyderabad",
        "destination_city": "London",
        "airline": "British Airways",
        "base_price": 680.0,
    },
    {
        "origin_city": "Hyderabad",
        "destination_city": "Sydney",
        "airline": "Singapore Airlines",
        "base_price": 870.0,
    },
    {
        "origin_city": "Hyderabad",
        "destination_city": "Tokyo",
        "airline": "Japan Airlines",
        "base_price": 740.0,
    },
]


def generate_mock_flight_prices() -> list:
    today = date.today()
    generated_rows = []

    for route in ROUTES:
        for day_offset in [7, 14, 30]:
            departure_date = today + timedelta(days=day_offset)

            price_multiplier = random.uniform(0.9, 1.15)
            observed_price = round(route["base_price"] * price_multiplier, 2)

            generated_rows.append(
                {
                    "source": "mock_flight_provider",
                    "origin_city": route["origin_city"],
                    "destination_city": route["destination_city"],
                    "departure_date": departure_date,
                    "airline": route["airline"],
                    "cabin_class": "Economy",
                    "observed_price": observed_price,
                    "currency_code": "USD",
                    "observed_at": datetime.utcnow(),
                }
            )

    return generated_rows


def ingest_flight_data(db: Session) -> dict:
    ingestion_run = IngestionRun(
        job_name="flight_ingestion",
        source_name="mock_flight_provider",
        status="running",
        records_fetched=0,
        records_inserted=0,
    )
    db.add(ingestion_run)
    db.commit()
    db.refresh(ingestion_run)

    try:
        flight_rows = generate_mock_flight_prices()

        fetched_count = len(flight_rows)
        inserted_count = 0

        for row in flight_rows:
            record = FlightRaw(
                source=row["source"],
                origin_city=row["origin_city"],
                destination_city=row["destination_city"],
                departure_date=row["departure_date"],
                airline=row["airline"],
                cabin_class=row["cabin_class"],
                observed_price=row["observed_price"],
                currency_code=row["currency_code"],
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