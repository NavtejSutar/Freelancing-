package com.freelancing.service.impl;

import com.freelancing.dto.request.ClientProfileRequest;
import com.freelancing.dto.request.CompanyRequest;
import com.freelancing.dto.response.ClientProfileResponse;
import com.freelancing.dto.response.CompanyResponse;
import com.freelancing.entity.ClientProfile;
import com.freelancing.entity.Company;
import com.freelancing.entity.User;
import com.freelancing.exception.BadRequestException;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.ClientProfileRepository;
import com.freelancing.repository.CompanyRepository;
import com.freelancing.repository.UserRepository;
import com.freelancing.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientProfileRepository clientRepo;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<ClientProfileResponse> getAllClients(Pageable pageable) {
        return clientRepo.findAll(pageable).map(p -> modelMapper.map(p, ClientProfileResponse.class));
    }

    @Override
    public ClientProfileResponse getClientById(Long id) {
        ClientProfile profile = findById(id);
        return modelMapper.map(profile, ClientProfileResponse.class);
    }

    @Override
    public ClientProfileResponse getClientByUserId(Long userId) {
        ClientProfile profile = clientRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("ClientProfile", "userId", userId));
        return modelMapper.map(profile, ClientProfileResponse.class);
    }

    @Override
    @Transactional
    public ClientProfileResponse createProfile(Long userId, ClientProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (clientRepo.findByUserId(userId).isPresent()) {
            throw new BadRequestException("Client profile already exists");
        }

        ClientProfile profile = ClientProfile.builder()
                .industry(request.getIndustry())
                .website(request.getWebsite())
                .city(request.getCity())
                .country(request.getCountry())
                .user(user)
                .build();

        profile = clientRepo.save(profile);
        return modelMapper.map(profile, ClientProfileResponse.class);
    }

    @Override
    @Transactional
    public ClientProfileResponse updateClient(Long userId, ClientProfileRequest request) {
        ClientProfile profile = clientRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("ClientProfile", "userId", userId));

        if (request.getIndustry() != null) profile.setIndustry(request.getIndustry());
        if (request.getWebsite() != null) profile.setWebsite(request.getWebsite());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getCountry() != null) profile.setCountry(request.getCountry());

        profile = clientRepo.save(profile);
        return modelMapper.map(profile, ClientProfileResponse.class);
    }

    @Override
    public CompanyResponse getCompany(Long userId) {
        ClientProfile profile = clientRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("ClientProfile", "userId", userId));
        Company company = companyRepository.findByClientProfileId(profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company", "clientId", profile.getId()));
        return modelMapper.map(company, CompanyResponse.class);
    }

    @Override
    @Transactional
    public CompanyResponse createCompany(Long userId, CompanyRequest request) {
        ClientProfile profile = clientRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("ClientProfile", "userId", userId));

        if (companyRepository.findByClientProfileId(profile.getId()).isPresent()) {
            throw new BadRequestException("Company already exists for this client");
        }

        Company company = Company.builder()
                .name(request.getName())
                .description(request.getDescription())
                .logoUrl(request.getLogoUrl())
                .website(request.getWebsite())
                .employeeCount(request.getEmployeeCount())
                .foundedYear(request.getFoundedYear())
                .clientProfile(profile)
                .build();

        company = companyRepository.save(company);
        return modelMapper.map(company, CompanyResponse.class);
    }

    @Override
    @Transactional
    public CompanyResponse updateCompany(Long userId, CompanyRequest request) {
        ClientProfile profile = clientRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("ClientProfile", "userId", userId));
        Company company = companyRepository.findByClientProfileId(profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company", "clientId", profile.getId()));

        if (request.getName() != null) company.setName(request.getName());
        if (request.getDescription() != null) company.setDescription(request.getDescription());
        if (request.getLogoUrl() != null) company.setLogoUrl(request.getLogoUrl());
        if (request.getWebsite() != null) company.setWebsite(request.getWebsite());
        if (request.getEmployeeCount() != null) company.setEmployeeCount(request.getEmployeeCount());
        if (request.getFoundedYear() != null) company.setFoundedYear(request.getFoundedYear());

        company = companyRepository.save(company);
        return modelMapper.map(company, CompanyResponse.class);
    }

    private ClientProfile findById(Long id) {
        return clientRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClientProfile", "id", id));
    }
}
