package com.sih.nerlogistics.repository.relational;

import com.sih.nerlogistics.domain.relational.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    Optional<Warehouse> findByWarehouseCode(String warehouseCode);
    List<Warehouse> findByDistrict_StateCode(String stateCode);
    List<Warehouse> findByIsHelipadAvailableTrue();
}
