package com.mycount.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "accounting_account_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
public class AccountingAccountHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "bank_account", length = 50)
    private String bankAccount;
    
    @Column(name = "change_amount")
    private Integer changeAmount;
    
    @Column(name = "balance_after")
    private Integer balanceAfter;
    
    private String reason;
    
    @Column(name = "target_date")
    private LocalDate targetDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
