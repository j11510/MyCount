package com.mycount.backend.controller;

import com.mycount.backend.service.AccountingService;
import com.mycount.backend.service.DonationService;
import com.mycount.backend.service.ExcelExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Tag(name = "Export", description = "장부 및 헌금 내역 엑셀 파일 내보내기/다운로드 API")
@RestController
@RequestMapping("/api")
public class ExportController {

    private final AccountingService accountingService;
    private final DonationService donationService;
    private final ExcelExportService excelExportService;

    public ExportController(AccountingService accountingService, DonationService donationService, ExcelExportService excelExportService) {
        this.accountingService = accountingService;
        this.donationService = donationService;
        this.excelExportService = excelExportService;
    }

    @Operation(summary = "재정 장부 엑셀 다운로드", description = "선택한 통장의 거래 내역을 Excel 형식(.xlsx) 파일로 다운로드합니다.")
    @GetMapping("/accounting/export")
    public ResponseEntity<InputStreamResource> exportLedger(@RequestParam String bankAccount, 
                                                            @RequestParam(required = false) Integer year, 
                                                            @RequestParam(required = false) Integer month) throws IOException {
        String title = bankAccount + " 거래내역";
        ByteArrayInputStream in = excelExportService.exportLedger(accountingService.getAccountingRecords(year, month, bankAccount), title);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=ledger_" + bankAccount + ".xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    @Operation(summary = "헌금 내역 엑셀 다운로드", description = "해당 연월의 등록된 헌금 내역을 Excel 형식(.xlsx) 파일로 모두 다운로드합니다.")
    @GetMapping("/donations/export")
    public ResponseEntity<InputStreamResource> exportDonations(@RequestParam Integer year, @RequestParam Integer month) throws IOException {
        ByteArrayInputStream in = excelExportService.exportDonations(donationService.getDonationRecords(year, month));

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=donations_" + year + "_" + month + ".xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}
