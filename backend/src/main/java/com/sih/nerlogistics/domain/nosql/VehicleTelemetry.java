package com.sih.nerlogistics.domain.nosql;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.Instant;

@Document(collection = "vehicle_telemetry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@CompoundIndexes({
    @CompoundIndex(name = "vehicle_time_idx", def = "{'vehicleId': 1, 'timestamp': -1}"),
    @CompoundIndex(name = "trip_time_idx", def = "{'tripId': 1, 'timestamp': 1}")
})
public class VehicleTelemetry {

    @Id
    private String id;

    @Indexed
    private String vehicleId; // e.g. "NER-TRUCK-AS01-9921"

    @Indexed
    private String tripId;

    private String driverName;

    private String vehicleType; // HEAVY_COMMERCIAL, MEDIUM_COMMERCIAL, OFFROAD_4X4, CARGO_DRONE

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location; // [longitude, latitude]

    private Double altitudeMeters;

    private Double speedKmh;

    private Double headingDegrees; // 0 - 360

    private Double engineTemperatureCelsius;

    private Double containerTempCelsius; // Cold-Chain Reefer Temperature (+2°C to +8°C)

    private Double fuelPercentage;

    private Double batteryPercentage; // For EV / hybrid mountain transports

    private Double cargoWeightKg;

    private Double cabinPressureHpa; // For high-altitude oxygen monitoring

    private Boolean isEmergencySOS;

    private String networkSignalStrength; // 4G, 5G, 2G, SATELLITE_EMERGENCY

    @Indexed
    private Instant timestamp;
}
