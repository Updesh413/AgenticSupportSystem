# 🚀 Agentic Support System

An advanced, AI-powered customer support ecosystem that leverages an autonomous AI agent to resolve customer queries by interacting with legacy systems via n8n workflows.

## 🏗️ Architecture Overview

This project is a decoupled full-stack application consisting of:

- **Frontend:** Next.js (TypeScript) with Tailwind CSS, authenticated via Clerk.
- **Backend:** Java Spring Boot microservice managing ticket lifecycles.
- **AI Layer:** LangChain4j integration with Google Gemini (or OpenAI) to create an autonomous Agentic AI.
- **Automation Layer:** n8n workflows acting as the bridge between the AI agent and legacy ERP/Database systems.

## ✨ Key Features

- **Autonomous Agentic AI:** The agent doesn't just chat; it *reasons*. It decides whether to check order status, initiate a refund, or escalate to a human.
- **Legacy System Integration:** Uses n8n as an abstraction layer to interact with older "legacy" APIs and databases safely.
- **Real-time Ticket Tracking:** Customers can watch the AI "think" and resolve their tickets in real-time.
- **Human-in-the-Loop:** When the AI detects complex issues, it automatically escalates the ticket to an Admin Dashboard for human intervention.
- **Secure Authentication:** OIDC-compliant auth using Clerk for both customers and administrators.

## 🛠️ Tech Stack

- **Frontend:** Next.js 15+, React 19, Tailwind CSS, Clerk Auth.
- **Backend:** Spring Boot 3.x, Spring Data JPA, Spring Security.
- **AI/LLM:** LangChain4j, Google Gemini / OpenAI.
- **Automation:** n8n (Workflow Automation).
- **Database:** PostgreSQL.
- **DevOps:** Docker, Docker Compose.

## 🚀 Quick Start

### Prerequisites
- Node.js & npm
- JDK 17+
- Docker & Docker Compose
- Clerk API Keys
- n8n instance (local or cloud)

### 1. Backend Setup
1. Configure your `src/main/resources/application.properties` with your Gemini API key and database credentials.
2. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

### 2. Frontend Setup
1. Navigate to the `client` directory.
2. Create a `.env.local` file (see `client/.env.local.example`).
3. Install dependencies and start:
   ```bash
   npm install
   npm run dev
   ```

### 3. Automation (n8n)
Import the JSON workflows located in the `/n8n-workflows` directory into your n8n instance.

## 🌐 Deployment

- **Backend:** Hosted on [Render](https://render.com) (connected to PostgreSQL).
- **Frontend:** Hosted on [Vercel](https://vercel.com).
- **Live Demo:** [https://agentic-support-system-inky.vercel.app/](https://agentic-support-system-inky.vercel.app/)

## 🛡️ Admin Access
The admin dashboard is restricted to users defined in the `NEXT_PUBLIC_ADMIN_EMAIL` environment variable. Admins can view all escalated tickets and provide final resolutions.

---
*Built with ❤️ to demonstrate the power of Agentic AI in Enterprise Support.*
