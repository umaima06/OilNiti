# OilNiti 🇮🇳
### India's First Policy Conscience Machine for Edible Oil Tariff Decisions

> Built for SummerSaaS 2026 — Open Innovation Track | Team: Umaima & Amena

---

## What is OilNiti?

Every year, India's Finance Ministry changes one number — the palm oil import duty.
That one number affects 1.8 crore oilseed farmers AND 140 crore consumers simultaneously.
Until now, no tool showed both sides of that decision in real time.

OilNiti is India's first AI policy simulator that shows the **human cost** of edible oil
tariff decisions — at the state level, at the household level, for farmers AND consumers.

---

## The Massive Differentiator

Every existing tool (UN TINA, World Bank ATPSM) answers:
> "How does trade volume change?"

OilNiti answers:
> "Which specific Indian gets hurt, by how much, and in which state?"

---

## Project Structure
oilniti/
├── backend/
│   ├── data/
│   │   ├── duty_history.csv          # CPO/RPO duty changes 2014-2025
│   │   ├── state_oil_prices.csv      # Retail prices + farmer/consumer data, 19 states
│   │   └── elasticities.csv          # Price elasticities from ICAR/NITI Aayog
│   ├── models/
│   │   └── causal_engine.py          # Structural causal inference engine
│   ├── routes/                       # (Day 2+)
│   ├── utils/
│   │   ├── backtester.py             # Sept 2024 real-event validation
│   │   └── impact_calculator.py      # Standalone farmer/consumer impact functions
│   ├── main.py                       # FastAPI server + all endpoints
│   ├── .env                          # API keys (gitignored)
│   └── requirements.txt
└── frontend/                         # React dashboard (Day 2)

---

## Installation & Setup

### 1. Backend Setup

#### Prerequisites
- Python 3.10+
- VS Code

#### Installation

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

#### Environment Variables

Create `backend/.env`:
GROQ_API_KEY=your_groq_api_key_here
Get your free Groq API key at: https://console.groq.com

#### Run the server

```bash
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

### 2. Frontend Setup

#### Prerequisites
- Node.js 18+

#### Installation

```bash
cd frontend
npm install
```

**Dependencies Included:**
- `react`, `react-dom` — Core React framework
- `@tailwindcss/vite`, `tailwindcss` — Utility-first styling (v4)
- `recharts` — Price trajectory visualizations
- `react-simple-maps`, `topojson-client` — India choropleth map rendering

#### Run the dashboard

```bash
npm run dev
```

The OilNiti dashboard will be available at: http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/simulate` | Run tariff simulation, returns full state-level impact |
| GET | `/states` | All 19 state baseline data |
| GET | `/backtest` | Sept 2024 model validation results |
| GET | `/scenarios` | 4 preset shock scenarios |
| POST | `/generate-report` | AI policy brief via Groq LLaMA 3.1 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| Core Model | Structural Causal Inference (NumPy + Pandas) |
| AI Reports | Groq API — LLaMA 3.1-8b-instant (Free) |
| Frontend | React + Recharts + Tailwind (Day 2) |
| Maps | react-simple-maps India GeoJSON (Day 2) |
| Deploy | Vercel + Railway (Day 4) |

---

## Model Methodology

OilNiti uses a **3-equation structural causal model** — not a black-box ML model.
This makes it transparent, auditable, and defensible to policymakers.

1. **Price equation**: Domestic price change = f(duty delta × pass-through rate + global shock)
2. **Trade equation**: Import volume change = f(price change × import elasticity)
3. **Substitution equation**: Cross-oil price change = f(palm price change × substitution coefficient)

Elasticities sourced from: ICAR 2022, NITI Aayog 2021, SEA India 2023, RBI Working Paper 2023.

**Backtested against September 2024 CPO duty hike** (5% → 27.5%): model error < 15%.

---

## Data Sources

- Department of Consumer Affairs — state-wise daily retail oil prices
- NSO Situation Assessment Survey 2019 — farmer household income by state  
- NSSO Household Consumption Expenditure Survey 2022-23 — oil spend by income decile
- SEA India — import duty history 2014-2025
- MPOB Malaysia — global CPO benchmark prices
- ICAR / NITI Aayog — price elasticity parameters