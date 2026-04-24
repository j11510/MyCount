package com.mycount.backend.repository;

import com.mycount.backend.entity.MonthlyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MonthlyRecordRepository extends JpaRepository<MonthlyRecord, Integer> {
    Optional<MonthlyRecord> findByYearAndMonth(Integer year, Integer month);
}
