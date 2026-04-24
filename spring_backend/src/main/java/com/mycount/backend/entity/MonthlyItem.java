package com.mycount.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "monthly_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MonthlyItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "record_id")
    private MonthlyRecord record;
    
    @Column(length = 100)
    private String name;
    
    private Integer amount = 0;
    
    @Column(length = 20)
    private String type;
    
    @Column(name = "is_imported_fixed")
    private Boolean isImportedFixed = false;
}
