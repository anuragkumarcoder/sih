package com.sih.nerlogistics.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI nerLogisticsOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("NER Smart Logistics & Accessibility Intelligence Platform API")
                        .description("Backend REST API supporting hybrid relational (MySQL) and geospatial/time-series (MongoDB) data architecture for North Eastern Region Logistics (SIH26002).")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Smart India Hackathon 2026 - SIH26002")
                                .email("contact@ner-logistics.gov.in"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components().addSecuritySchemes("Bearer Authentication", createAPIKeyScheme()));
    }

    private SecurityScheme createAPIKeyScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .bearerFormat("JWT")
                .scheme("bearer");
    }
}
