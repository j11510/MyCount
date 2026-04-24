package com.mycount.backend.repository;

import com.mycount.backend.entity.AccountingMonthlyBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AccountingMonthlyBalanceRepository extends JpaRepository<AccountingMonthlyBalance, Integer> {
    Optional<AccountingMonthlyBalance> findByBankAccountAndYearAndMonth(String bankAccount, Integer year, Integer month);
}
