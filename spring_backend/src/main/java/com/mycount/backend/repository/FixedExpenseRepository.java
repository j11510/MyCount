package com.mycount.backend.repository;

import com.mycount.backend.entity.FixedExpense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FixedExpenseRepository extends JpaRepository<FixedExpense, Integer> {
}
