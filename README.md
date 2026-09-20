# ShopSmart: Smart Shopping Cart Recommendation Agent

[![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-blue.svg)](https://langchain-ai.github.io/langgraph/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB.svg)](https://react.dev/)
[![ChromaDB](https://img.shields.io/badge/Vector_DB-ChromaDB-orange.svg)](https://www.trychroma.com/)
[![Observability](https://img.shields.io/badge/Telemetry-LangSmith-1C3C3C.svg)](https://smith.langchain.com/)

An enterprise-grade **Agentic AI Co-Pilot Engine** designed to replace static collaborative-filtering recommendation widgets. The system monitors cart state changes in real time, infers underlying user intent, queries a local dense vector database for missing complementary items, and enforces deterministic budget caps and deduplication guardrails via cyclic feedback loops.

---

## 📌 Architecture & Topology

Unlike typical one-shot prompt chains, the recommendation pipeline is modeled as a **cyclic state machine** using LangGraph:

```
[ Cart Mutation / Delta ]
│
▼
[ Intent Agent ]        (Gemini 2.0 Flash: Extracts theme & missing essentials)
│
▼
[ Retrieval Agent ]      (ChromaDB + all-MiniLM-L6-v2: Semantic vector search)
│
▼
[ Guardrail Agent ]      (Deterministic check: Total + Item Price <= Budget Cap)
│
┌───────┴────────────────────────┐
▼                                ▼
[ Passed ]                  [ Budget Violated ]
│                                │
▼                                ▼
[ Recommendations JSON ]    [ Cyclic Re-Route ] (Cycles back with stricter price limits)
```

### Key Engineering Merits
- **Cyclic Feedback Routing:** Re-routes budget-breaching candidates dynamically back to retrieval with lowered price bounds.
- **Graph Recursion Safety:** Enforces an immutable guardrail limit (`iteration_count <= 3`) to eliminate infinite loops and control token expenditure.
- **Type-Safe Schema Validation:** Fully defined using frozen Pydantic v2 data models (`CartItem`, `UserConstraints`, `Recommendation`, `CartState`).
- **Telemetry & Tracing:** Full tracing of agent reasoning steps, node-by-node latencies, and token consumption using LangSmith.
- **Session Diffing:** Frontend computes hash diffs on cart updates to avoid redundant LLM invocations.

---

## 🛠 Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, INR (₹) localization |
| **Backend API** | FastAPI, Uvicorn, Python 3.11+ |
| **Agent Orchestration** | LangGraph (`StateGraph`), LangChain Core |
| **LLM Reasoning** | Google Gemini 2.0 Flash / OpenAI GPT-4o-mini |
| **Vector Database** | ChromaDB (In-Memory singleton) |
| **Embeddings** | `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors) |
| **Observability** | LangSmith (`LANGCHAIN_TRACING_V2=true`) |
| **Validation & Testing** | Pydantic v2, Pytest (Unit & Mock Graph tests) |

---

## 📂 Project Structure

```
shopsmart-ui/
├── src/                        # React Frontend (Vite)
│   ├── components/             # Navbar, ProductCard, CartPanel, BudgetBar
│   ├── context/                # CartContext (State management & session diffing)
│   ├── data/                   # Display catalog formatted with INR (₹)
│   ├── pages/                  # ShopSmart dashboard & recommendation panels
│   └── services/               # agentService.js (FastAPI client with mock fallback)
├── backend/                    # Python Agentic Backend
│   ├── data/
│   │   └── catalog.json        # Curated 69-item product catalog across 16 categories
│   ├── src/
│   │   ├── agents/             # intent.py, retrieval.py, guardrail.py
│   │   ├── api/                # main.py (FastAPI REST endpoint /recommend)
│   │   ├── core/               # state.py (Pydantic models), graph.py (LangGraph definition)
│   │   └── tools/              # vector_store.py (ChromaDB), web_search.py (Tavily stub)
│   ├── tests/                  # test_state.py, test_graph.py (30 tests passing)
│   ├── pyproject.toml          # Python build and dependencies metadata
│   └── .env.example            # Environment variable template
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js `v18+` or `v20+` / `v24+`
- Python `3.11+`
- Google Gemini API Key
- LangSmith API Key (optional for telemetry)

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn langchain langgraph langchain-google-genai chromadb sentence-transformers pydantic python-dotenv pytest

# Configure environment variables
cp .env.example .env
```

Configure `backend/.env`:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key_here
LANGCHAIN_PROJECT=smart-cart-agent
```

Run tests to verify the state machine:

```bash
python -m pytest tests/ -v
```

Start the FastAPI server:

```bash
python -m uvicorn src.api.main:app --reload --port 8000
```

Interactive Swagger documentation will be live at: `http://localhost:8000/docs`

---

### 2. Frontend Setup

Open a second terminal window:

```bash
npm install --legacy-peer-deps
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Validated Scenarios

1. **Intent Inference:** Adding a camera body and microphone automatically classifies the intent as *"Vlogging / Content Creation Setup"* and prioritizes SD cards and spare batteries.
2. **Dynamic Budget Loop:** Setting a ₹25,000 budget cap with ₹24,200 already in the cart causes the guardrail agent to reject premium accessories, cycling back to retrieve complementary cleaning kits and lens caps under ₹800.
3. **Cart Deduplication:** Recommending accessories checks against existing cart item IDs to avoid offering duplicate purchases.

---

## 📄 Academic Context

This project was developed as part of the B.Tech Computer Science and Engineering curriculum (**Flexi Credit Course in Agentic AI & Automation**) at **Symbiosis Institute of Technology (SIT), Nagpur**.
