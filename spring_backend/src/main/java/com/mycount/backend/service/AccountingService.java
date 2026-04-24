package com.mycount.backend.service;

import com.mycount.backend.entity.*;
import com.mycount.backend.repository.*;
import com.mycount.backend.dto.AppDtos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AccountingService {
    private final AccountingRecordRepository recordRepo;
    private final AccountingAccountRepository accountRepo;
    private final AccountingCategoryRepository categoryRepo;
    private final AccountingMonthlyBalanceRepository balanceRepo;
    private final AccountingAccountHistoryRepository historyRepo;

    public AccountingService(AccountingRecordRepository recordRepo, 
                             AccountingAccountRepository accountRepo, 
                             AccountingCategoryRepository categoryRepo,
                             AccountingMonthlyBalanceRepository balanceRepo,
                             AccountingAccountHistoryRepository historyRepo) {
        this.recordRepo = recordRepo;
        this.accountRepo = accountRepo;
        this.categoryRepo = categoryRepo;
        this.balanceRepo = balanceRepo;
        this.historyRepo = historyRepo;
    }

    public List<AccountingRecord> getAccountingRecords(Integer year, Integer month, String bankAccount) {
        List<AccountingRecord> records;
        if (year != null && month != null && bankAccount != null) {
            records = recordRepo.findByBankAccountAndAccountingYearAndAccountingMonthOrderByDateAsc(bankAccount, year, month);
            
            // Calculate running balance using monthly opening balance
            AccountingMonthlyBalance dbBal = balanceRepo.findByBankAccountAndYearAndMonth(bankAccount, year, month).orElse(null);
            int runningBal = (dbBal != null) ? dbBal.getOpeningBalance() : 0;
            
            for (AccountingRecord r : records) {
                if ("income".equals(r.getType())) {
                    runningBal += (r.getAmount() != null ? r.getAmount() : 0);
                } else {
                    runningBal -= (r.getAmount() != null ? r.getAmount() : 0);
                }
                r.setRunningBalance(runningBal);
            }
        } else if (year != null && month != null) {
            // New logic: Filter by year and month even if bankAccount is null
            records = recordRepo.findByAccountingYearAndAccountingMonthOrderByDateAsc(year, month);
        } else if (bankAccount != null) {
            records = recordRepo.findByBankAccountOrderByDateAsc(bankAccount);
        } else {
            records = recordRepo.findAll();
        }
        return records;
    }

    public AccountingRecord createAccountingRecord(AccountingRecordCreate dto) {
        AccountingRecord record = new AccountingRecord();
        record.setBankAccount(dto.bankAccount());
        record.setCategory(categoryRepo.findById(dto.categoryId()).orElse(null));
        record.setDescription(dto.description());
        record.setAmount(dto.amount() != null ? dto.amount() : 0);
        record.setType(dto.type());
        record.setPaymentMethod(dto.paymentMethod());
        record.setRemarks(dto.remarks());
        record.setDate(dto.date());
        record.setIsProcessed(dto.isProcessed() != null ? dto.isProcessed() : false);
        
        // Use explicitly provided accounting period if available, else fallback to date
        if (dto.accountingYear() != null && dto.accountingMonth() != null) {
            record.setAccountingYear(dto.accountingYear());
            record.setAccountingMonth(dto.accountingMonth());
        } else if (dto.date() != null) {
            record.setAccountingYear(dto.date().getYear());
            record.setAccountingMonth(dto.date().getMonthValue());
        }
        
        recordRepo.save(record);
        
        // Sync account balance
        syncAccountBalance(record.getBankAccount());
        
        // Record history
        addHistory(record.getBankAccount(), 
                   "income".equals(record.getType()) ? record.getAmount() : -record.getAmount(),
                   record.getDate(),
                   "장부 내역 등록: " + record.getDescription());
        
        return record;
    }

    public AccountingRecord updateAccountingRecord(Integer id, AccountingRecordCreate dto) {
        Optional<AccountingRecord> recOpt = recordRepo.findById(id);
        if (recOpt.isPresent()) {
            AccountingRecord oldRecord = recOpt.get();
            String oldBankAccount = oldRecord.getBankAccount();
            
            // Apply new data
            oldRecord.setBankAccount(dto.bankAccount());
            oldRecord.setCategory(categoryRepo.findById(dto.categoryId()).orElse(null));
            oldRecord.setDescription(dto.description());
            oldRecord.setAmount(dto.amount() != null ? dto.amount() : 0);
            oldRecord.setType(dto.type());
            oldRecord.setPaymentMethod(dto.paymentMethod());
            oldRecord.setRemarks(dto.remarks());
            oldRecord.setDate(dto.date());
            oldRecord.setIsProcessed(dto.isProcessed() != null ? dto.isProcessed() : false);
            
            if (dto.accountingYear() != null && dto.accountingMonth() != null) {
                oldRecord.setAccountingYear(dto.accountingYear());
                oldRecord.setAccountingMonth(dto.accountingMonth());
            } else if (oldRecord.getAccountingYear() == null && dto.date() != null) {
                // Fallback only for new/missing data
                oldRecord.setAccountingYear(dto.date().getYear());
                oldRecord.setAccountingMonth(dto.date().getMonthValue());
            }

            AccountingRecord saved = recordRepo.save(oldRecord);

            // Sync both old and new bank accounts just in case they switched
            syncAccountBalance(oldBankAccount);
            addHistory(oldBankAccount, 0, saved.getDate(), "장부 내역 수정(동기화): " + saved.getDescription());
            
            if (!oldBankAccount.equals(dto.bankAccount())) {
                syncAccountBalance(dto.bankAccount());
                addHistory(dto.bankAccount(), 0, saved.getDate(), "장부 내역 수정(계좌 이관): " + saved.getDescription());
            }
            
            return saved;
        }
        return null;
    }

    public void deleteAccountingRecord(Integer id) {
        Optional<AccountingRecord> recOpt = recordRepo.findById(id);
        if (recOpt.isPresent()) {
            AccountingRecord dbRecord = recOpt.get();
            String bankAccount = dbRecord.getBankAccount();
            String desc = dbRecord.getDescription();
            int amount = "income".equals(dbRecord.getType()) ? dbRecord.getAmount() : -dbRecord.getAmount();
            java.time.LocalDate targetDate = dbRecord.getDate();
            
            recordRepo.delete(dbRecord);
            syncAccountBalance(bankAccount);
            addHistory(bankAccount, -amount, targetDate, "장부 내역 삭제: " + desc);
        }
    }

    public List<AccountingAccount> getAccounts() {
        List<AccountingAccount> accounts = accountRepo.findAll();
        for (AccountingAccount acc : accounts) {
            syncAccountBalance(acc.getCode());
        }
        return accountRepo.findAll(); // Re-fetch to get updated values
    }

    public AccountingAccount updateInitialBalance(String code, Integer initialBalance) {
        AccountingAccount acc = accountRepo.findByCode(code).orElse(null);
        if (acc != null) {
            int oldInitial = (acc.getInitialBalance() != null) ? acc.getInitialBalance() : 0;
            acc.setInitialBalance(initialBalance);
            AccountingAccount saved = accountRepo.save(acc);
            syncAccountBalance(code);
            addHistory(code, initialBalance - oldInitial, java.time.LocalDate.now(), "기초 잔고 변경: " + oldInitial + " -> " + initialBalance);
            return saved;
        }
        return null;
    }

    public AccountingMonthlyBalance updateOpeningBalance(String bankAccount, Integer year, Integer month, Integer openingBalance) {
        AccountingMonthlyBalance bal = balanceRepo.findByBankAccountAndYearAndMonth(bankAccount, year, month).orElse(null);
        if (bal == null) {
            bal = new AccountingMonthlyBalance();
            bal.setBankAccount(bankAccount);
            bal.setYear(year);
            bal.setMonth(month);
        }
        bal.setOpeningBalance(openingBalance);
        return balanceRepo.save(bal);
    }

    public java.util.Map<String, java.util.Map<String, Integer>> getBalances(Integer year, Integer month) {
        java.util.Map<String, java.util.Map<String, Integer>> result = new java.util.HashMap<>();
        // Dynamic: Get all registered accounts instead of hardcoded ones
        List<AccountingAccount> allAccounts = accountRepo.findAll();
        for (AccountingAccount acc : allAccounts) {
            String code = acc.getCode();
            AccountingMonthlyBalance dbBal = balanceRepo.findByBankAccountAndYearAndMonth(code, year, month).orElse(null);
            int opening = (dbBal != null) ? dbBal.getOpeningBalance() : 0;
            
            List<AccountingRecord> records = getAccountingRecords(year, month, code);
            int closing = opening;
            for (AccountingRecord r : records) {
                if ("income".equals(r.getType())) {
                    closing += (r.getAmount() != null ? r.getAmount() : 0);
                } else {
                    closing -= (r.getAmount() != null ? r.getAmount() : 0);
                }
            }
            
            java.util.Map<String, Integer> map = new java.util.HashMap<>();
            map.put("opening", opening);
            map.put("closing", closing);
            result.put(code, map);
        }
        return result;
    }

    public List<java.util.Map<String, Object>> getStats(Integer year, Integer month) {
        List<AccountingRecord> records = getAccountingRecords(year, month, null);
        java.util.Map<String, java.util.Map<String, Integer>> groups = new java.util.HashMap<>();
        
        for (AccountingRecord r : records) {
            String key = r.getBankAccount() + "|" + (r.getCategory() != null ? r.getCategory().getName() : "미분류") + "|" + r.getType();
            groups.putIfAbsent(key, new java.util.HashMap<>());
            groups.get(key).put("amount", groups.get(key).getOrDefault("amount", 0) + (r.getAmount() != null ? r.getAmount() : 0));
        }
        
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (java.util.Map.Entry<String, java.util.Map<String, Integer>> entry : groups.entrySet()) {
            String[] parts = entry.getKey().split("\\|");
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("bank_account", parts[0]);
            map.put("category_name", parts.length > 1 ? parts[1] : "미분류");
            map.put("type", parts.length > 2 ? parts[2] : "expense");
            map.put("amount", entry.getValue().get("amount"));
            result.add(map);
        }
        return result;
    }
    public AccountingRecord carryOverTransaction(Integer id) {
        AccountingRecord record = recordRepo.findById(id).orElse(null);
        if (record != null) {
            int year = record.getAccountingYear();
            int month = record.getAccountingMonth();
            
            // Increment month
            month++;
            if (month > 12) {
                month = 1;
                year++;
            }
            
            record.setAccountingYear(year);
            record.setAccountingMonth(month);
            return recordRepo.save(record);
        }
        return null;
    }

    public AccountingRecord resetAccountingPeriod(Integer id) {
        AccountingRecord record = recordRepo.findById(id).orElse(null);
        if (record != null && record.getDate() != null) {
            record.setAccountingYear(record.getDate().getYear());
            record.setAccountingMonth(record.getDate().getMonthValue());
            return recordRepo.save(record);
        }
        return null;
    }

    public AccountingRecord toggleTransactionStatus(Integer id, Boolean isProcessed) {
        AccountingRecord record = recordRepo.findById(id).orElse(null);
        if (record != null) {
            record.setIsProcessed(isProcessed);
            AccountingRecord saved = recordRepo.save(record);
            syncAccountBalance(record.getBankAccount());
            return saved;
        }
        return null;
    }

    public void syncAccountBalance(String bankAccount) {
        AccountingAccount acc = accountRepo.findByCode(bankAccount).orElse(null);
        if (acc != null) {
            List<AccountingRecord> allRecords = recordRepo.findByBankAccountOrderByDateAsc(bankAccount);
            int balance = acc.getInitialBalance() != null ? acc.getInitialBalance() : 0;
            for (AccountingRecord r : allRecords) {
                if ("income".equals(r.getType())) {
                    balance += (r.getAmount() != null ? r.getAmount() : 0);
                } else {
                    balance -= (r.getAmount() != null ? r.getAmount() : 0);
                }
            }
            acc.setBalance(balance);
            accountRepo.save(acc);
        }
    }

    public void addHistory(String bankAccount, Integer changeAmount, java.time.LocalDate targetDate, String reason) {
        try {
            AccountingAccount acc = accountRepo.findByCode(bankAccount).orElse(null);
            if (acc != null) {
                Integer balanceAfter = (acc.getBalance() != null) ? acc.getBalance() : 0;
                AccountingAccountHistory history = AccountingAccountHistory.builder()
                        .bankAccount(bankAccount)
                        .changeAmount(changeAmount != null ? changeAmount : 0)
                        .balanceAfter(balanceAfter)
                        .targetDate(targetDate)
                        .reason(reason != null ? reason : "사유 미입력")
                        .build();
                historyRepo.save(history);
            }
        } catch (Exception e) {
            System.err.println("Failed to add account history: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public List<AccountingAccountHistory> getAccountHistory(String bankAccount) {
        try {
            return historyRepo.findByBankAccountOrderByCreatedAtDesc(bankAccount);
        } catch (Exception e) {
            System.err.println("Failed to fetch account history: " + e.getMessage());
            return new java.util.ArrayList<>();
        }
    }
}
