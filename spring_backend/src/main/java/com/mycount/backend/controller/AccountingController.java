package com.mycount.backend.controller;

import com.mycount.backend.dto.AppDtos.*;
import com.mycount.backend.entity.*;
import com.mycount.backend.repository.AccountingCategoryRepository;
import com.mycount.backend.repository.AccountingAccountHistoryRepository;
import com.mycount.backend.service.AccountingService;
import com.mycount.backend.service.InfantExpenseService;
import com.mycount.backend.service.MonthlyReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "Accounting", description = "재정 장부, 카테고리, 영아부 결산 및 월간 리포트 API")
@RestController
@RequestMapping("/api")
public class AccountingController {
    
    private final AccountingService accountingService;
    private final AccountingCategoryRepository categoryRepo;
    private final MonthlyReportService reportService;
    private final InfantExpenseService infantService;
    private final AccountingAccountHistoryRepository historyRepo;

    public AccountingController(AccountingService accountingService, 
                                AccountingCategoryRepository categoryRepo,
                                MonthlyReportService reportService,
                                InfantExpenseService infantService,
                                AccountingAccountHistoryRepository historyRepo) {
        this.accountingService = accountingService;
        this.categoryRepo = categoryRepo;
        this.reportService = reportService;
        this.infantService = infantService;
        this.historyRepo = historyRepo;
    }

    @Operation(summary = "재정 카테고리 조회", description = "수입/지출 재정 카테고리를 조회합니다. (type 쿼리로 필터 가능)")
    @GetMapping("/accounting/categories")
    public ResponseEntity<List<AccountingCategory>> getCategories(@RequestParam(required = false) String type) {
        if (type != null) {
            return ResponseEntity.ok(categoryRepo.findAll().stream().filter(c -> type.equals(c.getType())).toList());
        }
        return ResponseEntity.ok(categoryRepo.findAll());
    }

    @Operation(summary = "재정 카테고리 등록", description = "새로운 재정 카테고리를 추가합니다.")
    @PostMapping("/accounting/categories")
    public ResponseEntity<AccountingCategory> createCategory(@RequestBody AccountingCategoryCreate dto) {
        AccountingCategory cat = new AccountingCategory();
        cat.setName(dto.name());
        cat.setType(dto.type() != null ? dto.type() : "general");
        return ResponseEntity.ok(categoryRepo.save(cat));
    }

    @Operation(summary = "재정 카테고리 삭제", description = "ID를 통해 재정 카테고리를 삭제합니다.")
    @DeleteMapping("/accounting/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Integer id) {
        categoryRepo.deleteById(id);
        Map<String, String> res = new HashMap<>();
        res.put("status", "deleted");
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "장부 거래 내역 조회", description = "특정 연월의 특정 통장(bankAccount) 거래 내역을 조회합니다.")
    @GetMapping("/accounting/transactions/{bankAccount}")
    public ResponseEntity<List<AccountingRecord>> getTransactions(@PathVariable String bankAccount, 
                                                                  @RequestParam("year") Integer year, 
                                                                  @RequestParam("month") Integer month) {
        return ResponseEntity.ok(accountingService.getAccountingRecords(year, month, bankAccount));
    }

    @PostMapping("/accounting/transactions")
    public ResponseEntity<AccountingRecord> createTransaction(@RequestBody AccountingRecordCreate dto) {
        return ResponseEntity.ok(accountingService.createAccountingRecord(dto));
    }

    @Operation(summary = "장부 거래 내역 수정", description = "ID를 통해 기존 장부 거래 내역을 수정합니다.")
    @PutMapping("/accounting/transactions/{id}")
    public ResponseEntity<AccountingRecord> updateTransaction(@PathVariable Integer id, @RequestBody AccountingRecordCreate dto) {
        return ResponseEntity.ok(accountingService.updateAccountingRecord(id, dto));
    }

    @Operation(summary = "장부 거래 내역 삭제", description = "ID를 통해 특정 장부 거래 내역을 삭제합니다.")
    @DeleteMapping("/accounting/transactions/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Integer id) {
        accountingService.deleteAccountingRecord(id);
        Map<String, String> res = new HashMap<>();
        res.put("status", "deleted");
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "회계 통장 계좌 목록 조회", description = "시스템에 등록된 회계 통장 계좌 목록을 조회합니다.")
    @GetMapping("/accounting/accounts")
    public ResponseEntity<List<AccountingAccount>> getAccounts() {
        return ResponseEntity.ok(accountingService.getAccounts());
    }

    @Operation(summary = "이월/잔고액 내역 조회", description = "해당 월의 각 통장별 이월/잔고액 정보를 조회합니다.")
    @GetMapping("/accounting/balances")
    public ResponseEntity<Map<String, Map<String, Integer>>> getBalances(@RequestParam("year") Integer year, @RequestParam("month") Integer month) {
        return ResponseEntity.ok(accountingService.getBalances(year, month));
    }

