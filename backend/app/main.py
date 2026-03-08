from fastapi import FastAPI
from sqlalchemy import desc
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.agent import AgentQueryRequest
import time 
from app.services.agent.travel_agent import run_travel_agent
from app.services.observability.logging_service import (
    create_query_log,
    create_source_usage_log,
)


from app.core.database import create_tables, test_db_connection, SessionLocal

# Import models so SQLAlchemy knows about them before create_all runs
from app.models import (
    CityReference,
    CurrencyRateRaw,
    FlightRaw,
    HotelRaw,
    IngestionRun,
    QueryLog,
    SourceUsageLog,
    WeatherRaw,
)
from app.services.transforms.budget_service import get_destination_budget_comparison, get_destination_summary_cards

app = FastAPI(title="Agentic Travel Intelligence API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://agentic-travel-eight.vercel.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_tables()


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/health/db")
def health_db_check():
    try:
        test_db_connection()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}


@app.get("/health/tables")
def health_tables_check():
    return {
        "status": "ok",
        "tables_expected": [
            "city_reference",
            "ingestion_runs",
            "flights_raw",
            "hotels_raw",
        ],
    }

@app.get("/api/cities")
def get_cities():

    db = SessionLocal()

    cities = db.query(CityReference).all()

    result = []

    for city in cities:
        result.append(
            {
                "city": city.city,
                "country": city.country,
                "airport_code": city.airport_code,
                "currency": city.currency_code,
            }
        )

    db.close()

    return result

@app.get("/api/currency/latest")
def get_latest_currency_rates():
    db = SessionLocal()

    try:
        latest_rates = (
            db.query(CurrencyRateRaw)
            .order_by(desc(CurrencyRateRaw.created_at))
            .limit(10)
            .all()
        )

        result = []
        for rate in latest_rates:
            result.append(
                {
                    "base_currency": rate.base_currency,
                    "target_currency": rate.target_currency,
                    "rate": rate.rate,
                    "source": rate.source,
                    "created_at": rate.created_at,
                }
            )

        return result

    finally:
        db.close()

@app.get("/api/weather/latest")
def get_latest_weather():
    db = SessionLocal()

    try:
        weather_rows = (
            db.query(WeatherRaw)
            .order_by(desc(WeatherRaw.created_at))
            .limit(10)
            .all()
        )

        result = []
        for row in weather_rows:
            result.append(
                {
                    "city": row.city,
                    "forecast_date": row.forecast_date,
                    "temperature_c": row.temperature_c,
                    "condition_text": row.condition_text,
                    "precipitation_mm": row.precipitation_mm,
                    "source": row.source,
                    "created_at": row.created_at,
                }
            )

        return result

    finally:
        db.close()

@app.get("/api/flights/latest")
def get_latest_flights():
    db = SessionLocal()

    try:
        flight_rows = (
            db.query(FlightRaw)
            .order_by(desc(FlightRaw.created_at))
            .limit(20)
            .all()
        )

        result = []
        for row in flight_rows:
            result.append(
                {
                    "origin_city": row.origin_city,
                    "destination_city": row.destination_city,
                    "departure_date": row.departure_date,
                    "airline": row.airline,
                    "cabin_class": row.cabin_class,
                    "observed_price": row.observed_price,
                    "currency_code": row.currency_code,
                    "source": row.source,
                    "created_at": row.created_at,
                }
            )

        return result

    finally:
        db.close()

@app.get("/api/hotels/latest")
def get_latest_hotels():
    db = SessionLocal()

    try:
        hotel_rows = (
            db.query(HotelRaw)
            .order_by(desc(HotelRaw.created_at))
            .limit(20)
            .all()
        )

        result = []
        for row in hotel_rows:
            result.append(
                {
                    "city": row.city,
                    "hotel_name": row.hotel_name,
                    "star_rating": row.star_rating,
                    "room_type": row.room_type,
                    "nightly_price": row.nightly_price,
                    "currency_code": row.currency_code,
                    "available": row.available,
                    "checkin_date": row.checkin_date,
                    "checkout_date": row.checkout_date,
                    "source": row.source,
                    "created_at": row.created_at,
                }
            )

        return result

    finally:
        db.close()

@app.get("/api/budget/compare")
def compare_destination_budgets(
    trip_days: int = 5,
    destinations: str | None = None,
):
    db = SessionLocal()

    start_time = time.time()

    try:
        selected_destinations = (
            [item.strip() for item in destinations.split(",") if item.strip()]
            if destinations
            else None
        )

        results = get_destination_budget_comparison(
            db=db,
            trip_days=trip_days,
            selected_destinations=selected_destinations,
        )
        

        latency_ms = int((time.time() - start_time) * 1000)

        user_query = f"Compare destination budgets for a {trip_days}-day trip"
        query_log = create_query_log(
            db=db,
            user_query=user_query,
            intent="budget_compare",
            confidence_score=0.9,
            used_sql=True,
            used_vector=False,
            used_live_api=False,
            latency_ms=latency_ms,
        )

        create_source_usage_log(
            db=db,
            query_log_id=query_log.id,
            source_type="sql",
            source_name="flights_raw",
            freshness_seconds=None,
            relevance_score=0.95,
            details_json={"role": "flight pricing data"},
        )

        create_source_usage_log(
            db=db,
            query_log_id=query_log.id,
            source_type="sql",
            source_name="hotels_raw",
            freshness_seconds=None,
            relevance_score=0.95,
            details_json={"role": "hotel pricing data"},
        )

        create_source_usage_log(
            db=db,
            query_log_id=query_log.id,
            source_type="sql",
            source_name="weather_raw",
            freshness_seconds=None,
            relevance_score=0.85,
            details_json={"role": "weather enrichment data"},
        )

        return {
            "trip_days": trip_days,
            "destinations": results,
        }

    finally:
        db.close()


