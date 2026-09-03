# 🏔️ North Eastern Region (NER) Smart Logistics & AI Detour Platform
## Complete Project Summary, Technical Specs & Source Code for Gemini

---

### 1. Executive Summary & Problem Statement
* **Theme**: Smart India Hackathon (SIH 2026) - Mountain Logistics & Disaster Resilience.
* **Problem**: The 8 North Eastern States of India (Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, Sikkim) face frequent mountain highway blockages due to monsoon landslides, flash floods, snow blizzards, and rockfalls (e.g., Sonapur Tunnel on NH-6, Sela Pass on NH-13, Pagla Pahar on NH-29). This isolates entire states and endangers life-saving cold-chain medical consignments (vaccines, blood plasma, anti-venom).
* **Solution**: A multi-modal, resilient accessibility platform integrating:
  1. **Real-time In-Cabin Field Driver GPS Navigation HUD** with Web Speech API voice prompts, slope inclinometer, and 1-touch hazard reporting.
  2. **Dynamic AI Detour Pathfinding Engine** that monitors mountain blockages and autonomously detours convoys (e.g., Sonapur blocked ➔ Dawki NH-206 bypass; Sela Pass blocked ➔ Sangti 4x4 track; Teesta blocked ➔ Lava NH-717A).
  3. **8 Mountain Sensitive Zones Simulation Matrix** for Admin & BRO disaster control teams.
  4. **Cold-Chain Medical Telemetry & Autonomous Cargo Drone Airlift** rescue module.

---

### 2. Multi-Tier Tech Stack
* **Frontend**: React 18, Vite 5.4, TailwindCSS, Lucide Icons, Leaflet / React-Leaflet, Canvas-confetti, Web Speech API (TTS).
* **Enterprise Backend**: Java 21, Spring Boot 3.x, Spring Security 6 (Stateless JWT RBAC), Hibernate/JPA, PostgreSQL 16 + PostGIS.
* **AI Microservice**: Python 3.11, FastAPI, NetworkX (Dijkstra Shortest Path with Terrain/Hazard Impedance Weights), Uvicorn.

---

### 3. Role-Based Information Architecture (RBAC)
1. **🏔️ Field Driver (`ROLE_FIELD_DRIVER`)**:
   - Clean, distraction-free in-cabin GPS turn-by-turn navigation HUD.
   - Digital telemetry cluster (Speedometer, Inclinometer, Altitude, Cold-Chain temp, Fuel).
   - 1-Touch `[Report Blockage]` transponder and `[Emergency SOS]`.
2. **🚧 BRO Inspector (`ROLE_BRO_INSPECTOR`)**:
   - Official blockage certification and clearance timeline governance queue.
   - 8 Mountain Sensitive Zones verification matrix (`[Clear]` / `[Block]`).
3. **🧭 Regional Logistics Dispatcher (`ROLE_DISPATCHER`)**:
   - Multi-convoy fleet tracking, modal split (Truck, 4x4, Drone), and Cold-Chain monitoring.
4. **🏛️ DoNER Central Admin (`ROLE_ADMIN`)**:
   - Master strategic command, disaster simulation, and infrastructure analytics.

---

### 4. 8 Strategic Mountain Sensitive Zones & Verified Detours
1. **Sonapur Tunnel / Mudslide Zone (`NH-6`, Meghalaya ➔ Assam, 1,120m)**:
   - *Detour*: AI detours freight via **NH-206 Dawki River Bypass** (+8 km, avoids 4.5h delay).
2. **Sela Pass Alpine Corridor (`NH-13`, Arunachal, 4,170m)**:
   - *Detour*: Diverts high-clearance units via **Sangti Valley 4x4 Track**.
3. **Pagla Pahar Landslide Gorge (`NH-29`, Dimapur ➔ Kohima, 1,260m)**:
   - *Detour*: Routes via **Peducha / Zubza Bypass (98 km)**.
4. **Teesta River Gorge Corridor (`NH-10`, Siliguri ➔ Gangtok, 420m)**:
   - *Detour*: Routes heavy freight via **Lava & Gorubathan (NH-717A, 157 km)**.
5. **Jatinga Hills Mahasadak (`NH-27`, Assam, 960m)**:
   - *Detour*: Intermodal transshipment via Lumding railhead.
6. **Nathu La Alpine Frontier Pass (`SH-3`, Sikkim, 4,310m)**:
   - *Detour*: Autonomous VTOL cargo drone airlift corridor.
7. **Lokchao Bridge / Tengnoupal (`NH-102`, Manipur Border, 1,420m)**:
   - *Detour*: Winch-assisted 4x4 hill track.
8. **Bualpui Ridge (`NH-54`, Mizoram, 1,290m)**:
   - *Detour*: Soil moisture-monitored alternate ridge highway.

---

### 5. Frontend & Routing Code Reference
* **Routing Algorithm (`frontend/src/utils/nerRoutingEngine.js`)**:
  - Implements Dijkstra graph search with terrain slope impedance: `weight = base_distance * (1 + max(0, grade - 5) * 0.08) * detour_multiplier`.
  - Active verified incidents apply `+99999` penalty to blocked trunk corridors while designated bypasses (`isDetour: true`) remain open to rescue convoys.
* **In-Cabin Driver GPS Navigator (`frontend/src/components/DriverNavigationHUD.jsx`)**:
  - 3D vehicle following map, Web Speech API audio announcements, real-time detour morphing.
* **AI Sensitive Zones Simulator (`frontend/src/components/AIMissionSimulatorHelpbox.jsx`)**:
  - Dynamically filters sensitive zones on the active convoy's route and provides 1-click disaster simulation.
