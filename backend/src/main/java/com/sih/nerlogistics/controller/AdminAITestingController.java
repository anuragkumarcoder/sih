package com.sih.nerlogistics.controller;

import com.sih.nerlogistics.dto.AdminConvoyContextDTO;
import com.sih.nerlogistics.service.AdminAITestingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/ai-testing")
@RequiredArgsConstructor
@Tag(name = "Admin-Only AI Testing Assistant", description = "Secure diagnostic tools for real-time mountain hazard cross-referencing and AI path recalibration")
public class AdminAITestingController {

    private final AdminAITestingService adminAiTestingService;

    @GetMapping("/convoy-context/{vehicleId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin-Only: Fetch real-time convoy state, intersecting sensitive zones, active calamities, and freezing alerts")
    public ResponseEntity<AdminConvoyContextDTO> getConvoyContext(@PathVariable String vehicleId) {
        return ResponseEntity.ok(adminAiTestingService.getAdminConvoyContext(vehicleId));
    }
}
