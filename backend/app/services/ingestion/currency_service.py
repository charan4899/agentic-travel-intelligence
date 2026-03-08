import requests
from sqlalchemy.orm import Session

from app.models.tables import CurrencyRateRaw, IngestionRun

FRANKFURTER_URL = "https://api.frankfurter.dev/v1/latest"


def fetch_latest_currency_rates(base_currency: str = "USD") -> dict:
    params = {
        "base": base_currency,
        "symbols": "INR,USD,GBP,AUD,JPY",
    }

    response = requests.get(FRANKFURTER_URL, params=params, timeout=30)
    response.raise_for_status()

    return response.json()


def ingest_currency_rates(db: Session, base_currency: str = "USD") -> dict:
    ingestion_run = IngestionRun(
        job_name="currency_ingestion",
        source_name="frankfurter",
        status="running",
        records_fetched=0,
        records_inserted=0,
    )
    db.add(ingestion_run)
    db.commit()
    db.refresh(ingestion_run)

    try:
        payload = fetch_latest_currency_rates(base_currency=base_currency)

        rates = payload.get("rates", {})
        rates[base_currency] = 1.0
        fetched_count = len(rates)
        inserted_count = 0

        for target_currency, rate in rates.items():
            record = CurrencyRateRaw(
                source="frankfurter",
                base_currency=base_currency,
                target_currency=target_currency,
                rate=rate,
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
            "base_currency": base_currency,
            "records_fetched": fetched_count,
            "records_inserted": inserted_count,
        }

    except Exception as e:
        ingestion_run.status = "failed"
        ingestion_run.error_message = str(e)
        db.commit()
        raise e