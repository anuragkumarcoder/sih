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
public class RouteOptimizationRequestDTO {
    private String originNode;
    private Double originLat;
    private Double originLng;

    private String destinationNode;
    private Double destinationLat;
    private Double destinationLng;

    private String vehicleType; // HEAVY_COMMERCIAL, MEDIUM_COMMERCIAL, OFFROAD_4X4, CARGO_DRONE, LIGHT_ELECTRIC
    private Double cargoWeightKg;
    private Boolean isHazardousCargo;
    private Boolean isEmergencyRelief;
    private Double rainfall24hMm;
    private Boolean avoidHighAltitudePasses;
}
