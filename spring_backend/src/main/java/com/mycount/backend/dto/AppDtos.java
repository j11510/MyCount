package com.mycount.backend.dto;

import java.time.LocalDate;
import java.util.List;

public class AppDtos {

    // Admin
    public record AdminCreate(String username, String password, String role) {}
    
    // FixedExpense
    public record FixedExpenseCreate(String name, Integer amount, Boolean isActive) {}
    
    // Monthly
    public record MonthlyItemCreate(String name, Integer amount, String type, Boolean isImportedFixed) {}
    public record MonthlyRecordCreate(Integer year, Integer month, Integer currentBalance) {}
    
    // Accounting
    public record AccountingCategoryCreate(String name, String type) {}
    public record AccountingRecordCreate(
        String bankAccount, 
        Integer categoryId, 
        String description, 
        Integer amount, 
        String type, 
        String paymentMethod, 
        String remarks, 
        LocalDate date, 
        Boolean isProcessed,
        @com.fasterxml.jackson.annotation.JsonProperty("accounting_year") Integer accountingYear,
        @com.fasterxml.jackson.annotation.JsonProperty("accounting_month") Integer accountingMonth
    ) {}
    public record AccountingAccountCreate(String code, String displayName, Integer balance, Integer initialBalance) {}
    
    // Donation
    public record DonationRecordCreate(String memberName, Integer amount, String note, LocalDate date) {}
    
    // Infant
    public record InfantExpenseCreate(Integer year, Integer month, String parentNo, String childNo, String description, Integer amount, String paymentMethod, String remarks, Boolean isChild) {}
    
    // Report
    public record MonthlyReportCreate(Integer year, Integer month, String reporter, String planData, String attendanceData, String remarks) {}
    
    // Balance
    public record AccountingMonthlyBalanceCreate(String bankAccount, Integer year, Integer month, Integer openingBalance) {}
    public record OpeningBalanceUpdate(
        @com.fasterxml.jackson.annotation.JsonProperty("bank_account") String bankAccount, 
        Integer year, 
        Integer month, 
        @com.fasterxml.jackson.annotation.JsonProperty("opening_balance") Integer openingBalance
    ) {}
    
    public record AccountingStatusUpdate(
        @com.fasterxml.jackson.annotation.JsonProperty("is_processed") Boolean isProcessed
    ) {}
}
