package com.sih.nerlogistics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.sih.nerlogistics.domain.relational")
@EnableJpaRepositories(basePackages = "com.sih.nerlogistics.repository.relational")
@EnableMongoRepositories(basePackages = "com.sih.nerlogistics.repository.nosql")
public class NerLogisticsApplication {

    public static void main(String[] args) {
        SpringApplication.run(NerLogisticsApplication.class, args);
    }
}
