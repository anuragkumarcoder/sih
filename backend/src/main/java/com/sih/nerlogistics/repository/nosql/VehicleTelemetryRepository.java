package com.sih.nerlogistics.repository.nosql;

import com.sih.nerlogistics.domain.nosql.VehicleTelemetry;
import org.springframework.data.domain.Pageable;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleTelemetryRepository extends MongoRepository<VehicleTelemetry, String> {

    List<VehicleTelemetry> findByVehicleIdOrderByTimestampDesc(String vehicleId, Pageable pageable);

    Optional<VehicleTelemetry> findFirstByVehicleIdOrderByTimestampDesc(String vehicleId);

    List<VehicleTelemetry> findByTripIdOrderByTimestampAsc(String tripId);

    // Geospatial proximity query (2dsphere index)
    List<VehicleTelemetry> findByLocationNear(Point point, Distance maxDistance);

    @Query("{ 'timestamp': { $gte: ?0, $lte: ?1 } }")
    List<VehicleTelemetry> findByTimestampBetween(Instant start, Instant end);

    List<VehicleTelemetry> findByIsEmergencySOSTrue();
}
