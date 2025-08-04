package com.example.payflow_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PayflowBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PayflowBackendApplication.class, args);
	}

}
