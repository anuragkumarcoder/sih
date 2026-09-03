package com.sih.nerlogistics.controller;

import com.sih.nerlogistics.domain.nosql.AccessibilityIncident;
import com.sih.nerlogistics.dto.IncidentReportDTO;
import com.sih.nerlogistics.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
@Tag(name = "Accessibility & Obstruction Reporting (MongoDB)", description = "Landslides, flash floods, and bridge damage reporting")
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    @Operation(summary = "Report a new road obstruction / landslide incident")
    public ResponseEntity<AccessibilityIncident> reportIncident(
            @Valid @RequestBody IncidentReportDTO dto,
            Authentication auth
    ) {
        String userId = (auth != null) ? auth.getName() : "FIELD_RESPONDER";
        String role = (auth != null && !auth.getAuthorities().isEmpty()) ?
                auth.getAuthorities().iterator().next().getAuthority() : "ROLE_DRIVER";

        return ResponseEntity.ok(incidentService.reportIncident(dto, userId, role));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active road obstructions in the North Eastern Region")
    public ResponseEntity<List<AccessibilityIncident>> getActiveIncidents() {
        return ResponseEntity.ok(incidentService.getActiveIncidents());
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find active hazards within proximity (MongoDB 2dsphere)")
    public ResponseEntity<List<AccessibilityIncident>> getNearbyIncidents(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "30.0") double radiusKm
    ) {
        return ResponseEntity.ok(incidentService.getIncidentsNear(lat, lng, radiusKm));
    }

    @PatchMapping("/{id}/verify")
    @Operation(summary = "Mark incident as verified by official (BRO / NDRF / District Collector)")
    public ResponseEntity<AccessibilityIncident> verifyIncident(
            @PathVariable String id,
            Authentication auth
    ) {
        String verifiedBy = (auth != null) ? auth.getName() : "CHIEF_REGIONAL_INSPECTOR";
        return incidentService.verifyIncident(id, verifiedBy)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/clearance")
    @Operation(summary = "BRO Clearance Governance: Update debris clearance percentage (0-100%) and hazard status")
    public ResponseEntity<AccessibilityIncident> updateClearance(
            @PathVariable String id,
            @RequestParam int clearancePercent,
            @RequestParam(required = false, defaultValue = "CLEARANCE_IN_PROGRESS") String status
    ) {
        return incidentService.updateClearance(id, clearancePercent, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/resolve")
    @Operation(summary = "Mark road blockage as cleared / resolved")
    public ResponseEntity<AccessibilityIncident> resolveIncident(@PathVariable String id) {
        return incidentService.resolveIncident(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
