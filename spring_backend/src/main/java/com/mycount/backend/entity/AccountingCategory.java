package com.mycount.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "accounting_categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AccountingCategory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(length = 50)
    private String name;
    
    @Column(length = 20)
    private String type;
}
