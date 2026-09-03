# NER Smart Logistics & Accessibility Intelligence Platform (SIH26002)

An AI-driven, terrain-aware, hybrid-data logistics and accessibility intelligence platform engineered specifically for the challenging topography of the **North Eastern Region (NER) of India** (Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, Sikkim).

---

## 1. System Architecture & Workload Allocation

```
                                  ┌────────────────────────────────────────┐
                                  │      React + Vite + Leaflet GIS        │
                                  │   Interactive Regional Topo Map UI     │
                                  └──────────────────┬─────────────────────┘
                                                     │
                                                     ▼
                                  ┌────────────────────────────────────────┐
                                  │       Spring Boot 3 REST Gateway       │
                                  │      Multi-DB Transaction Manager      │
                                  └───┬───────────────────────────────┬────┘
                                      │                               │
            ┌─────────────────────────▼────────┐           ┌──────────▼────────────────────────┐
            │     MySQL 8.0 (Relational ACID)  │           │   MongoDB 7.0 (Geospatial NoSQL)  │
            │  - User Accounts & RBAC Roles    │           │  - High-Velocity VehicleTelemetry │
            │  - NER Districts & Static Hubs   │           │  - 2dsphere AccessibilityIncident │
            │  - Warehouse Inventory Profiles  │           │  - Trip Trajectory RouteLogs      │
            └──────────────────────────────────┘           └───────────────────────────────────┘
                                      ▲                               ▲
                                      │                               │
                                  ┌───┴───────────────────────────────┴────┐
                                  │       FastAPI AI Microservice          │
                                  │  - Terrain Cost Function Routing       │
                                  │  - Geotechnical ML Landslide Engine    │
                                  │  - 2D Mountain Elevation Interpolator  │
                                  └────────────────────────────────────────┘
```

### Database Workload Allocation Rationale

| Database | Primary Entities | Key Technical Rationale |
|---|---|---|
| **MySQL 8.0 (ACID Relational)** | `User`, `Role`, `DistrictNER`, `Warehouse`, `LogisticsNode` | Strict ACID guarantees, foreign key relational integrity between administrative jurisdictions, warehouse inventory capacities, and multi-modal transit nodes (airports, river ports, railway sidings, border posts like Moreh/Dawki). |
| **MongoDB 7.0 (Geospatial & Time-Series)** | `VehicleTelemetry`, `RouteLog`, `AccessibilityIncident`, `LiveAlert` | Accommodates high-throughput telemetry streams (sub-second GPS packets, altitude, battery/fuel, engine health), `2dsphere` spatial indexing for localized proximity searches around mountain landslides and road collapses, and flexible JSON document formats. |

---

## 2. Key Modules & AI Engine Capabilities

### 🏔️ AI Terrain-Aware Predictive Routing Engine
Mountain logistics in the North East require more than standard 2D shortest-path algorithms. Our AI engine computes a dynamic cost function across the digital highway graph:

$$\text{Cost}(e) = d(e) \cdot \left(1 + \alpha \cdot \text{Gradient}(e) + \beta \cdot \text{HazardRisk}(e) + \gamma \cdot (1 - \text{RoadQuality}(e))\right)$$

- **Vehicle-Specific Constraints**: Restricts heavy commercial trucks (>16T) from steep inclines (>8% gradient) and critical landslide zones, while allowing 4x4 emergency vehicles or routing urgent medical supplies via cargo drones.
- **Dynamic Obstruction Avoidance**: Gathers active MongoDB accessibility incident logs (landslides at Sela Pass, road subsidences at Pagla Pahar, Sonapur mudslides) and generates weather-resilient alternate corridors in real-time.
- **2D Elevation Profiler**: Computes waypoint cross-sections, elevation gain, peak altitudes, and slope gradient distributions.

### 🔬 Geotechnical ML Hazard Predictor
Random Forest & Gradient Boosted regressor trained on Himalayan/Patkai geotechnical parameters (slope angle, 24h precipitation mm, soil pore-water saturation, deforestation index, and tectonic fault line distance) to predict road blockage probability and recommend safe speeds.

---

## 3. Tech Stack

- **Backend Gateway**: Spring Boot 3.3.3, Java 17/21, Spring Data JPA, Spring Data MongoDB, Spring Security (JWT), SpringDoc OpenAPI (Swagger 3), Lombok, Validation.
- **AI/ML Layer**: FastAPI (Python 3.13), Uvicorn, NetworkX, Scikit-Learn, NumPy, Pydantic v2.
- **Frontend Dashboard**: React 18, Vite, Tailwind CSS, Leaflet.js, React-Leaflet, Lucide Icons.
- **Databases**: MySQL 8.0 + MongoDB 7.0 with initialization scripts.

---

## 4. Running the Platform

### Option A: Local Development (Python AI + React UI)
To start the FastAPI AI engine and React Leaflet dashboard:

```bash
# 1. Start AI service and Frontend concurrently
./start.sh
```

- **Frontend Map & Dashboard**: [http://localhost:3000](http://localhost:3000)
- **FastAPI AI Docs & Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Option B: Full Stack Docker Compose (MySQL + MongoDB + Spring Boot + AI + React)
To spin up all five containers with pre-seeded North Eastern datasets and 2dsphere indexes:

```bash
docker compose up --build
```

- **Spring Boot OpenAPI Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Frontend**: [http://localhost:3000](http://localhost:3000)

---

## 5. API Endpoints Reference

### Spring Boot Gateway (`http://localhost:8080`)
- `POST /api/v1/auth/register` & `POST /api/v1/auth/login` - User Authentication
- `GET /api/v1/master/districts` - All 8 NER state districts
- `GET /api/v1/master/warehouses` - Regional warehouse & cold storage inventory
- `POST /api/v1/telemetry/stream` - High-velocity GPS coordinate ingestion
- `GET /api/v1/incidents/active` - Active road obstructions in NER
- `POST /api/v1/incidents` - Field obstruction report submission
- `POST /api/v1/routes/optimize` - AI terrain-resilient route planning

### FastAPI AI Engine (`http://localhost:8000`)
- `POST /api/v1/routing/optimize` - Multi-objective terrain routing & elevation profile
- `POST /api/v1/hazards/predict-risk` - Geotechnical landslide probability inference
- `GET /api/v1/network/nodes` - Digital North Eastern node network graph
