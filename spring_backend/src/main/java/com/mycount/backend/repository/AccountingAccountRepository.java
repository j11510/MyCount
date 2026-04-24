package com.mycount.backend.repository;

import com.mycount.backend.entity.AccountingAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AccountingAccountRepository extends JpaRepository<AccountingAccount, Integer> {
    Optional<AccountingAccount> findByCode(String code);
}
