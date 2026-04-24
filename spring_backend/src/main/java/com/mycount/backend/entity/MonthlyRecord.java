package com.mycount.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity @Table(name = "monthly_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MonthlyRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private Integer year;
    private Integer month;
    
    @Column(name = "current_balance")
    private Integer currentBalance = 0;
    
    @OneToMany(mappedBy = "record", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<MonthlyItem> items;
}
