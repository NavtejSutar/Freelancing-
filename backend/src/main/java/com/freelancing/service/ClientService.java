package com.freelancing.service;

import com.freelancing.dto.request.ClientProfileRequest;
import com.freelancing.dto.request.CompanyRequest;
import com.freelancing.dto.response.ClientProfileResponse;
import com.freelancing.dto.response.CompanyResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClientService {
    Page<ClientProfileResponse> getAllClients(Pageable pageable);
    ClientProfileResponse getClientById(Long id);
    ClientProfileResponse getClientByUserId(Long userId);
    ClientProfileResponse createProfile(Long userId, ClientProfileRequest request);
    ClientProfileResponse updateClient(Long userId, ClientProfileRequest request);
    CompanyResponse getCompany(Long userId);
    CompanyResponse createCompany(Long userId, CompanyRequest request);
    CompanyResponse updateCompany(Long userId, CompanyRequest request);
}
