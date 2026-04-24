package com.mycount.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Table(name = "accounting_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AccountingRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "bank_account", length = 50)
    private String bankAccount;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private AccountingCategory category;
    
    @Column(length = 255)
    private String description;
    
    private Integer amount = 0;
    
    @Column(length = 20)
    private String type;
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;
    
    @Column(length = 500)
    private String remarks;
    
    private LocalDate date;
    
    @Column(name = "is_processed")
    private Boolean isProcessed = false;

    @Transient
    private Integer runningBalance;

    @Column(name = "accounting_year")
    private Integer accountingYear;

    @Column(name = "accounting_month")
    private Integer accountingMonth;
}
