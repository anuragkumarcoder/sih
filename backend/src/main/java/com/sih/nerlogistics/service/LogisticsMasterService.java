package com.sih.nerlogistics.service;

import com.sih.nerlogistics.domain.relational.DistrictNER;
import com.sih.nerlogistics.domain.relational.LogisticsNode;
import com.sih.nerlogistics.domain.relational.Warehouse;
import com.sih.nerlogistics.repository.relational.DistrictNERRepository;
import com.sih.nerlogistics.repository.relational.LogisticsNodeRepository;
import com.sih.nerlogistics.repository.relational.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LogisticsMasterService {

    private final DistrictNERRepository districtRepository;
    private final WarehouseRepository warehouseRepository;
    private final LogisticsNodeRepository logisticsNodeRepository;

    // Districts
    @Transactional(readOnly = true)
    public List<DistrictNER> getAllDistricts() {
        return districtRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<DistrictNER> getDistrictsByState(String stateCode) {
        return districtRepository.findByStateCode(stateCode);
    }

    @Transactional(readOnly = true)
    public Optional<DistrictNER> getDistrictById(Long id) {
        return districtRepository.findById(id);
    }

    @Transactional
    public DistrictNER saveDistrict(DistrictNER district) {
        return districtRepository.save(district);
    }

    // Warehouses
    @Transactional(readOnly = true)
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Warehouse> getWarehousesByState(String stateCode) {
        return warehouseRepository.findByDistrict_StateCode(stateCode);
    }

    @Transactional(readOnly = true)
    public Optional<Warehouse> getWarehouseByCode(String code) {
        return warehouseRepository.findByWarehouseCode(code);
    }

    @Transactional
    public Warehouse saveWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    // Logistics Nodes
    @Transactional(readOnly = true)
    public List<LogisticsNode> getAllNodes() {
        return logisticsNodeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<LogisticsNode> getNodesByState(String stateCode) {
        return logisticsNodeRepository.findByStateCode(stateCode);
    }

    @Transactional(readOnly = true)
    public List<LogisticsNode> getNodesByType(String type) {
        return logisticsNodeRepository.findByNodeType(type);
    }

    @Transactional
    public LogisticsNode saveNode(LogisticsNode node) {
        return logisticsNodeRepository.save(node);
    }
}
