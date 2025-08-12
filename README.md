
# BloomTrade
<p align="center">
  <!-- React -->
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React" width="60" height="60" style="margin:10px;">
  
  <!-- Fastify -->
  
  <img src="https://raw.githubusercontent.com/Tarun2605/DarkBloomTrading/refs/heads/main/assets/fastify-icon-svgrepo-com%20(1).svg?token=GHSAT0AAAAAADJAQEBDU5FEGBACXNBGSDUS2E3PSOA" alt="Fastify" width="60" height="60" style="margin:10px;">
  
  <!-- FastAPI -->
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/fastapi/fastapi-original.svg" alt="FastAPI" width="60" height="60" style="margin:10px;">
  
  <!-- PostgreSQL -->
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="60" height="60" style="margin:10px;">
  
  <!-- MongoDB -->
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg" alt="MongoDB" width="60" height="60" style="margin:10px;">
  
  <!-- Redis -->
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/redis/redis-original.svg" alt="Redis" width="60" height="60" style="margin:10px;">
  
  <!-- Kafka -->
  <img src="https://raw.githubusercontent.com/Tarun2605/DarkBloomTrading/refs/heads/main/assets/kafka-svgrepo-com%20(1).svg?token=GHSAT0AAAAAADJAQEBCGXY3DEDSXBAEJAB42E3PS5Q" alt="Kafka" width="60" height="60" style="margin:10px;">
  
  <!-- Docker -->
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" alt="Docker" width="60" height="60" style="margin:10px;">
  
  <!-- LangChain -->
  <img src="https://avatars.githubusercontent.com/u/126733545?s=200&v=4" alt="LangChain" width="60" height="60" style="margin:10px;">
  
  <!-- gRPC -->
  <img src="https://grpc.io/img/logos/grpc-icon-color.png" alt="gRPC" width="60" height="60" style="margin:10px;">
  
  <!-- Python -->
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python" width="60" height="60" style="margin:10px;">


</p>


---
**BloomTrade** is a **stock trading platform simulator** built with a **ReactJS frontend** and a **microservices-based backend** using **Fastify** (Node.js) and **FastAPI** (Python).
It also integrates **LangChain** to provide an AI-powered trading assistant.

---

## 🚀 Features

* **Stock Trading Simulation** – Create, view, and execute simulated stock trades.
* **Microservices Architecture** – Modular backend services for authentication, bank accounts, and stock management.
* **AI Assistant** – LangChain-powered assistant for stock analysis and market insights.
* **Event Streaming** – Kafka & Zookeeper for real-time communication between services.
* **Persistent Storage** – PostgreSQL for relational data.
* **Caching & Messaging** – Redis for fast in-memory storage and message passing.
* **Developer Tools** – Debug dashboards for PostgreSQL, Redis, and Kafka.
* **Fast Microservice Communication** - Blazing fast communication between microservices using GRPC.
* **Real Time Streaming** - Seamless realtime streaming of thousands of stock events using websockets and optimised Frontend Practices. 
---

## 🐳 Docker Services

The project runs with the following containers:

| Service                    | Port(s)               | Purpose              |
| -------------------------- | --------------------- | -------------------- |
| **PostgreSQL**             | 5432                  | Relational database  |
| **Redis**                  | 6379                  | Caching & pub/sub    |
| **Zookeeper**              | 2181                  | Kafka coordination   |
| **Kafka**                  | 9092                  | Event streaming      |
| **pgAdmin** *(debug)*      | 5050                  | PostgreSQL dashboard |
| **RedisInsight** *(debug)* | 5540                  | Redis dashboard      |


---

## ⚡ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/bloomtrade.git
cd bloomtrade/web
```

### 2️⃣ Start Docker Services

```bash
docker-compose up -d
```

### 3️⃣ Run Backend & Frontend

Use the **Makefile** command to start all microservices:

```bash
make run_all_tabs
```

This will:

* Start **Fastify services** (`auth`, `bank-account`, `stock`) on Ports 3001, 3002, 3003
* Start **FastAPI AI assistant** on Port 6081
* Start **ReactJS frontend**   on Port 3000

---

## 🛠 Development Notes

* **Fastify** handles API endpoints for trading logic.
* **FastAPI** runs the AI assistant (LangChain integration).
* **Kafka** enables real-time event updates (e.g., stock trades, bank transactions).
* **Redis** caches frequent queries and handles pub/sub for service communication.
* **MinIO** stores non-relational assets like reports and images.

---
WATCH THE DEMO VIDEO
[![Watch the demo](https://img.youtube.com/vi/tAMj-6gUjSM/maxresdefault.jpg)](https://youtu.be/tAMj-6gUjSM)


---



