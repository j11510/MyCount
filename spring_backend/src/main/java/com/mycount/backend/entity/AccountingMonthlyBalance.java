package com.mycount.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "accounting_monthly_balances")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AccountingMonthlyBalance {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "bank_account", length = 50)
    private String bankAccount;
    
    private Integer year;
    private Integer month;
    
    @Column(name = "opening_balance")
    private Integer openingBalance = 0;
}
