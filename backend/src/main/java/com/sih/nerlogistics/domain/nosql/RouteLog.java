package com.sih.nerlogistics.domain.nosql;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonLineString;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Document(collection = "route_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteLog {

    @Id
    private String id;

    @Indexed(unique = true)
    private String tripId;

    @Indexed
    private String vehicleId;

    private String originNode;

    private String destinationNode;

    private String optimizationStrategy; // AI_SAFE_TERRAIN, FASTEST_STANDARD, EMERGENCY_RELIEF

    private Double plannedDistanceKm;

    private Double actualDistanceKm;

    private Double plannedDurationHours;

    private Double actualDurationHours;

    private Double elevationGainMeters;

    private Double averageGradientPercent;

    private Double compositeRiskScore;

    private String tripStatus; // PLANNED, IN_TRANSIT, REROUTED, COMPLETED, ABORTED_HAZARD

    private GeoJsonLineString plannedTrajectory;

    private GeoJsonLineString actualTrajectory;

    private List<String> encounteredHazards;

    private Map<String, Object> telemetrySummary;

    private Instant departureTime;

    private Instant arrivalTime;
}
