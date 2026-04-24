package com.mycount.backend.service;

import com.mycount.backend.entity.MonthlyRecord;
import com.mycount.backend.entity.MonthlyItem;
import com.mycount.backend.entity.FixedExpense;
import com.mycount.backend.repository.MonthlyRecordRepository;
import com.mycount.backend.repository.MonthlyItemRepository;
import com.mycount.backend.repository.FixedExpenseRepository;
import com.mycount.backend.dto.AppDtos.MonthlyRecordCreate;
import com.mycount.backend.dto.AppDtos.MonthlyItemCreate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MonthlyRecordService {
    private final MonthlyRecordRepository recordRepo;
    private final MonthlyItemRepository itemRepo;
    private final FixedExpenseRepository fixedExpenseRepo;

    public MonthlyRecordService(MonthlyRecordRepository recordRepo, MonthlyItemRepository itemRepo, FixedExpenseRepository fixedExpenseRepo) {
        this.recordRepo = recordRepo;
        this.itemRepo = itemRepo;
        this.fixedExpenseRepo = fixedExpenseRepo;
    }

    public List<MonthlyRecord> getMonthlyRecords() {
        return recordRepo.findAll(); // 추후 orderBy나 page 적용
    }

    public MonthlyRecord getMonthlyRecord(Integer id) {
        return recordRepo.findById(id).orElse(null);
    }

    public MonthlyRecord getMonthlyRecordByDate(Integer year, Integer month) {
        return recordRepo.findByYearAndMonth(year, month).orElse(null);
    }

    public MonthlyRecord createMonthlyRecord(MonthlyRecordCreate dto) {
        MonthlyRecord record = new MonthlyRecord();
        record.setYear(dto.year());
        record.setMonth(dto.month());
        record.setCurrentBalance(dto.currentBalance() != null ? dto.currentBalance() : 0);
        
        List<MonthlyItem> items = new ArrayList<>();
        
        // Auto import fixed expenses
        List<FixedExpense> fixedExpenses = fixedExpenseRepo.findAll();
        for (FixedExpense fe : fixedExpenses) {
            if (Boolean.TRUE.equals(fe.getIsActive())) {
                MonthlyItem item = new MonthlyItem();
                item.setName(fe.getName());
                item.setAmount(fe.getAmount());
                item.setType("fixed_expense");
                item.setIsImportedFixed(true);
                item.setRecord(record);
                items.add(item);
            }
        }
        
        record.setItems(items);
        return recordRepo.save(record);
    }

    public void updateMonthlyRecordBalance(Integer recordId, Integer currentBalance) {
        Optional<MonthlyRecord> opt = recordRepo.findById(recordId);
        if (opt.isPresent()) {
            MonthlyRecord record = opt.get();
            record.setCurrentBalance(currentBalance);
            recordRepo.save(record);
        }
    }

    public MonthlyItem createMonthlyItem(Integer recordId, MonthlyItemCreate dto) {
        Optional<MonthlyRecord> recordOpt = recordRepo.findById(recordId);
        if (recordOpt.isPresent()) {
            MonthlyItem item = new MonthlyItem();
            item.setRecord(recordOpt.get());
            item.setName(dto.name());
            item.setAmount(dto.amount() != null ? dto.amount() : 0);
            item.setType(dto.type());
            item.setIsImportedFixed(dto.isImportedFixed() != null ? dto.isImportedFixed() : false);
            return itemRepo.save(item);
        }
        return null;
    }

    public void deleteMonthlyItem(Integer itemId) {
        itemRepo.deleteById(itemId);
    }

    public void updateMonthlyItem(Integer itemId, Integer amount) {
        Optional<MonthlyItem> opt = itemRepo.findById(itemId);
        if (opt.isPresent()) {
            MonthlyItem item = opt.get();
            item.setAmount(amount);
            itemRepo.save(item);
        }
    }

    public void deleteMonthlyRecord(Integer recordId) {
        recordRepo.deleteById(recordId);
    }
}
