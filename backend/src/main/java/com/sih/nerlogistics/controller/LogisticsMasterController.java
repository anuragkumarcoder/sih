package com.sih.nerlogistics.controller;

import com.sih.nerlogistics.domain.relational.DistrictNER;
import com.sih.nerlogistics.domain.relational.LogisticsNode;
import com.sih.nerlogistics.domain.relational.Warehouse;
import com.sih.nerlogistics.service.LogisticsMasterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/master")
@RequiredArgsConstructor
@Tag(name = "Relational Master Data (MySQL)", description = "CRUD for Districts, Warehouses, and Logistics Nodes")
public class LogisticsMasterController {

    private final LogisticsMasterService masterService;

    // Districts
    @GetMapping("/districts")
    @Operation(summary = "Get all North Eastern Region districts")
    public ResponseEntity<List<DistrictNER>> getAllDistricts() {
        return ResponseEntity.ok(masterService.getAllDistricts());
    }

    @GetMapping("/districts/state/{stateCode}")
    @Operation(summary = "Get districts by state (AS, ML, AR, NL, MN, MZ, TR, SK)")
    public ResponseEntity<List<DistrictNER>> getDistrictsByState(@PathVariable String stateCode) {
        return ResponseEntity.ok(masterService.getDistrictsByState(stateCode.toUpperCase()));
    }

    @PostMapping("/districts")
    @Operation(summary = "Create or update district profile")
    public ResponseEntity<DistrictNER> createDistrict(@RequestBody DistrictNER district) {
        return ResponseEntity.ok(masterService.saveDistrict(district));
    }

    // Warehouses
    @GetMapping("/warehouses")
    @Operation(summary = "Get all regional warehouses and cold storage depots")
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(masterService.getAllWarehouses());
    }

    @GetMapping("/warehouses/state/{stateCode}")
    @Operation(summary = "Get warehouses by state code")
    public ResponseEntity<List<Warehouse>> getWarehousesByState(@PathVariable String stateCode) {
        return ResponseEntity.ok(masterService.getWarehousesByState(stateCode.toUpperCase()));
    }

    @PostMapping("/warehouses")
    @Operation(summary = "Create or update warehouse record")
    public ResponseEntity<Warehouse> createWarehouse(@RequestBody Warehouse warehouse) {
        return ResponseEntity.ok(masterService.saveWarehouse(warehouse));
    }

    // Logistics Nodes
    @GetMapping("/nodes")
    @Operation(summary = "Get all multi-modal hubs (Railheads, Air Cargo, Ports, Border Posts)")
    public ResponseEntity<List<LogisticsNode>> getAllNodes() {
        return ResponseEntity.ok(masterService.getAllNodes());
    }

    @GetMapping("/nodes/type/{type}")
    @Operation(summary = "Filter logistics nodes by type")
    public ResponseEntity<List<LogisticsNode>> getNodesByType(@PathVariable String type) {
        return ResponseEntity.ok(masterService.getNodesByType(type));
    }

    @PostMapping("/nodes")
    @Operation(summary = "Create or update logistics node")
    public ResponseEntity<LogisticsNode> createNode(@RequestBody LogisticsNode node) {
        return ResponseEntity.ok(masterService.saveNode(node));
    }
}
