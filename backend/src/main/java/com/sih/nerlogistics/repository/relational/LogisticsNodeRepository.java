package com.sih.nerlogistics.repository.relational;

import com.sih.nerlogistics.domain.relational.LogisticsNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LogisticsNodeRepository extends JpaRepository<LogisticsNode, Long> {
    Optional<LogisticsNode> findByNodeCode(String nodeCode);
    List<LogisticsNode> findByStateCode(String stateCode);
    List<LogisticsNode> findByNodeType(String nodeType);
    List<LogisticsNode> findByOperationalStatusTrue();
}
