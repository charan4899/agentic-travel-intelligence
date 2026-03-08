from sqlalchemy import Boolean, Column, Date, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func

from app.core.database import Base


class CityReference(Base):
    __tablename__ = "city_reference"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, nullable=False)
    country = Column(String, nullable=False)
    airport_code = Column(String, nullable=False)
    currency_code = Column(String, nullable=False)
    timezone = Column(String, nullable=False)


class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id = Column(Integer, primary_key=True, index=True)
    job_name = Column(String, nullable=False)
    source_name = Column(String, nullable=False)
    status = Column(String, nullable=False)
    records_fetched = Column(Integer, default=0)
    records_inserted = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)


class FlightRaw(Base):
    __tablename__ = "flights_raw"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)
    origin_city = Column(String, nullable=False)
    destination_city = Column(String, nullable=False)
    departure_date = Column(Date, nullable=False)
    airline = Column(String, nullable=False)
    cabin_class = Column(String, nullable=True)
    observed_price = Column(Float, nullable=False)
    currency_code = Column(String, nullable=False)
    observed_at = Column(DateTime(timezone=True), server_default=func.now())
    ingestion_run_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HotelRaw(Base):
    __tablename__ = "hotels_raw"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)
    city = Column(String, nullable=False)
    hotel_name = Column(String, nullable=False)
    star_rating = Column(Float, nullable=True)
    room_type = Column(String, nullable=True)
    nightly_price = Column(Float, nullable=False)
    currency_code = Column(String, nullable=False)
    available = Column(Boolean, default=True)
    checkin_date = Column(Date, nullable=False)
    checkout_date = Column(Date, nullable=False)
    observed_at = Column(DateTime(timezone=True), server_default=func.now())
    ingestion_run_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CurrencyRateRaw(Base):
    __tablename__ = "currency_rates_raw"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)
    base_currency = Column(String, nullable=False)
    target_currency = Column(String, nullable=False)
    rate = Column(Float, nullable=False)
    observed_at = Column(DateTime(timezone=True), server_default=func.now())
    ingestion_run_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WeatherRaw(Base):
    __tablename__ = "weather_raw"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)
    city = Column(String, nullable=False)
    forecast_date = Column(Date, nullable=False)
    temperature_c = Column(Float, nullable=True)
    condition_text = Column(String, nullable=True)
    precipitation_mm = Column(Float, nullable=True)
    observed_at = Column(DateTime(timezone=True), server_default=func.now())
    ingestion_run_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_query = Column(Text, nullable=False)
    intent = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=True)
    used_sql = Column(Boolean, default=False)
    used_vector = Column(Boolean, default=False)
    used_live_api = Column(Boolean, default=False)
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SourceUsageLog(Base):
    __tablename__ = "source_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    query_log_id = Column(Integer, nullable=False)
    source_type = Column(String, nullable=False)
    source_name = Column(String, nullable=False)
    freshness_seconds = Column(Integer, nullable=True)
    relevance_score = Column(Float, nullable=True)
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())