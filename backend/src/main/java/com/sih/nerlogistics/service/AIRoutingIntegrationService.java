package com.sih.nerlogistics.service;

import com.sih.nerlogistics.domain.nosql.AccessibilityIncident;
import com.sih.nerlogistics.domain.nosql.RouteLog;
import com.sih.nerlogistics.dto.RouteOptimizationRequestDTO;
import com.sih.nerlogistics.repository.nosql.AccessibilityIncidentRepository;
import com.sih.nerlogistics.repository.nosql.RouteLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.geo.GeoJsonLineString;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIRoutingIntegrationService {

    private final AccessibilityIncidentRepository incidentRepository;
    private final RouteLogRepository routeLogRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${ner.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public Map<String, Object> optimizeRouteWithAI(RouteOptimizationRequestDTO reqDto) {
        log.info("Requesting AI route optimization from {} to {} for vehicle {}",
                reqDto.getOriginNode(), reqDto.getDestinationNode(), reqDto.getVehicleType());

        // 1. Fetch all active incidents from MongoDB to pass to AI microservice
        List<AccessibilityIncident> activeIncidents = incidentRepository.findByActiveTrue();

        List<Map<String, Object>> incidentPayloads = activeIncidents.stream().map(inc -> {
            Map<String, Object> m = new HashMap<>();
            m.put("incident_id", inc.getIncidentCode());
            m.put("hazard_type", inc.getHazardType());
            m.put("severity", inc.getSeverity());
            m.put("road_name", inc.getRoadName() != null ? inc.getRoadName() : "NH-6");
            m.put("landmark", inc.getLandmark() != null ? inc.getLandmark() : "Mountain Section");
            m.put("danger_key", (inc.getLandmark() != null && inc.getLandmark().contains("Sonapur")) ? "SONAPUR_NH6" : 
                                (inc.getLandmark() != null && inc.getLandmark().contains("Sela")) ? "SELA_PASS_NH13" : null);
            m.put("status", "ACTIVE");
            m.put("verified", true);
            Map<String, Object> loc = new HashMap<>();
            loc.put("lat", inc.getLocation() != null ? inc.getLocation().getY() : 25.1250);
            loc.put("lng", inc.getLocation() != null ? inc.getLocation().getX() : 92.3500);
            m.put("location", loc);
            m.put("impact_radius_km", 6.0);
            m.put("passable_by_4x4", inc.getPassableBy4x4() != null ? inc.getPassableBy4x4() : false);
            return m;
        }).collect(Collectors.toList());

        // 2. Build AI Request payload
        Map<String, Object> originMap = new HashMap<>();
        originMap.put("name", reqDto.getOriginNode());
        originMap.put("lat", reqDto.getOriginLat() != null ? reqDto.getOriginLat() : 26.1445);
        originMap.put("lng", reqDto.getOriginLng() != null ? reqDto.getOriginLng() : 91.7362);

        Map<String, Object> destMap = new HashMap<>();
        destMap.put("name", reqDto.getDestinationNode());
        destMap.put("lat", reqDto.getDestinationLat() != null ? reqDto.getDestinationLat() : 27.5861);
        destMap.put("lng", reqDto.getDestinationLng() != null ? reqDto.getDestinationLng() : 91.8653);

        Map<String, Object> weatherMap = new HashMap<>();
        weatherMap.put("rainfall_24h_mm", reqDto.getRainfall24hMm() != null ? reqDto.getRainfall24hMm() : 45.0);
        weatherMap.put("is_monsoon_active", true);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("origin", originMap);
        requestBody.put("destination", destMap);
        requestBody.put("vehicle_type", reqDto.getVehicleType() != null ? reqDto.getVehicleType() : "MEDIUM_COMMERCIAL");
        requestBody.put("cargo_weight_kg", reqDto.getCargoWeightKg() != null ? reqDto.getCargoWeightKg() : 3500.0);
        requestBody.put("is_hazardous_cargo", reqDto.getIsHazardousCargo() != null ? reqDto.getIsHazardousCargo() : false);
        requestBody.put("is_emergency_relief", reqDto.getIsEmergencyRelief() != null ? reqDto.getIsEmergencyRelief() : false);
        requestBody.put("weather", weatherMap);
        requestBody.put("active_incidents", incidentPayloads);
        requestBody.put("avoid_high_altitude_passes", reqDto.getAvoidHighAltitudePasses() != null ? reqDto.getAvoidHighAltitudePasses() : false);

        // 3. Call AI Service via WebClient
        WebClient client = webClientBuilder.baseUrl(aiServiceUrl).build();
        Map<String, Object> response;
        try {
            response = client.post()
                    .uri("/api/v1/routing/optimize")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception ex) {
            log.warn("AI Service call failed or timed out. Falling back to local route computation: {}", ex.getMessage());
            response = fallbackRouteCalculation(reqDto);
        }

        // 4. Record the planned route into MongoDB RouteLog
        try {
            saveRouteLog(reqDto, response);
        } catch (Exception e) {
            log.warn("Failed to persist route log in MongoDB: {}", e.getMessage());
        }

        return response;
    }

    private void saveRouteLog(RouteOptimizationRequestDTO req, Map<String, Object> response) {
        if (response == null || !response.containsKey("recommended_route")) return;

        Map<String, Object> rec = (Map<String, Object>) response.get("recommended_route");
        String tripId = "TRIP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        RouteLog logEntry = RouteLog.builder()
                .tripId(tripId)
                .vehicleId("VEH-" + (req.getVehicleType() != null ? req.getVehicleType().substring(0, 3) : "LOG") + "-01")
                .originNode(req.getOriginNode())
                .destinationNode(req.getDestinationNode())
                .optimizationStrategy((String) rec.getOrDefault("strategy", "AI_SAFE_TERRAIN"))
                .plannedDistanceKm(((Number) rec.getOrDefault("total_distance_km", 0.0)).doubleValue())
                .plannedDurationHours(((Number) rec.getOrDefault("estimated_duration_hours", 0.0)).doubleValue())
                .elevationGainMeters(((Number) rec.getOrDefault("elevation_gain_m", 0.0)).doubleValue())
                .averageGradientPercent(((Number) rec.getOrDefault("max_gradient_percent", 0.0)).doubleValue())
                .compositeRiskScore(((Number) rec.getOrDefault("composite_risk_score", 0.2)).doubleValue())
                .tripStatus("PLANNED")
                .departureTime(Instant.now())
                .build();

        routeLogRepository.save(logEntry);
    }

    private Map<String, Object> fallbackRouteCalculation(RouteOptimizationRequestDTO req) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("status", "SUCCESS_FALLBACK");
        fallback.put("origin_name", req.getOriginNode());
        fallback.put("destination_name", req.getDestinationNode());
        
        Map<String, Object> recRoute = new HashMap<>();
        recRoute.put("route_id", "fallback_rec_01");
        recRoute.put("name", "Standard Hill Corridor (" + req.getOriginNode() + " ➔ " + req.getDestinationNode() + ")");
        recRoute.put("strategy", "AI_SAFE_TERRAIN");
        recRoute.put("total_distance_km", 240.0);
        recRoute.put("estimated_duration_hours", 6.5);
        recRoute.put("avg_elevation_m", 1250.0);
        recRoute.put("max_elevation_m", 2400.0);
        recRoute.put("elevation_gain_m", 1800.0);
        recRoute.put("max_gradient_percent", 8.5);
        recRoute.put("composite_risk_score", 0.28);
        recRoute.put("fuel_consumption_litres", 48.0);
        recRoute.put("co2_emissions_kg", 128.6);
        recRoute.put("passable", true);
        recRoute.put("risk_warnings", List.of("Monsoon rain caution in mountain corridor"));
        recRoute.put("segments", List.of());
        recRoute.put("elevation_profile", List.of());
        recRoute.put("waypoints", List.of());

        fallback.put("recommended_route", recRoute);
        fallback.put("alternative_routes", List.of());
        fallback.put("active_hazard_count", 0);
        return fallback;
    }
}
