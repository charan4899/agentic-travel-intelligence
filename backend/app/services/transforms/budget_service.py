from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.tables import FlightRaw, HotelRaw, WeatherRaw


WEATHER_SCORE_MAP = {
    "Clear sky": 9,
    "Mainly clear": 9,
    "Partly cloudy": 8,
    "Overcast": 6,
    "Fog": 5,
    "Depositing rime fog": 5,
    "Light drizzle": 5,
    "Moderate drizzle": 5,
    "Dense drizzle": 4,
    "Slight rain": 4,
    "Moderate rain": 4,
    "Heavy rain": 3,
    "Rain showers": 4,
    "Heavy rain showers": 3,
    "Violent rain showers": 2,
    "Thunderstorm": 2,
    "Slight snow": 4,
    "Moderate snow": 3,
    "Heavy snow": 2,
}


def get_weather_score(condition_text: str) -> int:
    return WEATHER_SCORE_MAP.get(condition_text, 5)


def assign_affordability_scores(results: list) -> list:
    scores_by_rank = [10, 8, 6, 4]

    for index, item in enumerate(results):
        if index < len(scores_by_rank):
            item["affordability_score"] = scores_by_rank[index]
        else:
            item["affordability_score"] = 4

    return results


def get_destination_budget_comparison(
    db: Session,
    trip_days: int = 5,
    selected_destinations: list[str] | None = None,
) -> list:
    latest_flights = (
        db.query(FlightRaw)
        .order_by(FlightRaw.destination_city, desc(FlightRaw.created_at))
        .all()
    )

    latest_hotels = (
        db.query(HotelRaw)
        .order_by(HotelRaw.city, desc(HotelRaw.created_at))
        .all()
    )

    latest_weather = (
        db.query(WeatherRaw)
        .order_by(WeatherRaw.city, desc(WeatherRaw.created_at))
        .all()
    )

    latest_flight_by_destination = {}
    for flight in latest_flights:
        if flight.destination_city not in latest_flight_by_destination:
            latest_flight_by_destination[flight.destination_city] = flight

    latest_hotel_by_city = {}
    for hotel in latest_hotels:
        if hotel.city not in latest_hotel_by_city:
            latest_hotel_by_city[hotel.city] = hotel

    latest_weather_by_city = {}
    for weather in latest_weather:
        if weather.city not in latest_weather_by_city:
            latest_weather_by_city[weather.city] = weather

    comparison_results = []

    all_destinations = (
        set(latest_flight_by_destination.keys())
        & set(latest_hotel_by_city.keys())
        & set(latest_weather_by_city.keys())
    )

    if selected_destinations:
        all_destinations = all_destinations & set(selected_destinations)

    for destination in all_destinations:
        flight = latest_flight_by_destination[destination]
        hotel = latest_hotel_by_city[destination]
        weather = latest_weather_by_city[destination]

        estimated_flight_cost = float(flight.observed_price)
        estimated_hotel_cost = float(hotel.nightly_price) * trip_days
        estimated_total_cost = estimated_flight_cost + estimated_hotel_cost
        weather_score = get_weather_score(weather.condition_text)

        comparison_results.append(
            {
                "origin_city": flight.origin_city,
                "destination_city": destination,
                "trip_days": trip_days,
                "flight_cost_usd": round(estimated_flight_cost, 2),
                "hotel_cost_usd": round(estimated_hotel_cost, 2),
                "total_cost_usd": round(estimated_total_cost, 2),
                "airline": flight.airline,
                "hotel_name": hotel.hotel_name,
                "weather_condition": weather.condition_text,
                "temperature_c": weather.temperature_c,
                "precipitation_mm": weather.precipitation_mm,
                "weather_score": weather_score,
            }
        )

    comparison_results.sort(key=lambda x: x["total_cost_usd"])
    comparison_results = assign_affordability_scores(comparison_results)

    return comparison_results


def get_destination_summary_cards(
    db: Session,
    trip_days: int = 5,
    selected_destinations: list[str] | None = None,
) -> dict:
    destinations = get_destination_budget_comparison(
        db=db,
        trip_days=trip_days,
        selected_destinations=selected_destinations,
    )

    if not destinations:
        return {
            "trip_days": trip_days,
            "cheapest_destination": None,
            "best_weather_destination": None,
            "best_value_destination": None,
            "most_expensive_destination": None,
        }

    cheapest_destination = min(destinations, key=lambda x: x["total_cost_usd"])
    best_weather_destination = max(destinations, key=lambda x: x["weather_score"])
    most_expensive_destination = max(destinations, key=lambda x: x["total_cost_usd"])

    for destination in destinations:
        destination["value_score"] = (
            destination["affordability_score"] + destination["weather_score"]
        )

    best_value_destination = max(destinations, key=lambda x: x["value_score"])

    return {
        "trip_days": trip_days,
        "cheapest_destination": cheapest_destination,
        "best_weather_destination": best_weather_destination,
        "best_value_destination": best_value_destination,
        "most_expensive_destination": most_expensive_destination,
    }