@app.get("/api/destinations/summary")
def get_destination_summaries(
    trip_days: int = 5,
    destinations: str | None = None,
):
    db = SessionLocal()

    try:
        selected_destinations = (
            [item.strip() for item in destinations.split(",") if item.strip()]
            if destinations
            else None
        )

        results = get_destination_summary_cards(
            db=db,
            trip_days=trip_days,
            selected_destinations=selected_destinations,
        )
        return results

    finally:
        db.close()

@app.get("/api/logs/queries")
def get_query_logs():
    db = SessionLocal()

    try:
        logs = (
            db.query(QueryLog)
            .order_by(desc(QueryLog.created_at))
            .limit(20)
            .all()
        )

        result = []
        for log in logs:
            result.append(
                {
                    "id": log.id,
                    "user_query": log.user_query,
                    "intent": log.intent,
                    "confidence_score": log.confidence_score,
                    "used_sql": log.used_sql,
                    "used_vector": log.used_vector,
                    "used_live_api": log.used_live_api,
                    "latency_ms": log.latency_ms,
                    "created_at": log.created_at,
                }
            )

        return result

    finally:
        db.close()


@app.get("/api/logs/source-usage")
def get_source_usage_logs():
    db = SessionLocal()

    try:
        logs = (
            db.query(SourceUsageLog)
            .order_by(desc(SourceUsageLog.created_at))
            .limit(50)
            .all()
        )

        result = []
        for log in logs:
            result.append(
                {
                    "id": log.id,
                    "query_log_id": log.query_log_id,
                    "source_type": log.source_type,
                    "source_name": log.source_name,
                    "freshness_seconds": log.freshness_seconds,
                    "relevance_score": log.relevance_score,
                    "details_json": log.details_json,
                    "created_at": log.created_at,
                }
            )

        return result

    finally:
        db.close()

@app.get("/api/ingestion/recent")
def get_recent_ingestion_runs():
    db = SessionLocal()

    try:
        runs = (
            db.query(IngestionRun)
            .order_by(desc(IngestionRun.started_at))
            .limit(20)
            .all()
        )

        result = []
        for run in runs:
            result.append(
                {
                    "id": run.id,
                    "job_name": run.job_name,
                    "source_name": run.source_name,
                    "status": run.status,
                    "records_fetched": run.records_fetched,
                    "records_inserted": run.records_inserted,
                    "started_at": run.started_at,
                    "ended_at": run.ended_at,
                    "error_message": run.error_message,
                }
            )

        return result

    finally:
        db.close()

@app.get("/api/ingestion/summary")
def get_ingestion_summary():
    db = SessionLocal()

    try:
        runs = (
            db.query(IngestionRun)
            .order_by(desc(IngestionRun.started_at))
            .all()
        )

        total_runs = len(runs)
        successful_runs = len([run for run in runs if run.status == "success"])
        failed_runs = len([run for run in runs if run.status == "failed"])

        latest_run_time = runs[0].started_at if runs else None

        latest_status_by_job = {}

        for run in runs:
            if run.job_name not in latest_status_by_job:
                latest_status_by_job[run.job_name] = {
                    "status": run.status,
                    "started_at": run.started_at,
                    "records_fetched": run.records_fetched,
                    "records_inserted": run.records_inserted,
                }

        return {
            "total_runs": total_runs,
            "successful_runs": successful_runs,
            "failed_runs": failed_runs,
            "latest_run_time": latest_run_time,
            "latest_status_by_job": latest_status_by_job,
        }

    finally:
        db.close()

@app.get("/api/agent/query")
def agent_query_get(q: str):
    db = SessionLocal()
    start_time = time.time()

    try:
        result = run_travel_agent(db=db, user_query=q)

        latency_ms = int((time.time() - start_time) * 1000)

        query_log = create_query_log(
            db=db,
            user_query=q,
            intent=result["intent"],
            confidence_score=result["confidence_score"],
            used_sql=True,
            used_vector=False,
            used_live_api=False,
            latency_ms=latency_ms,
        )

        for source in result["sources_used"]:
            create_source_usage_log(
                db=db,
                query_log_id=query_log.id,
                source_type=source["source_type"],
                source_name=source["source_name"],
                freshness_seconds=None,
                relevance_score=source["relevance_score"],
                details_json={"role": "agent source"},
            )

        return result

    finally:
        db.close()

@app.post("/api/agent/query")
def agent_query_post(payload: AgentQueryRequest):
    db = SessionLocal()
    start_time = time.time()

    try:
        result = run_travel_agent(
            db=db,
            user_query=payload.query,
            selected_destinations=payload.selected_destinations,
        )

        latency_ms = int((time.time() - start_time) * 1000)

        query_log = create_query_log(
            db=db,
            user_query=payload.query,
            intent=result["intent"],
            confidence_score=result["confidence_score"],
            used_sql=True,
            used_vector=False,
            used_live_api=False,
            latency_ms=latency_ms,
        )

        for source in result["sources_used"]:
            create_source_usage_log(
                db=db,
                query_log_id=query_log.id,
                source_type=source["source_type"],
                source_name=source["source_name"],
                freshness_seconds=None,
                relevance_score=source["relevance_score"],
                details_json={"role": "agent source"},
            )

        return result

    finally:
        db.close()