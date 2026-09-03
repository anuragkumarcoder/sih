package com.sih.nerlogistics.service;

import com.sih.nerlogistics.domain.nosql.VehicleTelemetry;
import com.sih.nerlogistics.dto.TelemetryIngestDTO;
import com.sih.nerlogistics.repository.nosql.VehicleTelemetryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TelemetryService {

    private final VehicleTelemetryRepository telemetryRepository;

    public VehicleTelemetry ingestTelemetry(TelemetryIngestDTO dto) {
        VehicleTelemetry telemetry = VehicleTelemetry.builder()
                .vehicleId(dto.getVehicleId())
                .tripId(dto.getTripId())
                .driverName(dto.getDriverName())
                .vehicleType(dto.getVehicleType() != null ? dto.getVehicleType() : "MEDIUM_COMMERCIAL")
                .location(new GeoJsonPoint(dto.getLongitude(), dto.getLatitude())) // Mongo uses [Lng, Lat]
                .altitudeMeters(dto.getAltitudeMeters())
                .speedKmh(dto.getSpeedKmh())
                .headingDegrees(dto.getHeadingDegrees())
                .engineTemperatureCelsius(dto.getEngineTemperatureCelsius())
                .containerTempCelsius(dto.getContainerTempCelsius() != null ? dto.getContainerTempCelsius() : 4.2)
                .fuelPercentage(dto.getFuelPercentage())
                .batteryPercentage(dto.getBatteryPercentage())
                .cargoWeightKg(dto.getCargoWeightKg())
                .cabinPressureHpa(dto.getCabinPressureHpa())
                .isEmergencySOS(dto.getIsEmergencySOS() != null ? dto.getIsEmergencySOS() : false)
                .networkSignalStrength(dto.getNetworkSignalStrength() != null ? dto.getNetworkSignalStrength() : "4G")
                .timestamp(Instant.now())
                .build();

        return telemetryRepository.save(telemetry);
    }

    public List<VehicleTelemetry> ingestBatch(List<TelemetryIngestDTO> batch) {
        List<VehicleTelemetry> entities = batch.stream()
                .map(dto -> VehicleTelemetry.builder()
                        .vehicleId(dto.getVehicleId())
                        .tripId(dto.getTripId())
                        .driverName(dto.getDriverName())
                        .vehicleType(dto.getVehicleType())
                        .location(new GeoJsonPoint(dto.getLongitude(), dto.getLatitude()))
                        .altitudeMeters(dto.getAltitudeMeters())
                        .speedKmh(dto.getSpeedKmh())
                        .headingDegrees(dto.getHeadingDegrees())
                        .engineTemperatureCelsius(dto.getEngineTemperatureCelsius())
                        .fuelPercentage(dto.getFuelPercentage())
                        .batteryPercentage(dto.getBatteryPercentage())
                        .cargoWeightKg(dto.getCargoWeightKg())
                        .cabinPressureHpa(dto.getCabinPressureHpa())
                        .isEmergencySOS(dto.getIsEmergencySOS() != null ? dto.getIsEmergencySOS() : false)
                        .networkSignalStrength(dto.getNetworkSignalStrength())
                        .timestamp(Instant.now())
                        .build())
                .collect(Collectors.toList());

        return telemetryRepository.saveAll(entities);
    }

    public Optional<VehicleTelemetry> getLatestTelemetry(String vehicleId) {
        return telemetryRepository.findFirstByVehicleIdOrderByTimestampDesc(vehicleId);
    }

    public List<VehicleTelemetry> getTripTrajectory(String tripId) {
        return telemetryRepository.findByTripIdOrderByTimestampAsc(tripId);
    }

    public List<VehicleTelemetry> getRecentVehicleHistory(String vehicleId, int limit) {
        return telemetryRepository.findByVehicleIdOrderByTimestampDesc(vehicleId, PageRequest.of(0, limit));
    }

    public List<VehicleTelemetry> findVehiclesNearLocation(double lat, double lng, double radiusKm) {
        Point point = new Point(lng, lat);
        Distance distance = new Distance(radiusKm, Metrics.KILOMETERS);
        return telemetryRepository.findByLocationNear(point, distance);
    }

    public List<VehicleTelemetry> getActiveEmergencySOS() {
        return telemetryRepository.findByIsEmergencySOSTrue();
    }
}
