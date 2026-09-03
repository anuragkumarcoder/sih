package com.sih.nerlogistics.service;

import com.sih.nerlogistics.domain.nosql.AccessibilityIncident;
import com.sih.nerlogistics.domain.nosql.RouteLog;
import com.sih.nerlogistics.dto.RouteOptimizationRequestDTO;
import com.sih.nerlogistics.repository.nosql.AccessibilityIncidentRepository;
import com.sih.nerlogistics.repository.nosql.RouteLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConvoyRoutingService {

    private final AccessibilityIncidentRepository incidentRepository;
    private final RouteLogRepository routeLogRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${ner.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    /**
     * Packages active verified incidents with explicit dangerKey and 15.0km mountain impact radius,
     * and calls the Python NetworkX optimizer.
     */
    public Map<String, Object> recalculateConvoyRoute(RouteOptimizationRequestDTO reqDto) {
        log.info("Recalculating tactical route for convoy from {} to {} ({})",
                reqDto.getOriginNode(), reqDto.getDestinationNode(), reqDto.getVehicleType());

        // 1. Fetch all active incidents from MongoDB
        List<AccessibilityIncident> activeIncidents = incidentRepository.findByActiveTrue();

        // 2. Map entities to payload with explicit dangerKey and 15km mountain impact radius
        List<Map<String, Object>> incidentPayloads = activeIncidents.stream().map(inc -> {
            Map<String, Object> m = new HashMap<>();
            m.put("incident_id", inc.getIncidentCode());
            m.put("hazard_type", inc.getHazardType());
            m.put("severity", inc.getSeverity());
            m.put("road_name", inc.getRoadName() != null ? inc.getRoadName() : "NH-13");
            m.put("landmark", inc.getLandmark() != null ? inc.getLandmark() : "Mountain Pass");
            
            // Explicit Danger Key assignment
            String landmark = inc.getLandmark() != null ? inc.getLandmark().toUpperCase() : "";
            String road = inc.getRoadName() != null ? inc.getRoadName().toUpperCase() : "";
            String dangerKey = "GENERAL_OBSTACLE";
            
            if (landmark.contains("SELA") || road.contains("NH-13") || road.contains("TAWANG")) {
                dangerKey = "SELA_PASS_NH13";
            } else if (landmark.contains("SONAPUR") || road.contains("NH-6") || road.contains("SILCHAR")) {
                dangerKey = "SONAPUR_NH6";
            } else if (landmark.contains("PAGLA") || road.contains("NH-29") || road.contains("KOHIMA")) {
                dangerKey = "PAGLA_PAHAR_NH29";
            } else if (landmark.contains("TEESTA") || road.contains("NH-10") || road.contains("GANGTOK")) {
                dangerKey = "TEESTA_NH10";
            } else if (landmark.contains("JATINGA") || road.contains("NH-27")) {
                dangerKey = "MAHASADAK_NH27";
            }
            
            m.put("danger_key", dangerKey);
            m.put("status", "ACTIVE");
            m.put("verified", true);
            
            Map<String, Object> loc = new HashMap<>();
            loc.put("lat", inc.getLocation() != null ? inc.getLocation().getY() : 27.5034);
            loc.put("lng", inc.getLocation() != null ? inc.getLocation().getX() : 92.1037);
            m.put("location", loc);
            m.put("impact_radius_km", 15.0); // 15.0 km mountain pass radius
            m.put("passable_by_4x4", inc.getPassableBy4x4() != null ? inc.getPassableBy4x4() : false);
            return m;
        }).collect(Collectors.toList());

        // 3. Assemble Request Payload
        Map<String, Object> originMap = new HashMap<>();
        originMap.put("name", reqDto.getOriginNode());
        originMap.put("lat", reqDto.getOriginLat() != null ? reqDto.getOriginLat() : 27.3556);
        originMap.put("lng", reqDto.getOriginLng() != null ? reqDto.getOriginLng() : 92.2341);

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
        requestBody.put("vehicle_type", reqDto.getVehicleType() != null ? reqDto.getVehicleType() : "HEAVY_COMMERCIAL");
        requestBody.put("cargo_weight_kg", reqDto.getCargoWeightKg() != null ? reqDto.getCargoWeightKg() : 4200.0);
        requestBody.put("weather", weatherMap);
        requestBody.put("active_incidents", incidentPayloads);
        requestBody.put("avoid_high_altitude_passes", reqDto.getAvoidHighAltitudePasses() != null ? reqDto.getAvoidHighAltitudePasses() : false);

        // 4. Send HTTP POST to Python Microservice
        WebClient client = webClientBuilder.baseUrl(aiServiceUrl).build();
        try {
            return client.post()
                    .uri("/api/v1/routing/optimize")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(8))
                    .block();
        } catch (Exception ex) {
            log.error("Failed to call Python AI Optimizer: {}. Executing local fallback.", ex.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("status", "FALLBACK_DETOUR");
            fallback.put("origin", reqDto.getOriginNode());
            fallback.put("destination", reqDto.getDestinationNode());
            return fallback;
        }
    }
}
