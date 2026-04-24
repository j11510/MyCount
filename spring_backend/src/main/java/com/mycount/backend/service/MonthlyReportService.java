package com.mycount.backend.service;

import com.mycount.backend.entity.MonthlyReport;
import com.mycount.backend.repository.MonthlyReportRepository;
import com.mycount.backend.dto.AppDtos.MonthlyReportCreate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class MonthlyReportService {
    private final MonthlyReportRepository reportRepo;

    public MonthlyReportService(MonthlyReportRepository reportRepo) {
        this.reportRepo = reportRepo;
    }

    public MonthlyReport getMonthlyReport(Integer year, Integer month) {
        return reportRepo.findByYearAndMonth(year, month).orElse(null);
    }

    public MonthlyReport upsertMonthlyReport(MonthlyReportCreate dto) {
        Optional<MonthlyReport> opt = reportRepo.findByYearAndMonth(dto.year(), dto.month());
        MonthlyReport report;
        if (opt.isPresent()) {
            report = opt.get();
        } else {
            report = new MonthlyReport();
            report.setYear(dto.year());
            report.setMonth(dto.month());
        }
        
        report.setReporter(dto.reporter());
        report.setPlanData(dto.planData());
        report.setAttendanceData(dto.attendanceData());
        report.setRemarks(dto.remarks());
        
        return reportRepo.save(report);
    }
}
