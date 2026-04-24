package com.mycount.backend.repository;

import com.mycount.backend.entity.InfantExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InfantExpenseRepository extends JpaRepository<InfantExpense, Integer> {
    List<InfantExpense> findByYearAndMonth(Integer year, Integer month);
}
