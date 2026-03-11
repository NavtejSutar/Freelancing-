package com.freelancing.controller;

import com.freelancing.dto.request.ClientProfileRequest;
import com.freelancing.dto.request.CompanyRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.ClientProfileResponse;
import com.freelancing.dto.response.CompanyResponse;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @PostMapping("/me")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<ClientProfileResponse>> createMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ClientProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile created",
                clientService.createProfile(userDetails.getId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ClientProfileResponse>>> getAllClients(Pageable pageable) {
        Page<ClientProfileResponse> response = clientService.getAllClients(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClientProfileResponse>> getClientById(@PathVariable Long id) {
        ClientProfileResponse response = clientService.getClientById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<ClientProfileResponse>> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ClientProfileResponse response = clientService.getClientByUserId(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<ClientProfileResponse>> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ClientProfileRequest request) {
        ClientProfileResponse response = clientService.updateClient(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // --- Company endpoints ---

    @PostMapping("/me/company")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CompanyRequest request) {
        CompanyResponse response = clientService.createCompany(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Company created", response));
    }

    @PutMapping("/me/company")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CompanyRequest request) {
        CompanyResponse response = clientService.updateCompany(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me/company")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<CompanyResponse>> getMyCompany(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        CompanyResponse response = clientService.getCompany(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
