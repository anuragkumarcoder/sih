package com.sih.nerlogistics.service;

import com.sih.nerlogistics.domain.nosql.AccessibilityIncident;
import com.sih.nerlogistics.dto.AdminConvoyContextDTO;
import com.sih.nerlogistics.repository.nosql.AccessibilityIncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAITestingService {

    private final AccessibilityIncidentRepository incidentRepository;

    // 8 Strategic Mountain Sensitive Zones definition
    private static final List<Map<String, Object>> SENSITIVE_ZONES = List.of(
            Map.of(
                    "id", "ZONE_SONAPUR_NH6",
                    "name", "Sonapur Mudslide Zone / Tunnel",
                    "highway", "NH-6",
                    "corridor", "Meghalaya ➔ Assam",
                    "lat", 25.1250, "lng", 92.3500,
                    "elevationMeters", 1120,
                    "dangerType", "LANDSLIDE",
                    "detourHighway", "NH-206 Dawki River Bypass",
                    "savedHours", 4.5
            ),
            Map.of(
                    "id", "ZONE_SELA_PASS_NH13",
                    "name", "Sela Pass High-Altitude Corridor",
                    "highway", "NH-13",
                    "corridor", "Arunachal Pradesh (Dirang ➔ Tawang)",
                    "lat", 27.5034, "lng", 92.1037,
                    "elevationMeters", 4170,
                    "dangerType", "ROCKFALL_SNOW_BLIZZARD",
                    "detourHighway", "Sangti Valley 4x4 Track",
                    "savedHours", 6.0
            ),
            Map.of(
                    "id", "ZONE_PAGLA_PAHAR_NH29",
                    "name", "Pagla Pahar Landslide Gorge",
                    "highway", "NH-29",
                    "corridor", "Nagaland (Dimapur ➔ Kohima)",
                    "lat", 25.7920, "lng", 93.9170,
                    "elevationMeters", 1260,
                    "dangerType", "LANDSLIDE_SUBSIDENCE",
                    "detourHighway", "Peducha / Zubza Bypass",
                    "savedHours", 3.0
            ),
            Map.of(
                    "id", "ZONE_TEESTA_NH10",
                    "name", "Teesta River Gorge Corridor",
                    "highway", "NH-10",
                    "corridor", "Sikkim (Siliguri ➔ Gangtok)",
                    "lat", 27.0500, "lng", 88.4900,
                    "elevationMeters", 420,
                    "dangerType", "FLASH_FLOOD_RIVER_EROSION",
                    "detourHighway", "Lava & Gorubathan (NH-717A)",
                    "savedHours", 5.0
            ),
            Map.of(
                    "id", "ZONE_MAHASADAK_NH27",
                    "name", "Jatinga Hills Mahasadak",
                    "highway", "NH-27",
                    "corridor", "Assam (Haflong ➔ Silchar)",
                    "lat", 25.1800, "lng", 93.0200,
                    "elevationMeters", 960,
                    "dangerType", "LANDSLIDE",
                    "detourHighway", "Lumding Rail Siding Intermodal",
                    "savedHours", 3.5
            ),
            Map.of(
                    "id", "ZONE_NATHULA_SH3",
                    "name", "Nathu La Alpine Frontier Pass",
                    "highway", "SH-3",
                    "corridor", "Sikkim (Gangtok ➔ Kupup)",
                    "lat", 27.3860, "lng", 88.8310,
                    "elevationMeters", 4310,
                    "dangerType", "GLACIAL_FREEZE_AVALANCHE",
                    "detourHighway", "Autonomous VTOL Drone Corridor",
                    "savedHours", 8.0
            ),
            Map.of(
                    "id", "ZONE_LOKCHAO_NH102",
                    "name", "Lokchao Bridge / Tengnoupal",
                    "highway", "NH-102",
                    "corridor", "Manipur (Imphal ➔ Moreh)",
                    "lat", 24.2500, "lng", 94.2800,
                    "elevationMeters", 1420,
                    "dangerType", "SILT_AVALANCHE",
                    "detourHighway", "4x4 Winch-Assisted Track",
                    "savedHours", 4.0
            ),
            Map.of(
                    "id", "ZONE_BUALPUI_NH54",
                    "name", "Bualpui Ridge Highway",
                    "highway", "NH-54",
                    "corridor", "Mizoram (Aizawl ➔ Lunglei)",
                    "lat", 23.3500, "lng", 92.7400,
                    "elevationMeters", 1290,
                    "dangerType", "CLAY_SHALE_SLIP",
                    "detourHighway", "Alternate Ridge Bypass",
                    "savedHours", 3.0
            )
    );

    public AdminConvoyContextDTO getAdminConvoyContext(String vehicleId) {
        log.info("Admin AI Assistant fetching real-time context for convoy {}", vehicleId);

        // Standard Demo Fleet Lookup
        String driver = "Biren Gogoi";
        String type = "HEAVY_COMMERCIAL";
        String origin = "Guwahati";
        String dest = "Silchar";
        double lat = 25.5788;
        double lng = 91.8933;
        double alt = 1525.0;
        double speed = 48.0;
        double temp = 4.2;

        if ("NER-4X4-AR03-1044".equalsIgnoreCase(vehicleId)) {
            driver = "Tsering Norbu";
            type = "OFFROAD_4X4";
            origin = "Dirang";
            dest = "Tawang";
            lat = 27.3556;
            lng = 92.2341;
            alt = 2415.0;
            speed = 34.0;
            temp = 2.8;
        } else if ("NER-TRUCK-SK02-4411".equalsIgnoreCase(vehicleId)) {
            driver = "Pema Bhutia";
            type = "HEAVY_COMMERCIAL";
            origin = "Siliguri";
            dest = "Gangtok";
            lat = 26.8500;
            lng = 88.4500;
            alt = 310.0;
            speed = 45.0;
            temp = 3.9;
        } else if ("NER-TRUCK-NL07-5512".equalsIgnoreCase(vehicleId)) {
            driver = "Kevichusa Angami";
            type = "HEAVY_COMMERCIAL";
            origin = "Dimapur";
            dest = "Kohima";
            lat = 25.8200;
            lng = 93.8500;
            alt = 720.0;
            speed = 38.0;
            temp = 5.1;
        } else if ("NER-DRONE-AIR-07".equalsIgnoreCase(vehicleId)) {
            driver = "Autonomous Pilot (AI-07)";
            type = "CARGO_DRONE";
            origin = "Shillong";
            dest = "Dawki";
            lat = 25.4200;
            lng = 91.8200;
            alt = 1680.0;
            speed = 82.0;
            temp = 3.5;
        }

        // 1. Cross-reference 8 Sensitive Zones intersecting THIS specific route
        final String origLower = origin.toLowerCase();
        final String destLower = dest.toLowerCase();

        List<Map<String, Object>> intersectingZones = new ArrayList<>();
        for (Map<String, Object> zone : SENSITIVE_ZONES) {
            String zoneId = (String) zone.get("id");
            if (("ZONE_SONAPUR_NH6".equals(zoneId) || "ZONE_MAHASADAK_NH27".equals(zoneId)) &&
                    (destLower.contains("silchar") || origLower.contains("guwahati") || destLower.contains("aizawl"))) {
                intersectingZones.add(zone);
            } else if ("ZONE_SELA_PASS_NH13".equals(zoneId) && (destLower.contains("tawang") || origLower.contains("dirang") || origLower.contains("bomdila"))) {
                intersectingZones.add(zone);
            } else if (("ZONE_TEESTA_NH10".equals(zoneId) || "ZONE_NATHULA_SH3".equals(zoneId)) && (destLower.contains("gangtok") || origLower.contains("siliguri"))) {
                intersectingZones.add(zone);
            } else if (("ZONE_PAGLA_PAHAR_NH29".equals(zoneId) || "ZONE_LOKCHAO_NH102".equals(zoneId)) && (destLower.contains("kohima") || origLower.contains("dimapur") || destLower.contains("imphal"))) {
                intersectingZones.add(zone);
            } else if ("ZONE_BUALPUI_NH54".equals(zoneId) && (destLower.contains("lunglei") || origLower.contains("aizawl"))) {
                intersectingZones.add(zone);
            }
        }

        // 2. Aggregate active incidents intersecting path
        List<AccessibilityIncident> activeIncidents = incidentRepository.findByActiveTrue();
        List<Map<String, Object>> activeHazards = new ArrayList<>();
        boolean isDetourRequired = false;

        for (AccessibilityIncident inc : activeIncidents) {
            if (Boolean.TRUE.equals(inc.getActive())) {
                Map<String, Object> h = new HashMap<>();
                h.put("id", inc.getIncidentCode());
                h.put("hazardType", inc.getHazardType());
                h.put("roadName", inc.getRoadName());
                h.put("landmark", inc.getLandmark());
                h.put("severity", inc.getSeverity());
                h.put("clearancePercent", inc.getClearancePercent() != null ? inc.getClearancePercent() : 15);
                h.put("status", inc.getStatus() != null ? inc.getStatus() : "ACTIVE");
                activeHazards.add(h);
                isDetourRequired = true;
            }
        }

        // 3. Weather & Freezing Alerts
        List<String> weatherAlerts = new ArrayList<>();
        double rainfall = 42.0;
        double ambientTemp = 18.0;
        boolean subZero = false;

        if (alt > 3500.0 || destLower.contains("tawang") || destLower.contains("kupup")) {
            subZero = true;
            ambientTemp = -4.5;
            weatherAlerts.add("❄️ SUB-ZERO TEMPERATURE ALERT (" + ambientTemp + "°C): Black ice on asphalt. Snow chain traction required.");
            weatherAlerts.add("🌬️ High-Altitude Fog & Blizzard: Visibility reduced to < 350 meters.");
        } else {
            weatherAlerts.add("🌧️ Monsoonal Precipitation: 24h Rainfall: " + rainfall + "mm. Soil saturation index: 84% (High Risk).");
            weatherAlerts.add("⚠️ Mountain Fog Caution: Reduced visibility on ascending hairpin turns.");
        }

        // 4. Detour details
        String primaryHighway = destLower.contains("silchar") ? "NH-6" : destLower.contains("tawang") ? "NH-13" : destLower.contains("gangtok") ? "NH-10" : "NH-29";
        String recommendedDetour = !intersectingZones.isEmpty() ? (String) intersectingZones.get(0).get("detourHighway") : "Official Highway Detour";
        double savedHours = !intersectingZones.isEmpty() ? ((Number) intersectingZones.get(0).get("savedHours")).doubleValue() : 4.0;

        return AdminConvoyContextDTO.builder()
                .vehicleId(vehicleId)
                .driverName(driver)
                .vehicleType(type)
                .origin(origin)
                .destination(dest)
                .currentLat(lat)
                .currentLng(lng)
                .altitudeMeters(alt)
                .speedKmh(speed)
                .containerTempCelsius(temp)
                .isThermalBreach(temp > 8.0 || temp < 2.0)
                .intersectingSensitiveZones(intersectingZones)
                .activeIntersectingHazards(activeHazards)
                .weatherAndFreezingAlerts(weatherAlerts)
                .rainfallMm(rainfall)
                .ambientTempCelsius(ambientTemp)
                .isSubZeroFreezing(subZero)
                .primaryHighway(primaryHighway)
                .recommendedDetourHighway(recommendedDetour)
                .isDetourRequired(isDetourRequired)
                .estimatedTimeSavedHours(savedHours)
                .build();
    }
}
