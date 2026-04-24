package com.mycount.backend.repository;

import com.mycount.backend.entity.MonthlyItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonthlyItemRepository extends JpaRepository<MonthlyItem, Integer> {
}
