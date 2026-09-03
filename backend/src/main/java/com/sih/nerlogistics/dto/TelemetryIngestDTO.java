package com.sih.nerlogistics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryIngestDTO {
    @NotBlank
    private String vehicleId;
    private String tripId;
    private String driverName;
    private String vehicleType;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private Double altitudeMeters;
    private Double speedKmh;
    private Double headingDegrees;
    private Double engineTemperatureCelsius;
    private Double containerTempCelsius;
    private Double fuelPercentage;
    private Double batteryPercentage;
    private Double cargoWeightKg;
    private Double cabinPressureHpa;
    private Boolean isEmergencySOS;
    private String networkSignalStrength;
}
