package com.sih.nerlogistics.repository.relational;

import com.sih.nerlogistics.domain.relational.DistrictNER;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DistrictNERRepository extends JpaRepository<DistrictNER, Long> {
    List<DistrictNER> findByStateCode(String stateCode);
    Optional<DistrictNER> findByDistrictName(String districtName);
    List<DistrictNER> findByTerrainClassification(String terrainClassification);
    List<DistrictNER> findByIsBorderDistrictTrue();
}
