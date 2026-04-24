package com.mycount.backend.repository;

import com.mycount.backend.entity.DonationRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationRecordRepository extends JpaRepository<DonationRecord, Integer> {
}
