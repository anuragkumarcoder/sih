package com.sih.nerlogistics.controller;

import com.sih.nerlogistics.domain.nosql.RouteLog;
import com.sih.nerlogistics.dto.RouteOptimizationRequestDTO;
import com.sih.nerlogistics.repository.nosql.RouteLogRepository;
import com.sih.nerlogistics.service.AIRoutingIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/routes")
@RequiredArgsConstructor
@Tag(name = "AI Predictive Routing & Corridor Optimization", description = "Integration with AI Microservice and terrain database")
public class RoutingController {

    private final AIRoutingIntegrationService aiRoutingService;
    private final RouteLogRepository routeLogRepository;

    @PostMapping("/optimize")
    @Operation(summary = "Calculate terrain-aware, multi-objective optimal route via AI Microservice")
    public ResponseEntity<Map<String, Object>> optimizeRoute(@RequestBody RouteOptimizationRequestDTO request) {
        return ResponseEntity.ok(aiRoutingService.optimizeRouteWithAI(request));
    }

    @GetMapping("/history")
    @Operation(summary = "Get historical trip route logs with elevation & hazard traces (MongoDB)")
    public ResponseEntity<List<RouteLog>> getRecentRouteLogs() {
        return ResponseEntity.ok(routeLogRepository.findTop20ByOrderByDepartureTimeDesc());
    }

    @GetMapping("/trip/{tripId}")
    @Operation(summary = "Get detailed route log by trip ID")
    public ResponseEntity<RouteLog> getRouteLogByTripId(@PathVariable String tripId) {
        return routeLogRepository.findByTripId(tripId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
