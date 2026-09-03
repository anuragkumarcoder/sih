package com.sih.nerlogistics.repository.nosql;

import com.sih.nerlogistics.domain.nosql.RouteLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteLogRepository extends MongoRepository<RouteLog, String> {
    Optional<RouteLog> findByTripId(String tripId);
    List<RouteLog> findByVehicleId(String vehicleId);
    List<RouteLog> findByTripStatus(String tripStatus);
    List<RouteLog> findTop20ByOrderByDepartureTimeDesc();
}
