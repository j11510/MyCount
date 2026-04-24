package com.mycount.backend.repository;

import com.mycount.backend.entity.AccountingCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountingCategoryRepository extends JpaRepository<AccountingCategory, Integer> {
}
