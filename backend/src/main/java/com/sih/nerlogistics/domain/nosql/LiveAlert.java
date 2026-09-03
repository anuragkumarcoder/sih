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

@Document(collection = "live_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveAlert {

    @Id
    private String id;

    @Indexed
    private String alertType; // LANDSLIDE_EVACUATION, FLASH_FLOOD_WARNING, REROUTE_DISPATCH, EMERGENCY_SOS

    @Indexed
    private String severity; // INFO, WARNING, DANGER, CRITICAL

    private String title;

    private String message;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint epicentre;

    private Double radiusKm;

    private List<String> targetedStates; // e.g. ["AS", "AR", "NL"]

    private List<String> targetedVehicleIds;

    private Boolean active;

    @Indexed
    private Instant createdAt;

    private Instant expiresAt;
}
