package com.mycount.backend.service;

import com.mycount.backend.entity.DonationRecord;
import com.mycount.backend.repository.DonationRecordRepository;
import com.mycount.backend.dto.AppDtos.DonationRecordCreate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class DonationService {
    private final DonationRecordRepository donationRepo;

    public DonationService(DonationRecordRepository donationRepo) {
        this.donationRepo = donationRepo;
    }

    public List<DonationRecord> getDonationRecords(Integer year, Integer month) {
        // Find all then filter by year and month (basic impl)
        // Spring Data JPA custom query is ideal, but using stream here for quick migration
        return donationRepo.findAll().stream()
                .filter(d -> d.getDate() != null &&
                             d.getDate().getYear() == year &&
                             d.getDate().getMonthValue() == month)
                .collect(Collectors.toList());
    }

    public DonationRecord createDonationRecord(DonationRecordCreate dto) {
        DonationRecord record = new DonationRecord();
        record.setMemberName(dto.memberName());
        record.setAmount(dto.amount() != null ? dto.amount() : 0);
        record.setNote(dto.note());
        record.setDate(dto.date());
        return donationRepo.save(record);
    }

    public void updateDonationRecord(Integer id, DonationRecordCreate dto) {
        Optional<DonationRecord> opt = donationRepo.findById(id);
        if (opt.isPresent()) {
            DonationRecord record = opt.get();
            record.setMemberName(dto.memberName());
            record.setAmount(dto.amount() != null ? dto.amount() : 0);
            record.setNote(dto.note());
            record.setDate(dto.date());
            donationRepo.save(record);
        }
    }

    public void deleteDonationRecord(Integer id) {
        donationRepo.deleteById(id);
    }

    public List<String> getUniqueDonors() {
        return donationRepo.findAll().stream()
                .map(DonationRecord::getMemberName)
                .distinct()
                .collect(Collectors.toList());
    }
}
