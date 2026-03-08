import json
from sqlalchemy.orm import Session

from app.models.tables import QueryLog, SourceUsageLog


def create_query_log(
    db: Session,
    user_query: str,
    intent: str,
    confidence_score: float,
    used_sql: bool,
    used_vector: bool,
    used_live_api: bool,
    latency_ms: int,
) -> QueryLog:
    query_log = QueryLog(
        user_query=user_query,
        intent=intent,
        confidence_score=confidence_score,
        used_sql=used_sql,
        used_vector=used_vector,
        used_live_api=used_live_api,
        latency_ms=latency_ms,
    )
    db.add(query_log)
    db.commit()
    db.refresh(query_log)
    return query_log


def create_source_usage_log(
    db: Session,
    query_log_id: int,
    source_type: str,
    source_name: str,
    freshness_seconds: int | None = None,
    relevance_score: float | None = None,
    details_json: dict | None = None,
) -> SourceUsageLog:
    source_log = SourceUsageLog(
        query_log_id=query_log_id,
        source_type=source_type,
        source_name=source_name,
        freshness_seconds=freshness_seconds,
        relevance_score=relevance_score,
        details_json=json.dumps(details_json) if details_json else None,
    )
    db.add(source_log)
    db.commit()
    db.refresh(source_log)
    return source_log