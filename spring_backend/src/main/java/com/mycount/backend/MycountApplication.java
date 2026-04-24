package com.mycount.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MycountApplication {

    public static void main(String[] args) {
        // Dotenv 초기화: 루트 디렉토리의 .env 파일을 로드합니다.
        try {
            io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
                    .directory("../") // spring_backend의 상위인 루트 디렉토리
                    .ignoreIfMissing()
                    .load();
            dotenv.entries().forEach(e -> {
                if (System.getProperty(e.getKey()) == null) {
                    System.setProperty(e.getKey(), e.getValue());
                }
            });
        } catch (Exception e) {
            System.out.println("Dotenv load failed or skipped: " + e.getMessage());
        }
        
        SpringApplication.run(MycountApplication.class, args);
    }

}
