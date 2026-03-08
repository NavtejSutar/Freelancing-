package com.freelancing.service;

import com.freelancing.dto.request.PortfolioItemRequest;
import com.freelancing.dto.response.PortfolioItemResponse;

import java.util.List;

public interface PortfolioService {
    List<PortfolioItemResponse> getPortfolioItems(Long freelancerId);
    PortfolioItemResponse addPortfolioItem(Long freelancerId, PortfolioItemRequest request);
    PortfolioItemResponse updatePortfolioItem(Long freelancerId, Long portfolioId, PortfolioItemRequest request);
    void deletePortfolioItem(Long freelancerId, Long portfolioId);
}
