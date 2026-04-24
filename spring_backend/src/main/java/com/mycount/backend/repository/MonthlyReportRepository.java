package com.mycount.backend.repository;

import com.mycount.backend.entity.MonthlyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MonthlyReportRepository extends JpaRepository<MonthlyReport, Integer> {
    Optional<MonthlyReport> findByYearAndMonth(Integer year, Integer month);
}
