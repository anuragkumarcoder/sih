package com.sih.nerlogistics.domain.nosql;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Document(collection = "accessibility_incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccessibilityIncident {

    @Id
    private String id;

    @Indexed(unique = true)
    private String incidentCode; // e.g. "INC-2026-SELA-001"

    @Indexed
    private String hazardType; // LANDSLIDE, FLASH_FLOOD, ROAD_SUBSIDENCE, BRIDGE_COLLAPSE, HEAVY_FOG, SNOW_ICE

    @Indexed
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;

    private String roadName; // e.g. "NH-13 (Balipara-Charduar-Tawang Road)"

    private String landmark; // e.g. "Between Bhalukpong and Tenga Valley, km 42"

    private String description;

    private Double estimatedClearanceHours;

    private Boolean passableBy4x4;

    private Boolean active;

    private String reportedByUserId;

    private String reporterRole; // DRIVER, BRO_OFFICIAL, NDRF_TEAM, LOCAL_POLICE

    private Boolean verified;

    private String verifiedBy;

    private List<String> photoUrls;

    private Double rainfallAtIncidentMm;

    private Integer clearancePercent; // 0 to 100

    private String status; // UNVERIFIED, OFFICIAL_VERIFIED, CLEARANCE_IN_PROGRESS, OFFICIAL_CLEARED

    @Indexed
    private Instant reportedAt;

    private Instant resolvedAt;
}
