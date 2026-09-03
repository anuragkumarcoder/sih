// MongoDB 2dsphere Geospatial Index Initialization for NER Telemetry DB
const db = db.getSiblingDB("ner_telemetry_db");

// 1. Vehicle Telemetry Collection & Indexes
db.createCollection("vehicle_telemetry");
db.vehicle_telemetry.createIndex({ "location": "2dsphere" });
db.vehicle_telemetry.createIndex({ "vehicleId": 1, "timestamp": -1 });
db.vehicle_telemetry.createIndex({ "tripId": 1 });

// 2. Accessibility Incidents Collection & Indexes
db.createCollection("accessibility_incidents");
db.accessibility_incidents.createIndex({ "location": "2dsphere" });
db.accessibility_incidents.createIndex({ "active": 1, "severity": 1 });
db.accessibility_incidents.createIndex({ "incidentCode": 1 }, { unique: true });

// 3. Route Logs Collection & Indexes
db.createCollection("route_logs");
db.route_logs.createIndex({ "tripId": 1 }, { unique: true });
db.route_logs.createIndex({ "vehicleId": 1 });
db.route_logs.createIndex({ "departureTime": -1 });

// 4. Live Alerts Collection & Indexes
db.createCollection("live_alerts");
db.live_alerts.createIndex({ "epicentre": "2dsphere" });
db.live_alerts.createIndex({ "active": 1, "createdAt": -1 });

print("MongoDB 2dsphere geospatial and time-series indexes created successfully for ner_telemetry_db.");
