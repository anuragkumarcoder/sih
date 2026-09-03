package com.sih.nerlogistics.domain.relational;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "warehouses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String warehouseCode; // e.g. "WH-GHY-01", "WH-TWG-01"

    @Column(nullable = false, length = 120)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id", nullable = false)
    private DistrictNER district;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private Double elevationMeters;

    @Column(nullable = false)
    private Double totalCapacityMetricTons;

    @Column(nullable = false)
    private Double currentStockMetricTons;

    @Column(nullable = false)
    private Double coldStorageCapacityTons; // Critical for hill state medicine/vaccines/horticulture

    @Column(nullable = false)
    private Double emergencyReliefStockTons;

    @Column(nullable = false)
    private Boolean isHelipadAvailable = false; // For drone/aerial supply drops in monsoons

    @Column(nullable = false)
    private Boolean isBackupPowerAvailable = true; // Generator / solar microgrid

    @Column(length = 100)
    private String contactPerson;

    @Column(length = 20)
    private String contactPhone;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
