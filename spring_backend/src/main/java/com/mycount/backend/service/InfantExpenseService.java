package com.mycount.backend.service;

import com.mycount.backend.entity.InfantExpense;
import com.mycount.backend.repository.InfantExpenseRepository;
import com.mycount.backend.dto.AppDtos.InfantExpenseCreate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class InfantExpenseService {
    private final InfantExpenseRepository expenseRepo;

    public InfantExpenseService(InfantExpenseRepository expenseRepo) {
        this.expenseRepo = expenseRepo;
    }

    public List<InfantExpense> getInfantExpenses(Integer year, Integer month) {
        return expenseRepo.findByYearAndMonth(year, month);
    }

    public InfantExpense createInfantExpense(InfantExpenseCreate dto) {
        InfantExpense expense = new InfantExpense();
        expense.setYear(dto.year());
        expense.setMonth(dto.month());
        expense.setParentNo(dto.parentNo());
        expense.setChildNo(dto.childNo());
        expense.setDescription(dto.description());
        expense.setAmount(dto.amount() != null ? dto.amount() : 0);
        expense.setPaymentMethod(dto.paymentMethod());
        expense.setRemarks(dto.remarks());
        expense.setIsChild(dto.isChild() != null ? dto.isChild() : false);
        return expenseRepo.save(expense);
    }

    public void updateInfantExpense(Integer id, InfantExpenseCreate dto) {
        Optional<InfantExpense> opt = expenseRepo.findById(id);
        if (opt.isPresent()) {
            InfantExpense expense = opt.get();
            expense.setYear(dto.year());
            expense.setMonth(dto.month());
            expense.setParentNo(dto.parentNo());
            expense.setChildNo(dto.childNo());
            expense.setDescription(dto.description());
            expense.setAmount(dto.amount() != null ? dto.amount() : 0);
            expense.setPaymentMethod(dto.paymentMethod());
            expense.setRemarks(dto.remarks());
            expense.setIsChild(dto.isChild() != null ? dto.isChild() : false);
            expenseRepo.save(expense);
        }
    }

    public void deleteInfantExpense(Integer id) {
        expenseRepo.deleteById(id);
    }
}
