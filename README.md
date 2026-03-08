# Agentic Travel Intelligence Platform

![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Groq](https://img.shields.io/badge/LLM-Groq%20Llama3-orange)
![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%7C%20Render-purple)

A full-stack **Data Engineering + AI Analytics platform** that analyzes global travel destinations and provides **budget insights, weather intelligence, and AI-powered travel recommendations**.

The platform integrates **data pipelines, analytics APIs, an interactive dashboard, and an LLM-powered travel assistant** to help users evaluate international travel options based on cost and affordability.

---

# Live Application

### Frontend Dashboard
https://agentic-travel-eight.vercel.app

### Backend API Documentation
https://travel-intelligence-backend.onrender.com/docs

---

# Project Motivation

Planning international travel involves evaluating multiple factors such as:

- flight costs  
- hotel prices  
- currency exchange rates  
- weather conditions  
- overall destination affordability  

Most existing travel platforms provide fragmented information and require users to manually compare multiple sources.

The goal of this project is to build a **centralized analytics platform** that aggregates travel-related data and presents it through an interactive dashboard and an AI-powered assistant.

The system enables users to quickly identify **which destinations offer the best value for their trip duration and budget**.

---

# Core Features

## Travel Budget Analytics

The platform estimates the total travel budget across several major global destinations.

**Destinations currently included**

- New York  
- London  
- Tokyo  
- Sydney  

The system calculates estimated travel costs using:

- flight estimates  
- hotel pricing assumptions  
- daily expense estimates  
- currency exchange rates  

These metrics allow users to easily compare destinations.

---

## Dynamic Trip Duration

Users can modify the **trip duration between 3 and 10 days**.

All analytics and cost estimates automatically update when the duration changes.

This demonstrates how analytics APIs dynamically recompute results based on user input.

---

## Destination Filtering

Users can select specific destinations to compare.

Example comparisons:

- London vs Tokyo  
- Sydney vs New York  

The dashboard updates in real time and recalculates summary analytics.

---

## AI Travel Assistant

The application includes an **LLM-powered travel assistant** that answers natural language questions.

Example queries:

- Which destination is cheapest for a 5-day trip?  
- Compare travel costs between London and Tokyo.  
- Which city offers the best value for a 7-day trip?

The assistant combines **structured analytics data with natural language reasoning**.

**LLM Provider:** Groq (Llama-3)

---

## Interactive Analytics Dashboard

The frontend provides an analytics dashboard built with **Next.js and Chart.js**.

Key components include:

- destination summary cards  
- travel budget comparison charts  
- destination filters  
- dynamic analytics updates  

This allows users to visually compare travel affordability.

---

## Backend Data Pipeline Monitoring

The platform includes a **pipeline monitor page** displaying backend ingestion activity and pipeline status.

This demonstrates **observability and transparency for backend services**.

---

# System Architecture

The application follows a layered architecture separating frontend, backend services, database, and AI inference.

```
Frontend (Next.js Dashboard)
        │
        ▼
FastAPI Backend API
        │
        ▼
PostgreSQL Database (Neon)
        │
        ▼
Groq LLM Agent (Llama-3)
```

---

# Deployment Architecture

```
Frontend → Vercel
Backend → Render
Database → Neon PostgreSQL
AI Model → Groq Llama-3
```

This architecture enables a fully cloud-hosted platform using modern serverless infrastructure.

---

# Technology Stack

## Frontend

- Next.js  
- React  
- TailwindCSS  
- Chart.js  

The frontend provides an interactive dashboard with dynamic charts and filters.

---

## Backend

- FastAPI  
- Python  
- SQLAlchemy  

The backend exposes REST APIs for analytics, travel insights, and AI interaction.

---

## Database

**PostgreSQL (Neon)**

The database stores:

- destination reference data  
- exchange rates  
- weather indicators  
- travel cost estimates  

---

## AI Integration

- Groq API  
- Llama-3 model  

The LLM enhances the platform by interpreting analytics data and generating natural language responses.

---

## Infrastructure & Deployment

- Docker  
- Render (backend hosting)  
- Vercel (frontend hosting)  
- Neon (cloud PostgreSQL database)

---

# API Endpoints

## Health Check

```
GET /health
```

Returns the API status.

---

## Destination Summary

```
GET /api/destinations/summary
```

Returns summary analytics for dashboard cards.

---

## Budget Comparison

```
GET /api/budget/compare
```

Returns structured data used to generate travel comparison charts.

---

## AI Travel Agent

```
POST /api/agent/query
```

Example request:

```json
{
  "query": "Which destination is cheapest for a 7-day trip?"
}
```

The backend sends structured analytics data to the LLM and generates a natural language response.

---

# Project Structure

```
agentic-travel-intelligence
│
├── backend
│   ├── app
│   │   ├── api
│   │   ├── core
│   │   ├── models
│   │   ├── services
│   │   └── main.py
│   │
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend
│   ├── app
│   ├── components
│   ├── styles
│   └── package.json
│
└── README.md
```

---

# Running the Project Locally

## Clone the repository

```bash
git clone https://github.com/charan4899/agentic-travel-intelligence.git
```

---

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# Environment Variables

## Backend

```
DATABASE_URL=your_neon_database_url
GROQ_API_KEY=your_groq_api_key
```

---

## Frontend

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

# Example AI Queries

Example prompts users can ask:

- Which destination is cheapest for a 5-day trip?  
- Compare London and Tokyo travel costs.  
- Which destination provides the best value overall?

The system converts **structured analytics into natural language insights**.

---

# Future Enhancements

Potential improvements include:

- Real-time flight price ingestion  
- Kafka streaming pipelines for travel data  
- Airflow ETL scheduling  
- Machine learning models for travel cost prediction  
- Vector search for travel recommendations  

---

# Author

**Sai Charan Gandi**

