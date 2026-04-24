package com.mycount.backend.repository;

import com.mycount.backend.entity.AccountingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AccountingRecordRepository extends JpaRepository<AccountingRecord, Integer> {
    List<AccountingRecord> findByBankAccountAndAccountingYearAndAccountingMonthOrderByDateAsc(String bankAccount, Integer accountingYear, Integer accountingMonth);
    List<AccountingRecord> findByAccountingYearAndAccountingMonthOrderByDateAsc(Integer accountingYear, Integer accountingMonth);
    List<AccountingRecord> findByBankAccountAndDateBetweenOrderByDateAsc(String bankAccount, LocalDate startDate, LocalDate endDate);
    List<AccountingRecord> findByBankAccountOrderByDateAsc(String bankAccount);
}
