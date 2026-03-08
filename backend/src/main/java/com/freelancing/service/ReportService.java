package com.freelancing.service;

import com.freelancing.dto.request.ReportRequest;
import com.freelancing.dto.response.ReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReportService {
    ReportResponse submitReport(Long reporterId, ReportRequest request);
    Page<ReportResponse> getMyReports(Long reporterId, Pageable pageable);
    ReportResponse getReportById(Long id);
    Page<ReportResponse> getAllReports(Pageable pageable);
    ReportResponse resolveReport(Long id, String adminNote, Long adminId);
}
