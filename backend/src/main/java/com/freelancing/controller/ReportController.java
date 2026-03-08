package com.freelancing.controller;

import com.freelancing.dto.request.ReportRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.ReportResponse;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> submitReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ReportRequest request) {
        ReportResponse response = reportService.submitReport(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Report submitted", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getMyReports(
            @AuthenticationPrincipal CustomUserDetails userDetails, Pageable pageable) {
        Page<ReportResponse> response = reportService.getMyReports(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportResponse>> getReportById(@PathVariable Long id) {
        ReportResponse response = reportService.getReportById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getAllReports(Pageable pageable) {
        Page<ReportResponse> response = reportService.getAllReports(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReportResponse>> resolveReport(
            @PathVariable Long id, @RequestParam String adminNote,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReportResponse response = reportService.resolveReport(id, adminNote, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Report resolved", response));
    }
}
