package com.mycount.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "donation_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DonationRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "member_name", length = 100)
    private String memberName;
    
    private Integer amount = 0;
    
    @Column(length = 255)
    private String note;
    
    private LocalDate date;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
