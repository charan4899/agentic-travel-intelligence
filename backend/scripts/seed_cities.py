from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.tables import CityReference


def seed_cities():
    db: Session = SessionLocal()

    cities = [
        {
            "city": "Hyderabad",
            "country": "India",
            "airport_code": "HYD",
            "currency_code": "INR",
            "timezone": "Asia/Kolkata",
        },
        {
            "city": "Tokyo",
            "country": "Japan",
            "airport_code": "HND",
            "currency_code": "JPY",
            "timezone": "Asia/Tokyo",
        },
        {
            "city": "New York",
            "country": "USA",
            "airport_code": "JFK",
            "currency_code": "USD",
            "timezone": "America/New_York",
        },
        {
            "city": "London",
            "country": "UK",
            "airport_code": "LHR",
            "currency_code": "GBP",
            "timezone": "Europe/London",
        },
        {
            "city": "Sydney",
            "country": "Australia",
            "airport_code": "SYD",
            "currency_code": "AUD",
            "timezone": "Australia/Sydney",
        },
    ]

    for city_data in cities:

        existing = (
            db.query(CityReference)
            .filter(CityReference.city == city_data["city"])
            .first()
        )

        if not existing:
            city = CityReference(**city_data)
            db.add(city)

    db.commit()
    db.close()

    print("Cities seeded successfully!")


if __name__ == "__main__":
    seed_cities()