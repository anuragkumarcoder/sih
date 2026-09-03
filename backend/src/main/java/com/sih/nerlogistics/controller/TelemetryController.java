package com.sih.nerlogistics.controller;

import com.sih.nerlogistics.domain.nosql.VehicleTelemetry;
import com.sih.nerlogistics.dto.TelemetryIngestDTO;
import com.sih.nerlogistics.service.TelemetryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/telemetry")
@RequiredArgsConstructor
@Tag(name = "High-Velocity Telemetry Ingestion (MongoDB)", description = "Real-time vehicle GPS, altitude, and sensor telemetry streams")
public class TelemetryController {

    private final TelemetryService telemetryService;

    @PostMapping("/stream")
    @Operation(summary = "Ingest single GPS telemetry record (High-velocity point)")
    public ResponseEntity<VehicleTelemetry> ingestTelemetry(@Valid @RequestBody TelemetryIngestDTO dto) {
        return ResponseEntity.ok(telemetryService.ingestTelemetry(dto));
    }

    @PostMapping("/stream/batch")
    @Operation(summary = "Batch ingest telemetry points (Offline replay sync)")
    public ResponseEntity<List<VehicleTelemetry>> ingestBatch(@RequestBody List<TelemetryIngestDTO> batch) {
        return ResponseEntity.ok(telemetryService.ingestBatch(batch));
    }

    @GetMapping("/vehicle/{vehicleId}/latest")
    @Operation(summary = "Get current position and sensor state for a vehicle")
    public ResponseEntity<VehicleTelemetry> getLatestTelemetry(@PathVariable String vehicleId) {
        return telemetryService.getLatestTelemetry(vehicleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vehicle/{vehicleId}/history")
    @Operation(summary = "Get historical GPS trajectory breadcrumbs")
    public ResponseEntity<List<VehicleTelemetry>> getHistory(
            @PathVariable String vehicleId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(telemetryService.getRecentVehicleHistory(vehicleId, limit));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find active fleet vehicles within radius (2dsphere geospatial search)")
    public ResponseEntity<List<VehicleTelemetry>> getNearbyVehicles(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "50.0") double radiusKm
    ) {
        return ResponseEntity.ok(telemetryService.findVehiclesNearLocation(lat, lng, radiusKm));
    }

    @GetMapping("/emergency-sos")
    @Operation(summary = "Get all active vehicle emergency SOS triggers")
    public ResponseEntity<List<VehicleTelemetry>> getEmergencySOS() {
        return ResponseEntity.ok(telemetryService.getActiveEmergencySOS());
    }
}