    @Operation(summary = "회계 분석/통계 조회", description = "해당 월의 각 카테고리별 회계 통계 수치를 제공합니다.")
    @GetMapping("/accounting/stats")
    public ResponseEntity<List<Map<String, Object>>> getStats(@RequestParam("year") Integer year, @RequestParam("month") Integer month) {
        return ResponseEntity.ok(accountingService.getStats(year, month));
    }

    @Operation(summary = "초기 이월액 업데이트", description = "계좌 자체의 전체 초기 이월 금액을 수정합니다.")
    @PutMapping("/accounting/accounts/{code}/initial-balance")
    public ResponseEntity<AccountingAccount> updateInitialBalance(@PathVariable String code, @RequestParam("initial_balance") Integer initialBalance) {
        return ResponseEntity.ok(accountingService.updateInitialBalance(code, initialBalance));
    }

    @Operation(summary = "특정월 이월액 업데이트", description = "해당 연/월, 계좌의 월별 시작 잔액(이월액)을 수정합니다.")
    @PutMapping("/accounting/opening-balance")
    public ResponseEntity<AccountingMonthlyBalance> updateOpeningBalance(@RequestBody OpeningBalanceUpdate dto) {
        return ResponseEntity.ok(accountingService.updateOpeningBalance(
            dto.bankAccount(), 
            dto.year(), 
            dto.month(), 
            dto.openingBalance()));
    }

    @Operation(summary = "거래 내역 다음 달로 이월", description = "특정 거래 내역을 정산 상 다음 달로 이월시킵니다.")
    @PutMapping("/accounting/transactions/{id}/carry-over")
    public ResponseEntity<AccountingRecord> carryOverTransaction(@PathVariable Integer id) {
        return ResponseEntity.ok(accountingService.carryOverTransaction(id));
    }

    @Operation(summary = "거래 내역 이월 취소(복구)", description = "이월된 거래 내역을 정산 상 원래 거래 날짜의 달로 복구시킵니다.")
    @PutMapping("/accounting/transactions/{id}/reset-period")
    public ResponseEntity<AccountingRecord> resetAccountingPeriod(@PathVariable Integer id) {
        return ResponseEntity.ok(accountingService.resetAccountingPeriod(id));
    }

    @Operation(summary = "거래 내역 처리 상태 토글", description = "거래 내역의 처리 완료 여부(is_processed)를 토글합니다.")
    @PutMapping("/accounting/transactions/{id}/status")
    public ResponseEntity<AccountingRecord> toggleTransactionStatus(@PathVariable Integer id, @RequestBody AccountingStatusUpdate dto) {
        return ResponseEntity.ok(accountingService.toggleTransactionStatus(id, dto.isProcessed()));
    }
    @Operation(summary = "통장별 잔고 변동 이력 조회", description = "특정 통장의 모든 잔고 변동 이력을 조회합니다.")
    @GetMapping("/accounting/accounts/{code}/history")
    public ResponseEntity<List<AccountingAccountHistory>> getAccountHistory(@PathVariable String code) {
        return ResponseEntity.ok(accountingService.getAccountHistory(code));
    }
    @Operation(summary = "영아부 지출 결산 조회", description = "해당 연도와 월의 영아부 지출 내역을 조회합니다.")
    @GetMapping("/infant-expenses")
    public ResponseEntity<List<InfantExpense>> getInfantExpenses(@RequestParam Integer year, @RequestParam Integer month) {
        return ResponseEntity.ok(infantService.getInfantExpenses(year, month));
    }

    @Operation(summary = "영아부 지출 결산 등록", description = "영아부 지출 내역을 추가합니다.")
    @PostMapping("/infant-expenses")
    public ResponseEntity<InfantExpense> createInfantExpense(@RequestBody InfantExpenseCreate dto) {
        return ResponseEntity.ok(infantService.createInfantExpense(dto));
    }

    @Operation(summary = "영아부 지출 결산 삭제", description = "ID를 통해 영아부 지출 내역을 삭제합니다.")
    @DeleteMapping("/infant-expenses/{id}")
    public ResponseEntity<?> deleteInfantExpense(@PathVariable Integer id) {
        infantService.deleteInfantExpense(id);
        Map<String, String> res = new HashMap<>();
        res.put("status", "deleted");
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "월간 리포트(사역보고서) 조회", description = "연월을 지정하여 해당 달의 영아부 사역보고서를 조회합니다.")
    @GetMapping("/monthly-reports")
    public ResponseEntity<MonthlyReport> getMonthlyReport(@RequestParam Integer year, @RequestParam Integer month) {
        return ResponseEntity.ok(reportService.getMonthlyReport(year, month));
    }

    @Operation(summary = "월간 리포트 저장(Upsert)", description = "월간 리포트를 생성하거나 기존 작성된 리포트를 수정합니다.")
    @PostMapping("/monthly-reports")
    public ResponseEntity<MonthlyReport> createMonthlyReport(@RequestBody MonthlyReportCreate dto) {
        return ResponseEntity.ok(reportService.upsertMonthlyReport(dto));
    }
}
