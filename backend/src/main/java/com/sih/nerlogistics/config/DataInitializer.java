package com.sih.nerlogistics.config;

import com.sih.nerlogistics.domain.relational.*;
import com.sih.nerlogistics.domain.nosql.AccessibilityIncident;
import com.sih.nerlogistics.repository.nosql.AccessibilityIncidentRepository;
import com.sih.nerlogistics.repository.relational.DistrictNERRepository;
import com.sih.nerlogistics.repository.relational.LogisticsNodeRepository;
import com.sih.nerlogistics.repository.relational.UserRepository;
import com.sih.nerlogistics.repository.relational.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DistrictNERRepository districtRepository;
    private final WarehouseRepository warehouseRepository;
    private final LogisticsNodeRepository nodeRepository;
    private final AccessibilityIncidentRepository incidentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedDistrictsAndWarehouses();
        seedLogisticsNodes();
        seedSampleIncidents();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("Seeding administrative & logistics users in MySQL...");
            userRepository.save(User.builder()
                    .username("admin")
                    .email("admin@ner-logistics.gov.in")
                    .password(passwordEncoder.encode("Admin@2026!"))
                    .fullName("Regional Logistics Director")
                    .role(Role.ROLE_ADMIN)
                    .assignedState("AS")
                    .active(true)
                    .build());

            userRepository.save(User.builder()
                    .username("manager_arunachal")
                    .email("manager.ar@ner-logistics.gov.in")
                    .password(passwordEncoder.encode("Pass@2026!"))
                    .fullName("Tawang Border Depot In-Charge")
                    .role(Role.ROLE_LOGISTICS_MANAGER)
                    .assignedState("AR")
                    .active(true)
                    .build());

            userRepository.save(User.builder()
                    .username("driver_as01")
                    .email("driver.as01@ner-logistics.gov.in")
                    .password(passwordEncoder.encode("Driver@2026!"))
                    .fullName("Biren Gogoi (Fleet Heavy Driver)")
                    .role(Role.ROLE_DRIVER)
                    .assignedState("AS")
                    .assignedVehicleId("NER-TRUCK-AS01-9921")
                    .active(true)
                    .build());
        }
    }

    private void seedDistrictsAndWarehouses() {
        if (districtRepository.count() == 0) {
            log.info("Seeding NER Districts & Warehouses in MySQL...");
            
            // 1. Kamrup Metro (Assam)
            DistrictNER dKamrup = districtRepository.save(DistrictNER.builder()
                    .districtName("Kamrup Metropolitan")
                    .stateCode("AS")
                    .stateName("Assam")
                    .headquartersLatitude(26.1445)
                    .headquartersLongitude(91.7362)
                    .averageElevationMeters(55.0)
                    .terrainClassification("RIVER_BASIN")
                    .terrainDifficultyRating(2)
                    .monsoonVulnerabilityIndex(0.35)
                    .isBorderDistrict(false)
                    .primaryAccessHighway("NH-27")
                    .build());

            warehouseRepository.save(Warehouse.builder()
                    .warehouseCode("WH-GHY-CENTRAL")
                    .name("Guwahati Central Gateway Logistics Hub")
                    .district(dKamrup)
                    .latitude(26.1445)
                    .longitude(91.7362)
                    .elevationMeters(55.0)
                    .totalCapacityMetricTons(12000.0)
                    .currentStockMetricTons(7850.0)
                    .coldStorageCapacityTons(3500.0)
                    .emergencyReliefStockTons(2000.0)
                    .isHelipadAvailable(true)
                    .isBackupPowerAvailable(true)
                    .contactPerson("Pranab Barman")
                    .contactPhone("+91-94350-11223")
                    .build());

            // 2. Tawang (Arunachal Pradesh)
            DistrictNER dTawang = districtRepository.save(DistrictNER.builder()
                    .districtName("Tawang")
                    .stateCode("AR")
                    .stateName("Arunachal Pradesh")
                    .headquartersLatitude(27.5861)
                    .headquartersLongitude(91.8653)
                    .averageElevationMeters(3048.0)
                    .terrainClassification("HIGH_ALTITUDE_MOUNTAIN")
                    .terrainDifficultyRating(9)
                    .monsoonVulnerabilityIndex(0.85)
                    .isBorderDistrict(true)
                    .primaryAccessHighway("NH-13")
                    .build());

            warehouseRepository.save(Warehouse.builder()
                    .warehouseCode("WH-TWG-STRAT")
                    .name("Tawang High-Altitude Strategic Relief Depot")
                    .district(dTawang)
                    .latitude(27.5861)
                    .longitude(91.8653)
                    .elevationMeters(3048.0)
                    .totalCapacityMetricTons(3500.0)
                    .currentStockMetricTons(2100.0)
                    .coldStorageCapacityTons(800.0)
                    .emergencyReliefStockTons(1200.0)
                    .isHelipadAvailable(true)
                    .isBackupPowerAvailable(true)
                    .contactPerson("Dorjee Khandu")
                    .contactPhone("+91-94360-44556")
                    .build());

            // 3. East Khasi Hills (Meghalaya)
            DistrictNER dShillong = districtRepository.save(DistrictNER.builder()
                    .districtName("East Khasi Hills")
                    .stateCode("ML")
                    .stateName("Meghalaya")
                    .headquartersLatitude(25.5788)
                    .headquartersLongitude(91.8933)
                    .averageElevationMeters(1525.0)
                    .terrainClassification("HILL_RIDGE")
                    .terrainDifficultyRating(6)
                    .monsoonVulnerabilityIndex(0.78)
                    .isBorderDistrict(false)
                    .primaryAccessHighway("NH-6")
                    .build());

            warehouseRepository.save(Warehouse.builder()
                    .warehouseCode("WH-SHL-COLD")
                    .name("Shillong Horticulture & Pharma Storage Depot")
                    .district(dShillong)
                    .latitude(25.5788)
                    .longitude(91.8933)
                    .elevationMeters(1525.0)
                    .totalCapacityMetricTons(4500.0)
                    .currentStockMetricTons(3100.0)
                    .coldStorageCapacityTons(2000.0)
                    .emergencyReliefStockTons(900.0)
                    .isHelipadAvailable(false)
                    .isBackupPowerAvailable(true)
                    .contactPerson("Wanpynhun Nongrum")
                    .contactPhone("+91-98620-77889")
                    .build());

            // 4. Kohima (Nagaland)
            DistrictNER dKohima = districtRepository.save(DistrictNER.builder()
                    .districtName("Kohima")
                    .stateCode("NL")
                    .stateName("Nagaland")
                    .headquartersLatitude(25.6751)
                    .headquartersLongitude(94.1086)
                    .averageElevationMeters(1444.0)
                    .terrainClassification("HILL_RIDGE")
                    .terrainDifficultyRating(7)
                    .monsoonVulnerabilityIndex(0.72)
                    .isBorderDistrict(false)
                    .primaryAccessHighway("NH-29")
                    .build());

            // 5. Imphal West (Manipur)
            DistrictNER dImphal = districtRepository.save(DistrictNER.builder()
                    .districtName("Imphal West")
                    .stateCode("MN")
                    .stateName("Manipur")
                    .headquartersLatitude(24.8170)
                    .headquartersLongitude(93.9368)
                    .averageElevationMeters(786.0)
                    .terrainClassification("RIVER_BASIN")
                    .terrainDifficultyRating(5)
                    .monsoonVulnerabilityIndex(0.55)
                    .isBorderDistrict(false)
                    .primaryAccessHighway("NH-2")
                    .build());

            // 6. Aizawl (Mizoram)
            DistrictNER dAizawl = districtRepository.save(DistrictNER.builder()
                    .districtName("Aizawl")
                    .stateCode("MZ")
                    .stateName("Mizoram")
                    .headquartersLatitude(23.7271)
                    .headquartersLongitude(92.7176)
                    .averageElevationMeters(1132.0)
                    .terrainClassification("HILL_RIDGE")
                    .terrainDifficultyRating(8)
                    .monsoonVulnerabilityIndex(0.68)
                    .isBorderDistrict(false)
                    .primaryAccessHighway("NH-306")
                    .build());

            // 7. West Tripura (Tripura)
            DistrictNER dAgartala = districtRepository.save(DistrictNER.builder()
                    .districtName("West Tripura")
                    .stateCode("TR")
                    .stateName("Tripura")
                    .headquartersLatitude(23.8315)
                    .headquartersLongitude(91.2868)
                    .averageElevationMeters(15.0)
                    .terrainClassification("FLOODPLAIN")
                    .terrainDifficultyRating(3)
                    .monsoonVulnerabilityIndex(0.45)
                    .isBorderDistrict(true)
                    .primaryAccessHighway("NH-8")
                    .build());

            // 8. East Sikkim (Sikkim)
            DistrictNER dGangtok = districtRepository.save(DistrictNER.builder()
                    .districtName("Gangtok")
                    .stateCode("SK")
                    .stateName("Sikkim")
                    .headquartersLatitude(27.3389)
                    .headquartersLongitude(88.6065)
                    .averageElevationMeters(1650.0)
                    .terrainClassification("HIGH_ALTITUDE_MOUNTAIN")
                    .terrainDifficultyRating(9)
                    .monsoonVulnerabilityIndex(0.88)
                    .isBorderDistrict(true)
                    .primaryAccessHighway("NH-10")
                    .build());
        }
    }

    private void seedLogisticsNodes() {
        if (nodeRepository.count() == 0) {
            log.info("Seeding Multi-Modal Logistics Nodes in MySQL...");
            nodeRepository.save(LogisticsNode.builder()
                    .nodeCode("NODE-GHY-AIR")
                    .name("Lokpriya Gopinath Bordoloi Air Cargo Terminal")
                    .nodeType("AIR_CARGO")
                    .stateCode("AS")
                    .latitude(26.1061)
                    .longitude(91.5859)
                    .elevationMeters(49.0)
                    .dailyHandlingCapacityTons(500)
                    .operationalStatus(true)
                    .connectivityNotes("International & Domestic air cargo hub with temperature controlled zone")
                    .build());

            nodeRepository.save(LogisticsNode.builder()
                    .nodeCode("NODE-GHY-PORT")
                    .name("Pandu Inland Waterway Port (NW-2 Brahmaputra)")
                    .nodeType("INLAND_WATERWAY_PORT")
                    .stateCode("AS")
                    .latitude(26.1594)
                    .longitude(91.6883)
                    .elevationMeters(45.0)
                    .dailyHandlingCapacityTons(1200)
                    .operationalStatus(true)
                    .connectivityNotes("River cargo multimodal terminal connected to BG rail line")
                    .build());

            nodeRepository.save(LogisticsNode.builder()
                    .nodeCode("NODE-DMR-RAIL")
                    .name("Dimapur Railway Goods Yard & Transshipment")
                    .nodeType("RAILHEAD")
                    .stateCode("NL")
                    .latitude(25.9090)
                    .longitude(93.7270)
                    .elevationMeters(145.0)
                    .dailyHandlingCapacityTons(2500)
                    .operationalStatus(true)
                    .connectivityNotes("Key railhead serving Nagaland and Manipur hill states")
                    .build());

            nodeRepository.save(LogisticsNode.builder()
                    .nodeCode("NODE-MOR-BORDER")
                    .name("Moreh Integrated Check Post (Asian Highway AH-1)")
                    .nodeType("BORDER_TRADE_POST")
                    .stateCode("MN")
                    .latitude(24.2442)
                    .longitude(94.3025)
                    .elevationMeters(240.0)
                    .dailyHandlingCapacityTons(800)
                    .operationalStatus(true)
                    .connectivityNotes("India-Myanmar Border Trade Corridor")
                    .build());
        }
    }

    private void seedSampleIncidents() {
        try {
            if (incidentRepository.count() == 0) {
                log.info("Seeding active terrain hazards in MongoDB...");
                incidentRepository.save(AccessibilityIncident.builder()
                        .incidentCode("INC-2026-SELA-001")
                        .hazardType("LANDSLIDE")
                        .severity("CRITICAL")
                        .location(new GeoJsonPoint(92.1037, 27.5034))
                        .roadName("NH-13 (Trans-Arunachal Highway)")
                        .landmark("Near Sela Pass approach, km 74")
                        .description("Heavy rockfall and debris flow blocking both lanes. BRO Task Force deployed with JCB excavators.")
                        .estimatedClearanceHours(14.0)
                        .passableBy4x4(false)
                        .active(true)
                        .reportedByUserId("officer_bro_01")
                        .reporterRole("ROLE_REGIONAL_INSPECTOR")
                        .verified(true)
                        .verifiedBy("BRO_CHIEF_ENGINEER")
                        .rainfallAtIncidentMm(145.0)
                        .reportedAt(Instant.now().minusSeconds(7200))
                        .build());

                incidentRepository.save(AccessibilityIncident.builder()
                        .incidentCode("INC-2026-PAGLA-002")
                        .hazardType("ROAD_SUBSIDENCE")
                        .severity("HIGH")
                        .location(new GeoJsonPoint(93.9170, 25.7920))
                        .roadName("NH-29 (Dimapur-Kohima Road)")
                        .landmark("Pagla Pahar sinking zone")
                        .description("Road shoulder collapse due to torrential monsoon. Single lane movement open for light vehicles only.")
                        .estimatedClearanceHours(8.0)
                        .passableBy4x4(true)
                        .active(true)
                        .reportedByUserId("driver_as01")
                        .reporterRole("ROLE_DRIVER")
                        .verified(true)
                        .verifiedBy("NAGALAND_PWD")
                        .rainfallAtIncidentMm(92.0)
                        .reportedAt(Instant.now().minusSeconds(14400))
                        .build());
            }
        } catch (Exception e) {
            log.warn("MongoDB incident seed skipped (Mongo connection may be offline in dev): {}", e.getMessage());
        }
    }
}
