package com.mycount.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "monthly_reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MonthlyReport {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private Integer year;
    private Integer month;
    
    @Column(length = 50)
    private String reporter;
    
    @Column(name = "plan_data", length = 2000)
    private String planData;
    
    @Column(name = "attendance_data", length = 2000)
    private String attendanceData;
    
    @Column(length = 500)
    private String remarks;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
