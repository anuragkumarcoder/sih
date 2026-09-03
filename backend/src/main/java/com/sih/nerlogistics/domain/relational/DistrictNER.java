package com.sih.nerlogistics.domain.relational;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ner_districts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistrictNER {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String districtName;

    @Column(nullable = false, length = 10)
    private String stateCode; // AS, ML, AR, NL, MN, MZ, TR, SK

    @Column(nullable = false, length = 100)
    private String stateName;

    @Column(nullable = false)
    private Double headquartersLatitude;

    @Column(nullable = false)
    private Double headquartersLongitude;

    @Column(nullable = false)
    private Double averageElevationMeters;

    @Column(nullable = false, length = 50)
    private String terrainClassification; // HIGH_ALTITUDE_MOUNTAIN, HILL_RIDGE, RIVER_BASIN, FLOODPLAIN

    @Column(nullable = false)
    private Integer terrainDifficultyRating; // 1 (Easiest) to 10 (Extreme)

    @Column(nullable = false)
    private Double monsoonVulnerabilityIndex; // 0.0 to 1.0 (Rainfall & landslide hazard)

    @Column(nullable = false)
    private Boolean isBorderDistrict = false;

    @Column(length = 100)
    private String primaryAccessHighway; // e.g. "NH-13", "NH-29", "NH-6"
}
