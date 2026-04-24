package com.mycount.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "accounting_accounts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AccountingAccount {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(length = 50, unique = true)
    private String code;
    
    @Column(name = "display_name", length = 100)
    private String displayName;
    
    private Integer balance = 0;
    
    @Column(name = "initial_balance")
    private Integer initialBalance = 0;
}
