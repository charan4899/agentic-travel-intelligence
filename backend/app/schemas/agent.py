from pydantic import BaseModel


class AgentQueryRequest(BaseModel):
    query: str
    selected_destinations: list[str] | None = None