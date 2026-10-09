# MISSEDLY AI — Never miss what matters

A full-stack hackathon starter for the “What Did I Miss?” challenge. It provides a dark, responsive React interface and a FastAPI backend that extracts likely urgent messages, deadlines, decisions, mentions, and action items from pasted chat text.

## What is implemented
- Responsive React/Vite dashboard
- Paste conversation text and optionally specify the user's name
- Rule-based urgency/deadline/decision/action extraction with original line numbers
- Priority filters, summary panel, action checklist, and TXT report export
- No database, no API keys, and no third-party AI API calls in this starter
- FastAPI health endpoint and input-size validation

## Run locally
Requirements: Python 3.10+ and Node.js 18+.

### 1. Start backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Start frontend in a second terminal
```bash
cd frontend
npm install
npm run dev
```
Open the URL printed by Vite, usually http://localhost:5173.

## Deploy
- Backend: deploy `backend/` to a Python host that supports FastAPI (for example Render or Railway); start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
- Frontend: deploy `frontend/` to a static host (for example Vercel or Netlify). Set `VITE_API_URL` to your deployed backend base URL, without a trailing slash, then build with `npm run build`.
- Update `allow_origins` in `backend/main.py` to include your deployed frontend origin before production use.
- Ensure the repository is public if required by the challenge. Never commit private conversations, credentials, or `.env` files.

## Important limitations
This is a working prototype, not a real LLM summarizer. The backend uses transparent keyword rules and may miss context, misclassify messages, or fail to infer complex meaning. Always verify extracted items against the original conversation. For an advanced version, add a genuinely local model (e.g. Ollama running on the user's own machine) behind a clearly documented adapter; do not claim model-based AI until it is actually integrated.

## GenAI disclosure
This starter does not call a GenAI service. If you later add one, update the challenge submission to name the provider/model and explain what data is transmitted. The current backend processes submitted text in the backend instance but does not persist it.
