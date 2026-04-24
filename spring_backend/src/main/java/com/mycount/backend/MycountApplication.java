package com.mycount.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MycountApplication {

    public static void main(String[] args) {
        // Dotenv 초기화 가능 (필요시 추가)
        SpringApplication.run(MycountApplication.class, args);
    }

}
