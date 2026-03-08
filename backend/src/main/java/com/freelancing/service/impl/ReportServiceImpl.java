package com.freelancing.service.impl;

import com.freelancing.dto.request.ReportRequest;
import com.freelancing.dto.response.ReportResponse;
import com.freelancing.entity.Report;
import com.freelancing.entity.User;
import com.freelancing.entity.enums.ReportStatus;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.ReportRepository;
import com.freelancing.repository.UserRepository;
import com.freelancing.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepo;
    private final UserRepository userRepo;

    @Override
    @Transactional
    public ReportResponse submitReport(Long reporterId, ReportRequest request) {
        User reporter = userRepo.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reporterId));

        Report report = Report.builder()
                .reason(request.getReason())
                .description(request.getDescription())
                .status(ReportStatus.PENDING)
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reporter(reporter)
                .build();

        report = reportRepo.save(report);
        return mapToResponse(report);
    }

    @Override
    public Page<ReportResponse> getMyReports(Long reporterId, Pageable pageable) {
        return reportRepo.findByReporterId(reporterId, pageable).map(this::mapToResponse);
    }

    @Override
    public ReportResponse getReportById(Long id) {
        Report report = reportRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
        return mapToResponse(report);
    }

    @Override
    public Page<ReportResponse> getAllReports(Pageable pageable) {
        return reportRepo.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public ReportResponse resolveReport(Long id, String adminNote, Long adminId) {
        Report report = reportRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
        User admin = userRepo.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        report.setStatus(ReportStatus.RESOLVED);
        report.setAdminNote(adminNote);
        report.setResolvedBy(admin);
        report.setResolvedAt(LocalDateTime.now());

        report = reportRepo.save(report);
        return mapToResponse(report);
    }

    private ReportResponse mapToResponse(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .adminNote(report.getAdminNote())
                .reporterId(report.getReporter().getId())
                .reporterName(report.getReporter().getFirstName() + " " + report.getReporter().getLastName())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
