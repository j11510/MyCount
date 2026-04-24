package com.mycount.backend.controller;

import com.mycount.backend.dto.AppDtos.DonationRecordCreate;
import com.mycount.backend.entity.DonationRecord;
import com.mycount.backend.service.DonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "Donation", description = "헌금 내역 및 기부자 명단 관리 API")
@RestController
@RequestMapping("/api")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @Operation(summary = "헌금 내역 월별 조회", description = "지정된 연월의 헌금 내역을 모두 조회합니다.")
    @GetMapping("/donations")
    public ResponseEntity<List<DonationRecord>> getDonations(@RequestParam Integer year, @RequestParam Integer month) {
        return ResponseEntity.ok(donationService.getDonationRecords(year, month));
    }

    @Operation(summary = "헌금 기입", description = "새로운 헌금 내역을 등록합니다.")
    @PostMapping("/donations")
    public ResponseEntity<DonationRecord> createDonation(@RequestBody DonationRecordCreate dto) {
        return ResponseEntity.ok(donationService.createDonationRecord(dto));
    }

    @Operation(summary = "헌금 내역 삭제", description = "ID를 통해 입력된 헌금 내역을 삭제합니다.")
    @DeleteMapping("/donations/{id}")
    public ResponseEntity<?> deleteDonation(@PathVariable Integer id) {
        donationService.deleteDonationRecord(id);
        Map<String, String> res = new HashMap<>();
        res.put("status", "deleted");
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "헌금 내역 수정", description = "등록된 헌금 내역 정보를 수정합니다.")
    @PutMapping("/donations/{id}")
    public ResponseEntity<?> updateDonation(@PathVariable Integer id, @RequestBody DonationRecordCreate dto) {
        donationService.updateDonationRecord(id, dto);
        Map<String, String> res = new HashMap<>();
        res.put("status", "updated");
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "헌금 기부자 명단 조회", description = "지금까지 등록된 모든 헌금 기부자의 중복 없는 성별 리스트를 추출합니다.")
    @GetMapping("/donations/donors")
    public ResponseEntity<List<String>> getDonors() {
        return ResponseEntity.ok(donationService.getUniqueDonors());
    }
}
