package com.mycount.backend.service;

import com.mycount.backend.entity.FixedExpense;
import com.mycount.backend.repository.FixedExpenseRepository;
import com.mycount.backend.dto.AppDtos.FixedExpenseCreate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FixedExpenseService {
    private final FixedExpenseRepository fixedExpenseRepo;

    public FixedExpenseService(FixedExpenseRepository fixedExpenseRepo) {
        this.fixedExpenseRepo = fixedExpenseRepo;
    }

    public List<FixedExpense> getFixedExpenses() {
        return fixedExpenseRepo.findAll();
    }

    public FixedExpense createFixedExpense(FixedExpenseCreate dto) {
        FixedExpense expense = new FixedExpense();
        expense.setName(dto.name());
        expense.setAmount(dto.amount() != null ? dto.amount() : 0);
        expense.setIsActive(dto.isActive() != null ? dto.isActive() : true);
        return fixedExpenseRepo.save(expense);
    }

    public void deleteFixedExpense(Integer id) {
        fixedExpenseRepo.deleteById(id);
    }
}
