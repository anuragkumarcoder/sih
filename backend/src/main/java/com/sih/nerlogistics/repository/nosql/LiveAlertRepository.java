package com.sih.nerlogistics.repository.nosql;

import com.sih.nerlogistics.domain.nosql.LiveAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface LiveAlertRepository extends MongoRepository<LiveAlert, String> {
    List<LiveAlert> findByActiveTrueOrderByCreatedAtDesc();
    List<LiveAlert> findByActiveTrueAndTargetedStatesContaining(String stateCode);
    List<LiveAlert> findByExpiresAtBefore(Instant now);
}
