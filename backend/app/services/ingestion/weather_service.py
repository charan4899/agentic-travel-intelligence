import requests
from sqlalchemy.orm import Session

from app.models.tables import IngestionRun, WeatherRaw

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

CITY_COORDINATES = {
    "Hyderabad": {"latitude": 17.3850, "longitude": 78.4867},
    "New York": {"latitude": 40.7128, "longitude": -74.0060},
    "London": {"latitude": 51.5072, "longitude": -0.1276},
    "Sydney": {"latitude": -33.8688, "longitude": 151.2093},
    "Tokyo": {"latitude": 35.6762, "longitude": 139.6503},
}


WEATHER_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Heavy rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
}


def fetch_weather_for_city(city: str) -> dict:
    coordinates = CITY_COORDINATES[city]

    params = {
        "latitude": coordinates["latitude"],
        "longitude": coordinates["longitude"],
        "daily": "weathercode,temperature_2m_max,precipitation_sum",
        "forecast_days": 1,
        "timezone": "auto",
    }

    response = requests.get(OPEN_METEO_URL, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def ingest_weather_data(db: Session) -> dict:
    ingestion_run = IngestionRun(
        job_name="weather_ingestion",
        source_name="open-meteo",
        status="running",
        records_fetched=0,
        records_inserted=0,
    )
    db.add(ingestion_run)
    db.commit()
    db.refresh(ingestion_run)

    try:
        fetched_count = 0
        inserted_count = 0

        for city in CITY_COORDINATES.keys():
            payload = fetch_weather_for_city(city)

            daily = payload.get("daily", {})
            dates = daily.get("time", [])
            temperatures = daily.get("temperature_2m_max", [])
            precipitation = daily.get("precipitation_sum", [])
            weather_codes = daily.get("weathercode", [])

            for i in range(len(dates)):
                weather_code = weather_codes[i] if i < len(weather_codes) else None
                condition_text = WEATHER_CODE_MAP.get(weather_code, "Unknown")

                record = WeatherRaw(
                    source="open-meteo",
                    city=city,
                    forecast_date=dates[i],
                    temperature_c=temperatures[i] if i < len(temperatures) else None,
                    condition_text=condition_text,
                    precipitation_mm=precipitation[i] if i < len(precipitation) else None,
                    ingestion_run_id=ingestion_run.id,
                )
                db.add(record)
                inserted_count += 1

            fetched_count += 1

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