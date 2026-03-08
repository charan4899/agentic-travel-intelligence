from groq import Groq

from app.core.config import GROQ_API_KEY


def generate_travel_response_with_groq(
    user_query: str,
    intent: str,
    trip_days: int,
    structured_data: dict | list,
) -> str:
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set in the environment.")

    client = Groq(api_key=GROQ_API_KEY)

    system_prompt = """
You are a travel intelligence assistant.

Your job is to answer travel planning questions using ONLY the structured backend data provided.
Do not invent destinations, prices, weather, or scores.
Be concise, clear, and helpful.
If multiple destinations are provided, summarize the best recommendation and briefly explain why.
"""

    user_prompt = f"""
User query:
{user_query}

Detected intent:
{intent}

Trip days:
{trip_days}

Structured backend data:
{structured_data}

Write a polished answer for the user using only this data.
"""

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": user_prompt.strip()},
        ],
        temperature=0.3,
        max_tokens=220,
    )

    return completion.choices[0].message.content.strip()