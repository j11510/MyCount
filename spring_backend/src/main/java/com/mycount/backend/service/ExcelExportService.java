package com.mycount.backend.service;

import com.mycount.backend.entity.AccountingRecord;
import com.mycount.backend.entity.DonationRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportService {

    public ByteArrayInputStream exportLedger(List<AccountingRecord> records, String title) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("거래내역");

            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(title);
            
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);

            String[] HEADERS = {"날짜", "분류", "내역", "수입", "지출", "비고"};
            Row headerRow = sheet.createRow(2);

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int col = 0; col < HEADERS.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(HEADERS[col]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 3;
            for (AccountingRecord r : records) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(r.getDate() != null ? r.getDate().toString() : "");
                row.createCell(1).setCellValue(r.getCategory() != null ? r.getCategory().getName() : "미분류");
                row.createCell(2).setCellValue(r.getDescription());
                row.createCell(3).setCellValue("income".equals(r.getType()) ? r.getAmount() : 0);
                row.createCell(4).setCellValue("expense".equals(r.getType()) ? r.getAmount() : 0);
                row.createCell(5).setCellValue(r.getRemarks());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream exportDonations(List<DonationRecord> records) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("헌금내역");

            String[] HEADERS = {"날짜", "성함", "금액"};
            Row headerRow = sheet.createRow(0);

            for (int col = 0; col < HEADERS.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(HEADERS[col]);
            }

            int rowIdx = 1;
            for (DonationRecord r : records) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(r.getDate() != null ? r.getDate().toString() : "");
                row.createCell(1).setCellValue(r.getMemberName());
                row.createCell(2).setCellValue(r.getAmount());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
