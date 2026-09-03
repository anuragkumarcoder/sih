package com.sih.nerlogistics.repository.nosql;

import com.sih.nerlogistics.domain.nosql.AccessibilityIncident;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccessibilityIncidentRepository extends MongoRepository<AccessibilityIncident, String> {

    Optional<AccessibilityIncident> findByIncidentCode(String incidentCode);

    List<AccessibilityIncident> findByActiveTrue();

    List<AccessibilityIncident> findByActiveTrueAndHazardType(String hazardType);

    List<AccessibilityIncident> findByActiveTrueAndSeverity(String severity);

    // Geospatial search for obstructions within radius of a point
    List<AccessibilityIncident> findByLocationNearAndActiveTrue(Point point, Distance maxDistance);
}
