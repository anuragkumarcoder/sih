package com.sih.nerlogistics.service;

import com.sih.nerlogistics.domain.nosql.AccessibilityIncident;
import com.sih.nerlogistics.dto.IncidentReportDTO;
import com.sih.nerlogistics.repository.nosql.AccessibilityIncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncidentService {

    private final AccessibilityIncidentRepository incidentRepository;

    public AccessibilityIncident reportIncident(IncidentReportDTO dto, String reportedByUserId, String role) {
        String code = "INC-" + Instant.now().getEpochSecond() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        AccessibilityIncident incident = AccessibilityIncident.builder()
                .incidentCode(code)
                .hazardType(dto.getHazardType())
                .severity(dto.getSeverity())
                .location(new GeoJsonPoint(dto.getLongitude(), dto.getLatitude()))
                .roadName(dto.getRoadName())
                .landmark(dto.getLandmark())
                .description(dto.getDescription())
                .estimatedClearanceHours(dto.getEstimatedClearanceHours() != null ? dto.getEstimatedClearanceHours() : 12.0)
                .passableBy4x4(dto.getPassableBy4x4() != null ? dto.getPassableBy4x4() : false)
                .active(true)
                .reportedByUserId(reportedByUserId)
                .reporterRole(role)
                .verified(false)
                .photoUrls(dto.getPhotoUrls() != null ? dto.getPhotoUrls() : List.of())
                .rainfallAtIncidentMm(dto.getRainfallAtIncidentMm() != null ? dto.getRainfallAtIncidentMm() : 0.0)
                .reportedAt(Instant.now())
                .build();

        return incidentRepository.save(incident);
    }

    public List<AccessibilityIncident> getActiveIncidents() {
        return incidentRepository.findByActiveTrue();
    }

    public List<AccessibilityIncident> getIncidentsNear(double lat, double lng, double radiusKm) {
        Point point = new Point(lng, lat);
        Distance distance = new Distance(radiusKm, Metrics.KILOMETERS);
        return incidentRepository.findByLocationNearAndActiveTrue(point, distance);
    }

    public Optional<AccessibilityIncident> verifyIncident(String id, String verifiedBy) {
        return incidentRepository.findById(id).map(inc -> {
            inc.setVerified(true);
            inc.setVerifiedBy(verifiedBy);
            return incidentRepository.save(inc);
        });
    }

    public Optional<AccessibilityIncident> updateClearance(String id, int clearancePercent, String status) {
        return incidentRepository.findById(id).map(inc -> {
            inc.setClearancePercent(clearancePercent);
            inc.setStatus(status != null ? status : "CLEARANCE_IN_PROGRESS");
            if (clearancePercent >= 100) {
                inc.setActive(false);
                inc.setStatus("OFFICIAL_CLEARED");
                inc.setResolvedAt(Instant.now());
            } else {
                inc.setActive(true);
            }
            return incidentRepository.save(inc);
        });
    }

    public Optional<AccessibilityIncident> resolveIncident(String id) {
        return incidentRepository.findById(id).map(inc -> {
            inc.setActive(false);
            inc.setStatus("OFFICIAL_CLEARED");
            inc.setClearancePercent(100);
            inc.setResolvedAt(Instant.now());
            return incidentRepository.save(inc);
        });
    }
}
