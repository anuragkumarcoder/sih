package com.sih.nerlogistics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentReportDTO {
    @NotBlank
    private String hazardType; // LANDSLIDE, FLASH_FLOOD, ROAD_SUBSIDENCE, BRIDGE_COLLAPSE, HEAVY_FOG, SNOW_ICE

    @NotBlank
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private String roadName;
    private String landmark;
    private String description;
    private Double estimatedClearanceHours;
    private Boolean passableBy4x4;
    private List<String> photoUrls;
    private Double rainfallAtIncidentMm;
}
