import networkx as nx
from typing import List, Dict, Any, Tuple, Optional
import math
from schemas import (
    RouteOptimizationRequest, RouteOptimizationResponse, OptimizedRoute,
    RouteSegment, LatLng, VehicleType, Severity, ElevationPoint
)
from ner_graph import build_ner_network_graph, NER_NODES, find_nearest_node, haversine_distance_km
from elevation_service import generate_elevation_profile, interpolate_polyline

class TerrainRouteOptimizer:
    def __init__(self):
        self.graph = build_ner_network_graph()

    def _calculate_edge_cost(
        self, u: str, v: str, edge_data: Dict[str, Any], req: RouteOptimizationRequest, strategy: str
    ) -> Tuple[float, float, List[str]]:
        """
        Calculates dynamic edge traversal cost and risk warnings.
        Cost incorporates Distance, Elevation Grade penalty, Precipitation Risk, and Active Incidents.
        """
        base_dist = edge_data["distance"]
        grade = edge_data["grade"]
        base_risk = edge_data["base_risk"]
        warnings = []
        
        # Weather influence
        rainfall = req.weather.rainfall_24h_mm if req.weather else 0.0
        rain_penalty = 1.0 + (rainfall / 100.0) * 0.8
        
        # Active incident check along segment
        incident_penalty = 1.0
        is_blocked = False
        is_detour = edge_data.get("is_detour", False)
        danger_key = edge_data.get("danger_key", None)
        edge_highway = edge_data.get("highway", "").upper()
        
        if req.active_incidents:
            for inc in req.active_incidents:
                if getattr(inc, "status", "ACTIVE") == "OFFICIAL_CLEARED":
                    continue

                inc_road = (getattr(inc, "road_name", "") or "").upper()
                inc_danger = (getattr(inc, "danger_key", "") or "").upper()
                inc_landmark = (getattr(inc, "landmark", "") or "").upper()

                # Bypass corridors (is_detour) remain open unless incident occurred explicitly on bypass
                if is_detour:
                    if inc_road and inc_road in edge_highway:
                        is_blocked = True
                        warnings.append(f"ROAD BLOCKED: Detour corridor {edge_highway} affected.")
                    continue

                # 1. Danger Key & Landmark Robust Matching
                if (danger_key and inc_danger and (inc_danger in danger_key.upper() or danger_key.upper() in inc_danger)) or \
                   (danger_key and inc_landmark and danger_key.upper() in inc_landmark) or \
                   (danger_key and inc_road and danger_key.upper() in inc_road) or \
                   ("SELA" in inc_danger and (u == "Sela_Pass" or v == "Sela_Pass")) or \
                   ("SONAPUR" in inc_danger and (danger_key == "SONAPUR_NH6" or (u == "Khliehriat" and v == "Silchar"))):
                    if req.vehicle_type == VehicleType.OFFROAD_4X4 and inc.passable_by_4x4:
                        incident_penalty += 2.5
                        warnings.append(f"Caution: {inc.hazard_type.value} on {u}-{v}, passable via 4x4 crawl.")
                    else:
                        is_blocked = True
                        warnings.append(f"ROAD BLOCKED: {inc.hazard_type.value} at {danger_key or u} ({u}➔{v}).")
                    break

                # 2. Highway / Corridor Name match (only if no specific danger_key assigned to edge)
                if not danger_key and inc_road and any(h in inc_road for h in edge_highway.split("_")):
                    if req.vehicle_type == VehicleType.OFFROAD_4X4 and inc.passable_by_4x4:
                        incident_penalty += 2.2
                        warnings.append(f"Caution: {inc.hazard_type.value} on {u}-{v}, passable via 4x4 crawl.")
                    else:
                        is_blocked = True
                        warnings.append(f"ROAD BLOCKED: {inc.hazard_type.value} on {edge_highway} ({u}➔{v}).")
                    break

                # 3. Spatial Proximity Collision (15.0km minimum mountain buffer)
                u_lat, u_lng = NER_NODES[u]["lat"], NER_NODES[u]["lng"]
                v_lat, v_lng = NER_NODES[v]["lat"], NER_NODES[v]["lng"]
                mid_lat = (u_lat + v_lat) / 2.0
                mid_lng = (u_lng + v_lng) / 2.0
                
                dist_to_mid = haversine_distance_km(inc.location.lat, inc.location.lng, mid_lat, mid_lng)
                dist_to_u = haversine_distance_km(inc.location.lat, inc.location.lng, u_lat, u_lng)
                dist_to_v = haversine_distance_km(inc.location.lat, inc.location.lng, v_lat, v_lng)
                min_geo_dist = min(dist_to_mid, dist_to_u, dist_to_v)

                effective_radius = max(15.0, getattr(inc, "impact_radius_km", 15.0))
                if min_geo_dist <= (effective_radius + (base_dist / 3.0)):
                    if inc.severity in [Severity.CRITICAL, Severity.HIGH]:
                        if req.vehicle_type == VehicleType.CARGO_DRONE:
                            incident_penalty += 1.0
                            warnings.append(f"Aerial Drone Corridor: Safe overflight above {inc.hazard_type.value} zone.")
                        elif req.vehicle_type == VehicleType.OFFROAD_4X4 and inc.passable_by_4x4:
                            incident_penalty += 2.2
                            warnings.append(f"Caution: {inc.hazard_type.value} on {u}-{v}, passable via 4x4 crawl.")
                        else:
                            is_blocked = True
                            warnings.append(f"ROAD BLOCKED: {inc.hazard_type.value} on {edge_highway} ({u}➔{v}).")
                    else:
                        incident_penalty += 1.8
                        warnings.append(f"Traffic hazard: {inc.hazard_type.value} reported along segment {u}-{v}.")

        # High altitude pass penalty
        elev_max = max(NER_NODES[u]["elevation"], NER_NODES[v]["elevation"])
        altitude_penalty = 1.0
        if req.avoid_high_altitude_passes and elev_max > 2500:
            altitude_penalty = 3.5

        # Vehicle specific terrain sensitivity
        grade_multiplier = 1.0
        if req.vehicle_type == VehicleType.HEAVY_COMMERCIAL:
            if grade > 8.0:
                grade_multiplier = 2.8
                warnings.append(f"Steep incline ({grade}% grade) on {edge_data['highway']}. Overheating risk for heavy trucks.")
        elif req.vehicle_type == VehicleType.LIGHT_ELECTRIC:
            if grade > 6.0:
                grade_multiplier = 2.0
                warnings.append(f"High gradient battery drain ({grade}% grade) on {edge_data['highway']}.")
        elif req.vehicle_type == VehicleType.OFFROAD_4X4:
            grade_multiplier = 1.05
        elif req.vehicle_type == VehicleType.CARGO_DRONE:
            grade_multiplier = 0.5

        # Composite dynamic cost
        if is_blocked:
            total_cost = 999999.0
        else:
            if strategy == "FASTEST_STANDARD":
                total_cost = base_dist * (1.0 + grade * 0.05)
            elif strategy == "AI_SAFE_TERRAIN":
                hazard_factor = base_risk * rain_penalty * incident_penalty
                total_cost = base_dist * (1.0 + (grade / 10.0) * grade_multiplier + hazard_factor * 2.5 + altitude_penalty - 1.0)
            elif strategy == "EMERGENCY_RELIEF":
                total_cost = base_dist * (1.0 + (base_risk * rain_penalty * 0.5))
            else:
                total_cost = base_dist

        segment_risk = min(1.0, (base_risk * rain_penalty * (incident_penalty if not is_blocked else 2.0)) / 2.0)
        return total_cost, segment_risk, warnings

    def _assemble_drone_route(
        self, origin_node: str, dest_node: str, req: RouteOptimizationRequest, name: str
    ) -> OptimizedRoute:
        """
        Calculates direct aerial cargo drone corridor.
        Drones fly direct straight-line air corridors over mountain ridges.
        """
        orig = NER_NODES[origin_node]
        dest = NER_NODES[dest_node]
        
        # Direct Great Circle Distance + 8% altitude clearance buffer
        direct_dist = round(haversine_distance_km(orig["lat"], orig["lng"], dest["lat"], dest["lng"]) * 1.08, 1)
        drone_speed_kmh = 95.0 # Cruising airspeed
        flight_duration_hours = round(direct_dist / drone_speed_kmh, 2)
        
        # Electric energy consumption (0.28 kWh per km)
        battery_kwh = round(direct_dist * 0.28, 1)
        
        polyline = interpolate_polyline(
            (orig["lat"], orig["lng"]),
            (dest["lat"], dest["lng"]),
            num_points=18
        )
        
        avg_elev = (orig["elevation"] + dest["elevation"]) / 2.0
        max_elev = max(orig["elevation"], dest["elevation"]) + 450.0 # Flight altitude AGL
        
        elevation_profile = [
            ElevationPoint(
                distance_km=round((i / 10.0) * direct_dist, 1),
                elevation_m=round(orig["elevation"] + (dest["elevation"] - orig["elevation"]) * (i / 10.0) + math.sin(i * 0.3) * 300, 0),
                gradient_percent=0.0,
                hazard_risk_score=0.02
            )
            for i in range(11)
        ]
        
        waypoints = [
            LatLng(lat=orig["lat"], lng=orig["lng"], name=f"{origin_node} Air Base", elevation_m=orig["elevation"]),
            LatLng(lat=(orig["lat"] + dest["lat"]) / 2.0, lng=(orig["lng"] + dest["lng"]) / 2.0, name="Aerial Mountain Waypoint", elevation_m=max_elev),
            LatLng(lat=dest["lat"], lng=dest["lng"], name=f"{dest_node} Helipad", elevation_m=dest["elevation"])
        ]
        
        segment = RouteSegment(
            from_node=origin_node,
            to_node=dest_node,
            distance_km=direct_dist,
            duration_minutes=round(flight_duration_hours * 60.0, 1),
            road_type="AERIAL_DRONE_CORRIDOR_VFR",
            surface_quality="Unrestricted Air Corridor (Cruise Alt 4,200m)",
            avg_grade_percent=0.0,
            landslide_risk_score=0.02,
            polyline=polyline
        )
        
        return OptimizedRoute(
            route_id=f"route_drone_{hash(origin_node + dest_node) % 100000}",
            name=name,
            strategy="AERIAL_AUTONOMOUS_DRONE",
            total_distance_km=direct_dist,
            estimated_duration_hours=flight_duration_hours,
            avg_elevation_m=round(avg_elev, 0),
            max_elevation_m=round(max_elev, 0),
            elevation_gain_m=round(abs(dest["elevation"] - orig["elevation"]), 0),
            max_gradient_percent=0.0,
            composite_risk_score=0.04,
            fuel_consumption_litres=0.0, # 100% Electric
            co2_emissions_kg=0.0, # Zero direct emissions
            passable=True,
            risk_warnings=[
                "Autonomous Flight Corridor: 100% immune to ground landslides and road blockages.",
                f"Battery Required: {battery_kwh} kWh (Cold-weather battery pre-heating active)."
            ],
            segments=[segment],
            elevation_profile=elevation_profile,
            waypoints=waypoints
        )

    def _assemble_route(
        self, path: List[str], req: RouteOptimizationRequest, strategy: str, name: str
    ) -> OptimizedRoute:
        if not path or len(path) < 2:
            orig = req.origin.name if req.origin.name in NER_NODES else "Guwahati"
            dest = req.destination.name if req.destination.name in NER_NODES else "Silchar"
            return self._assemble_drone_route(orig, dest, req, f"Emergency Aerial Relief Corridor ({orig} ➔ {dest})")

        if req.vehicle_type == VehicleType.CARGO_DRONE:
            return self._assemble_drone_route(path[0] if path else "Guwahati", path[-1] if path else "Tawang", req, name)

        segments: List[RouteSegment] = []
        total_dist = 0.0
        total_duration_min = 0.0
        all_warnings = []
        all_risks = []
        
        # Vehicle base speeds (km/h) on plains vs mountains
        base_speed = 60.0
        if req.vehicle_type == VehicleType.HEAVY_COMMERCIAL:
            base_speed = 42.0
        elif req.vehicle_type == VehicleType.OFFROAD_4X4:
            base_speed = 58.0
        elif req.vehicle_type == VehicleType.MEDIUM_COMMERCIAL:
            base_speed = 50.0
        elif req.vehicle_type == VehicleType.LIGHT_ELECTRIC:
            base_speed = 52.0
            
        for i in range(len(path) - 1):
            u, v = path[i], path[i+1]
            edge_data = self.graph[u][v]
            dist = edge_data["distance"]
            grade = edge_data["grade"]
            cost, seg_risk, warns = self._calculate_edge_cost(u, v, edge_data, req, strategy)
            all_warnings.extend(warns)
            all_risks.append(seg_risk)
            
            # Mountain elevation speed derating
            elev_u = NER_NODES[u]["elevation"]
            elev_v = NER_NODES[v]["elevation"]
            avg_elev = (elev_u + elev_v) / 2.0
            
            if req.vehicle_type == VehicleType.OFFROAD_4X4:
                speed_factor = 0.82 if avg_elev > 1500 else 0.94
                effective_speed = max(28.0, base_speed * speed_factor * (1.0 - grade / 30.0))
            elif req.vehicle_type == VehicleType.HEAVY_COMMERCIAL:
                speed_factor = 0.55 if avg_elev > 1500 else 0.75
                effective_speed = max(18.0, base_speed * speed_factor * (1.0 - grade / 15.0))
            else:
                speed_factor = 0.68 if avg_elev > 1500 else 0.85
                effective_speed = max(22.0, base_speed * speed_factor * (1.0 - grade / 20.0))
                
            dur_minutes = (dist / effective_speed) * 60.0
            
            polyline = interpolate_polyline(
                (NER_NODES[u]["lat"], NER_NODES[u]["lng"]),
                (NER_NODES[v]["lat"], NER_NODES[v]["lng"])
            )
            
            segments.append(RouteSegment(
                from_node=u,
                to_node=v,
                distance_km=dist,
                duration_minutes=round(dur_minutes, 1),
                road_type=edge_data["highway"],
                surface_quality=edge_data["quality"],
                avg_grade_percent=grade,
                landslide_risk_score=round(seg_risk, 2),
                polyline=polyline
            ))
            total_dist += dist
            total_duration_min += dur_minutes

        elevation_profile, stats = generate_elevation_profile(path, total_dist)
        
        # Fuel computation based on vehicle class
        if req.vehicle_type == VehicleType.HEAVY_COMMERCIAL:
            base_consumption = 32.0 # Litres / 100km for 16T truck
        elif req.vehicle_type == VehicleType.OFFROAD_4X4:
            base_consumption = 11.5 # Litres / 100km for 4x4
        else:
            base_consumption = 18.0 # Litres / 100km for medium truck
            
        elev_fuel_factor = 1.0 + (stats["elevation_gain"] / 4000.0) * 0.45
        fuel_litres = round((total_dist / 100.0) * base_consumption * elev_fuel_factor, 1)
        co2_kg = round(fuel_litres * 2.68, 1)
        
        composite_risk = round(float(sum(all_risks) / len(all_risks)) if all_risks else 0.1, 2)
        is_passable = not any("ROAD BLOCKED" in w for w in all_warnings)
        
        waypoints = [
            LatLng(lat=NER_NODES[n]["lat"], lng=NER_NODES[n]["lng"], name=n, elevation_m=NER_NODES[n]["elevation"])
            for n in path
        ]

        return OptimizedRoute(
            route_id=f"route_{strategy.lower()}_{hash(''.join(path)) % 100000}",
            name=name,
            strategy=strategy,
            total_distance_km=round(total_dist, 1),
            estimated_duration_hours=round(total_duration_min / 60.0, 2),
            avg_elevation_m=stats["avg_elevation"],
            max_elevation_m=stats["max_elevation"],
            elevation_gain_m=stats["elevation_gain"],
            max_gradient_percent=stats["max_gradient"],
            composite_risk_score=composite_risk,
            fuel_consumption_litres=fuel_litres,
            co2_emissions_kg=co2_kg,
            passable=is_passable,
            risk_warnings=list(dict.fromkeys(all_warnings)),
            segments=segments,
            elevation_profile=elevation_profile,
            waypoints=waypoints
        )

    def optimize_route(self, req: RouteOptimizationRequest) -> RouteOptimizationResponse:
        origin_node = req.origin.name if req.origin.name in NER_NODES else find_nearest_node(req.origin.lat, req.origin.lng)
        dest_node = req.destination.name if req.destination.name in NER_NODES else find_nearest_node(req.destination.lat, req.destination.lng)

        # If vehicle is CARGO_DRONE, assemble direct air corridor
        if req.vehicle_type == VehicleType.CARGO_DRONE:
            drone_route = self._assemble_drone_route(origin_node, dest_node, req, f"Autonomous Drone Flight Corridor ({origin_node} ➔ {dest_node})")
            return RouteOptimizationResponse(
                status="SUCCESS",
                origin_name=origin_node,
                destination_name=dest_node,
                recommended_route=drone_route,
                alternative_routes=[],
                weather_summary={
                    "rainfall_24h_mm": req.weather.rainfall_24h_mm if req.weather else 0.0,
                    "is_monsoon_active": req.weather.is_monsoon_active if req.weather else False,
                    "regional_humidity": "88% (High Hill Moisture)"
                },
                active_hazard_count=0
            )

        # Build custom weighted graphs for each strategy
        def make_weight_func(strategy: str):
            def weight_calculator(u, v, d):
                cost, _, _ = self._calculate_edge_cost(u, v, d, req, strategy)
                return cost
            return weight_calculator

        # 1. Primary AI Safe Mountain Route
        try:
            safe_path = nx.shortest_path(self.graph, origin_node, dest_node, weight=make_weight_func("AI_SAFE_TERRAIN"))
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            safe_path = [origin_node, dest_node] if origin_node == dest_node else []

        # 2. Standard Shortest Route
        try:
            std_path = nx.shortest_path(self.graph, origin_node, dest_node, weight=make_weight_func("FASTEST_STANDARD"))
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            std_path = safe_path

        # 3. Emergency Relief / Alternative Detour Path
        alt_paths = []
        try:
            generator = nx.shortest_simple_paths(self.graph, origin_node, dest_node, weight=make_weight_func("EMERGENCY_RELIEF"))
            count = 0
            for p in generator:
                if p != safe_path and p != std_path:
                    alt_paths.append(p)
                    count += 1
                if count >= 2:
                    break
        except Exception:
            pass

        vehicle_title = "4x4 Emergency Utility" if req.vehicle_type == VehicleType.OFFROAD_4X4 else "Heavy Commercial Freight"
        rec_route = self._assemble_route(safe_path, req, "AI_SAFE_TERRAIN", f"AI Optimized {vehicle_title} Corridor ({origin_node} ➔ {dest_node})")
        
        alternatives = []
        if std_path != safe_path:
            alternatives.append(self._assemble_route(std_path, req, "FASTEST_STANDARD", f"Standard Highway Route ({origin_node} ➔ {dest_node})"))
            
        for idx, alt in enumerate(alt_paths):
            alternatives.append(self._assemble_route(alt, req, "EMERGENCY_RELIEF", f"Emergency Relief Detour {idx+1} ({origin_node} ➔ {dest_node})"))

        if not alternatives and std_path == safe_path:
            alternatives.append(self._assemble_route(std_path, req, "FASTEST_STANDARD", f"Standard Direct Route ({origin_node} ➔ {dest_node})"))

        return RouteOptimizationResponse(
            status="SUCCESS",
            origin_name=origin_node,
            destination_name=dest_node,
            recommended_route=rec_route,
            alternative_routes=alternatives,
            weather_summary={
                "rainfall_24h_mm": req.weather.rainfall_24h_mm if req.weather else 0.0,
                "is_monsoon_active": req.weather.is_monsoon_active if req.weather else False,
                "regional_humidity": "88% (High Hill Moisture)"
            },
            active_hazard_count=len(req.active_incidents) if req.active_incidents else 0
        )

# Global singleton instance
route_optimizer_engine = TerrainRouteOptimizer()
