package com.mycount.backend.controller;

import com.mycount.backend.dto.AppDtos.FixedExpenseCreate;
import com.mycount.backend.dto.AppDtos.MonthlyItemCreate;
import com.mycount.backend.dto.AppDtos.MonthlyRecordCreate;
import com.mycount.backend.entity.FixedExpense;
import com.mycount.backend.entity.MonthlyItem;
import com.mycount.backend.entity.MonthlyRecord;
import com.mycount.backend.service.FixedExpenseService;
import com.mycount.backend.service.MonthlyRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "Expense", description = "고정 지출 및 월별 예산 내역 API")
@RestController
@RequestMapping("/api")
public class ExpenseController {

    private final FixedExpenseService fixedExpenseService;
    private final MonthlyRecordService monthlyRecordService;

    public ExpenseController(FixedExpenseService fixedExpenseService, MonthlyRecordService monthlyRecordService) {
        this.fixedExpenseService = fixedExpenseService;
        this.monthlyRecordService = monthlyRecordService;
    }

    @Operation(summary = "고정 지출 조회", description = "설정된 모든 고정 지출 항목을 조회합니다.")
    @GetMapping("/fixed-expenses")
    public ResponseEntity<List<FixedExpense>> getFixedExpenses() {
        return ResponseEntity.ok(fixedExpenseService.getFixedExpenses());
    }

    @Operation(summary = "고정 지출 등록", description = "새로운 고정 지출 항목을 추가합니다.")
    @PostMapping("/fixed-expenses")
    public ResponseEntity<FixedExpense> createFixedExpense(@RequestBody FixedExpenseCreate dto) {
        return ResponseEntity.ok(fixedExpenseService.createFixedExpense(dto));
    }

    @Operation(summary = "고정 지출 삭제", description = "ID를 통해 고정 지출 항목을 삭제합니다.")
    @DeleteMapping("/fixed-expenses/{id}")
    public ResponseEntity<Map<String, String>> deleteFixedExpense(@PathVariable Integer id) {
        fixedExpenseService.deleteFixedExpense(id);
        Map<String, String> res = new HashMap<>();
        res.put("status", "deleted");
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "모든 월별 예산 기록 조회", description = "모든 월별 기록(Monthly Record)을 조회합니다.")
    @GetMapping("/monthly-records")
    public ResponseEntity<List<MonthlyRecord>> getMonthlyRecords() {
        return ResponseEntity.ok(monthlyRecordService.getMonthlyRecords());
    }

    @Operation(summary = "특정 월별 예산 기록 조회", description = "ID를 통해 특정 월별 기록을 단건 조회합니다.")
    @GetMapping("/monthly-records/{id}")
    public ResponseEntity<?> getMonthlyRecord(@PathVariable Integer id) {
        MonthlyRecord record = monthlyRecordService.getMonthlyRecord(id);
        if (record == null) {
            Map<String, String> err = new HashMap<>();
            err.put("detail", "Record not found");
            return ResponseEntity.status(404).body(err);
        }
        return ResponseEntity.ok(record);
    }

    @Operation(summary = "해당 월 예산 기록 생성", description = "해당 연도와 월의 새로운 예산 기록을 생성하며, 고정 지출 내역을 자동 임포트합니다.")
    @PostMapping("/monthly-records")
    public ResponseEntity<?> createMonthlyRecord(@RequestBody MonthlyRecordCreate dto) {
        if (monthlyRecordService.getMonthlyRecordByDate(dto.year(), dto.month()) != null) {
            Map<String, String> err = new HashMap<>();
            err.put("detail", "Record for this month already exists");
            return ResponseEntity.badRequest().body(err);
        }
        return ResponseEntity.ok(monthlyRecordService.createMonthlyRecord(dto));
    }

    @Operation(summary = "월별 기록 잔액 업데이트", description = "해당 월별 기록의 현재 잔액을 수정합니다.")
    @PutMapping("/monthly-records/{id}/balance")
    public ResponseEntity<?> updateBalance(@PathVariable Integer id, @RequestParam(name = "current_balance") Integer currentBalance) {
        monthlyRecordService.updateMonthlyRecordBalance(id, currentBalance);
        return ResponseEntity.ok(monthlyRecordService.getMonthlyRecord(id));
    }

    @Operation(summary = "월별 예산 기록 삭제", description = "특정 월별 기록을 삭제합니다.")
    @DeleteMapping("/monthly-records/{id}")
    public ResponseEntity<Map<String, String>> deleteMonthlyRecord(@PathVariable Integer id) {
        monthlyRecordService.deleteMonthlyRecord(id);
        Map<String, String> res = new HashMap<>();
        res.put("status", "deleted");
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "월별 예산 기록 세부 항목(Item) 추가", description = "기록된 월에 새로운 내역(Item)을 추가합니다.")
    @PostMapping("/monthly-records/{id}/items")
    public ResponseEntity<MonthlyItem> createItemForRecord(@PathVariable Integer id, @RequestBody MonthlyItemCreate dto) {
        return ResponseEntity.ok(monthlyRecordService.createMonthlyItem(id, dto));
    }

    @Operation(summary = "세부 항목 금액 업데이트", description = "기록된 세부 항목의 수정된 금액을 적용합니다.")
    @PutMapping("/monthly-items/{itemId}")
    public ResponseEntity<?> updateItemAmount(@PathVariable Integer itemId, @RequestParam Integer amount) {
        monthlyRecordService.updateMonthlyItem(itemId, amount);
        Map<String, String> res = new HashMap<>();
        res.put("status", "updated");
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "세부 항목 삭제", description = "ID를 통해 세부 항목 하나를 삭제합니다.")
    @DeleteMapping("/monthly-items/{itemId}")
    public ResponseEntity<Map<String, String>> deleteItem(@PathVariable Integer itemId) {
        monthlyRecordService.deleteMonthlyItem(itemId);
        Map<String, String> res = new HashMap<>();
        res.put("status", "deleted");
        return ResponseEntity.ok(res);
    }
}
