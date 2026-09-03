package com.sih.nerlogistics.domain.relational;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "logistics_nodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticsNode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String nodeCode; // e.g. "NODE-GHY-AIR", "NODE-DMR-RAIL", "NODE-MOR-BORDER"

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 50)
    private String nodeType; // AIR_CARGO, RAILHEAD, INLAND_WATERWAY_PORT, BORDER_TRADE_POST, MOUNTAIN_TRANSIT_DEPOT

    @Column(nullable = false, length = 10)
    private String stateCode;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private Double elevationMeters;

    @Column(nullable = false)
    private Integer dailyHandlingCapacityTons;

    @Column(nullable = false)
    private Boolean operationalStatus = true;

    @Column(length = 255)
    private String connectivityNotes; // e.g. "Broad gauge railway freight siding", "Pandu Port Brahmaputra NW-2"
}
