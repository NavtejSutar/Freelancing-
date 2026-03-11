package com.freelancing.controller;

import com.freelancing.dto.request.PortfolioItemRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.PortfolioItemResponse;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.service.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/freelancers")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping("/{freelancerId}/portfolio")
    public ResponseEntity<ApiResponse<List<PortfolioItemResponse>>> getPortfolio(@PathVariable Long freelancerId) {
        List<PortfolioItemResponse> response = portfolioService.getPortfolioItems(freelancerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/me/portfolio")
    @PreAuthorize("hasRole('FREELANCER')") 
    public ResponseEntity<ApiResponse<PortfolioItemResponse>> addPortfolioItem(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PortfolioItemRequest request) {
        PortfolioItemResponse response = portfolioService.addPortfolioItem(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Portfolio item added", response));
    }

    @PutMapping("/me/portfolio/{itemId}")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<PortfolioItemResponse>> updatePortfolioItem(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long itemId,
            @Valid @RequestBody PortfolioItemRequest request) {
        PortfolioItemResponse response = portfolioService.updatePortfolioItem(userDetails.getId(), itemId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/me/portfolio/{itemId}")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<Void>> deletePortfolioItem(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long itemId) {
        portfolioService.deletePortfolioItem(userDetails.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.success("Portfolio item deleted", null));
    }
}
