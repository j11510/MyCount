package com.mycount.backend.repository;

import com.mycount.backend.entity.AccountingAccountHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccountingAccountHistoryRepository extends JpaRepository<AccountingAccountHistory, Long> {
    List<AccountingAccountHistory> findByBankAccountOrderByCreatedAtDesc(String bankAccount);
}
