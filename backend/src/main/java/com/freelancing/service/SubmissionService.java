package com.freelancing.service;

import com.freelancing.dto.request.SubmissionRequest;
import com.freelancing.dto.response.SubmissionResponse;

import java.util.List;

public interface SubmissionService {
    SubmissionResponse getSubmissionById(Long id);
    SubmissionResponse createSubmission(SubmissionRequest request);
    SubmissionResponse updateSubmission(Long id, SubmissionRequest request);
    SubmissionResponse approveSubmission(Long id);
    SubmissionResponse rejectSubmission(Long id);
    List<SubmissionResponse> getSubmissionsByContract(Long contractId);
    List<SubmissionResponse> getSubmissionsByMilestone(Long milestoneId);
}
