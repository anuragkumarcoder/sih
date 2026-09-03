package com.sih.nerlogistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminConvoyContextDTO {
    private String vehicleId;
    private String driverName;
    private String vehicleType;
    private String origin;
    private String destination;
    private Double currentLat;
    private Double currentLng;
    private Double altitudeMeters;
    private Double speedKmh;
    private Double containerTempCelsius;
    private Boolean isThermalBreach;
    
    // 8 Sensitive Zones Cross-Referencing
    private List<Map<String, Object>> intersectingSensitiveZones;
    
    // Active Incidents on this path
    private List<Map<String, Object>> activeIntersectingHazards;
    
    // Weather & Freezing Alerts
    private List<String> weatherAndFreezingAlerts;
    private Double rainfallMm;
    private Double ambientTempCelsius;
    private Boolean isSubZeroFreezing;
    
    // Tactical Detour Details
    private String primaryHighway;
    private String recommendedDetourHighway;
    private Boolean isDetourRequired;
    private Double estimatedTimeSavedHours;
}
