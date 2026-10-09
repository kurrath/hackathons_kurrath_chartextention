from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import re

app = FastAPI(title="MISSEDLY AI API", description="Local-first chat catch-up and action extraction API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    conversation: str = Field(min_length=10, max_length=100_000)
    user_name: str = Field(default="me", max_length=80)

class Insight(BaseModel):
    category: str
    priority: str
    message: str
    reason: str
    source_line: int

class AnalyzeResponse(BaseModel):
    summary: List[str]
    insights: List[Insight]
    action_items: List[Insight]
    message_count: int
    privacy: str

URGENT = ["urgent", "asap", "immediately", "critical", "emergency", "right now"]
DEADLINE = ["deadline", "due", "by today", "by tomorrow", "eod", "submit by", "before friday", "before monday"]
TASK = ["please send", "need you to", "can you", "you should", "action item", "follow up", "finish", "complete", "submit", "prepare", "upload", "share"]
DECISION = ["decided", "decision", "finalized", "finalised", "we will go with", "agreed to", "selected", "approved", "confirmed"]
MENTION = ["@{name}", "{name},", "{name} ", "for {name}"]


def split_messages(text: str) -> list[str]:
    # Each non-empty line is treated as a message to preserve traceability.
    return [line.strip() for line in text.splitlines() if line.strip()]


def classify(line: str, index: int, user_name: str) -> Insight | None:
    lower = line.lower()
    name = user_name.strip().lower()
    is_urgent = any(word in lower for word in URGENT)
    has_deadline = any(word in lower for word in DEADLINE) or bool(re.search(r"\b(today|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b", lower))
    is_task = any(phrase in lower for phrase in TASK)
    is_decision = any(phrase in lower for phrase in DECISION)
    is_mention = bool(name and name != "me" and (f"@{name}" in lower or f"{name}," in lower or f"{name}:" in lower))

    if is_urgent:
        category, priority, reason = "Urgent", "High", "Contains urgency language; verify the original context."
    elif has_deadline:
        category, priority, reason = "Deadline", "High", "Contains a date or deadline signal."
    elif is_mention:
        category, priority, reason = "Mention", "High", f"Appears to mention {user_name}."
    elif is_decision:
        category, priority, reason = "Decision", "Medium", "May record a decision or commitment."
    elif is_task:
        category, priority, reason = "Action item", "Medium", "Contains a possible request or task."
    else:
        return None
    return Insight(category=category, priority=priority, message=line, reason=reason, source_line=index)


def make_summary(lines: list[str], insights: list[Insight]) -> list[str]:
    if not lines:
        return ["No messages found."]
    result = []
    # Give the user a transparent, rule-based overview without pretending to be a generative model.
    categories = {}
    for item in insights:
        categories[item.category] = categories.get(item.category, 0) + 1
    if categories:
        result.append("Detected " + ", ".join(f"{count} {category.lower()}" for category, count in categories.items()) + ".")
    else:
        result.append("No obvious urgency, deadlines, decisions, or tasks were detected by the local rule-based scan.")
    result.append(f"Conversation contains {len(lines)} non-empty message line(s). Review the highlighted original lines before acting.")
    result.extend([f"Key item: {item.message}" for item in insights[:3]])
    return result[:5]

@app.get("/api/health")
def health():
    return {"status": "ok", "app": "MISSEDLY AI", "processing": "local rule-based demo"}

@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    lines = split_messages(payload.conversation)
    if not lines:
        raise HTTPException(status_code=400, detail="Paste at least one message line.")
    insights = []
    for idx, line in enumerate(lines, start=1):
        found = classify(line, idx, payload.user_name)
        if found:
            insights.append(found)
    insights.sort(key=lambda x: ({"High": 0, "Medium": 1, "Low": 2}.get(x.priority, 3), x.source_line))
    actions = [item for item in insights if item.category in {"Action item", "Deadline", "Urgent"}]
    return AnalyzeResponse(
        summary=make_summary(lines, insights),
        insights=insights,
        action_items=actions,
        message_count=len(lines),
        privacy="Demo runs rule-based analysis on your own backend. No third-party AI API is called and no conversation is saved to a database."
    )
