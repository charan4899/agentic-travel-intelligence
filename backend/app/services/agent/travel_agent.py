import re
from sqlalchemy.orm import Session

from app.services.llm.groq_service import generate_travel_response_with_groq
from app.services.transforms.budget_service import (
    get_destination_budget_comparison,
    get_destination_summary_cards,
)


def extract_trip_days(user_query: str) -> int:
    match = re.search(r"(\d+)\s*day", user_query.lower())
    if match:
        return int(match.group(1))
    return 5


def classify_intent(user_query: str) -> str:
    query = user_query.lower()

    if "cheapest" in query or "lowest cost" in query or "budget" in query:
        return "cheapest_destination"

    if "best weather" in query or "weather" in query:
        return "best_weather_destination"

    if "best value" in query or "value" in query:
        return "best_value_destination"

    if "compare" in query:
        return "destination_compare"

    return "destination_compare"


def build_fallback_answer(intent: str, trip_days: int, data: dict | list) -> str:
    if intent == "destination_compare":
        return f"Compared destinations for a {trip_days}-day trip."

    if intent == "cheapest_destination":
        best = data["cheapest_destination"]
        return (
            f"For a {trip_days}-day trip, the cheapest destination is "
            f"{best['destination_city']} with an estimated total cost of "
            f"${best['total_cost_usd']}."
        )

    if intent == "best_weather_destination":
        best = data["best_weather_destination"]
        return (
            f"For a {trip_days}-day trip, the destination with the best weather is "
            f"{best['destination_city']} with weather condition '{best['weather_condition']}' "
            f"and weather score {best['weather_score']}."
        )

    if intent == "best_value_destination":
        best = data["best_value_destination"]
        return (
            f"For a {trip_days}-day trip, the best value destination is "
            f"{best['destination_city']} with value score {best['value_score']} "
            f"and estimated total cost of ${best['total_cost_usd']}."
        )

    return (
        f"For a {trip_days}-day trip, a good option is "
        f"{data['best_value_destination']['destination_city']}."
    )


def run_travel_agent(
    db: Session,
    user_query: str,
    selected_destinations: list[str] | None = None,
) -> dict:
    trip_days = extract_trip_days(user_query)
    intent = classify_intent(user_query)

    sources_used = [
        {"source_type": "sql", "source_name": "flights_raw", "relevance_score": 0.95},
        {"source_type": "sql", "source_name": "hotels_raw", "relevance_score": 0.95},
        {"source_type": "sql", "source_name": "weather_raw", "relevance_score": 0.85},
    ]

    if intent == "destination_compare":
        structured_data = get_destination_budget_comparison(
            db=db,
            trip_days=trip_days,
            selected_destinations=selected_destinations,
        )
        fallback_answer = build_fallback_answer(intent, trip_days, structured_data)
        confidence_score = 0.87
    else:
        structured_data = get_destination_summary_cards(
            db=db,
            trip_days=trip_days,
            selected_destinations=selected_destinations,
        )
        fallback_answer = build_fallback_answer(intent, trip_days, structured_data)
        confidence_score = 0.92

    llm_used = False
    answer = fallback_answer

    try:
        answer = generate_travel_response_with_groq(
            user_query=user_query,
            intent=intent,
            trip_days=trip_days,
            structured_data=structured_data,
        )
        llm_used = True
    except Exception:
        llm_used = False

    return {
        "intent": intent,
        "trip_days": trip_days,
        "confidence_score": confidence_score,
        "sources_used": sources_used,
        "answer": answer,
        "data": structured_data,
        "llm_used": llm_used,
        "llm_provider": "groq" if llm_used else None,
        "llm_model": "llama-3.1-8b-instant" if llm_used else None,
        "selected_destinations": selected_destinations,
    }