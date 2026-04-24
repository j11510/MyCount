package com.mycount.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "infant_expenses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InfantExpense {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private Integer year;
    private Integer month;
    
    @Column(name = "parent_no", length = 10)
    private String parentNo;
    
    @Column(name = "child_no", length = 10)
    private String childNo;
    
    @Column(length = 255)
    private String description;
    
    private Integer amount = 0;
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;
    
    @Column(length = 255)
    private String remarks;
    
    @Column(name = "is_child")
    private Boolean isChild = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
