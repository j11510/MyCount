package com.mycount.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "fixed_expenses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class FixedExpense {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(length = 100)
    private String name;
    
    private Integer amount = 0;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
}
