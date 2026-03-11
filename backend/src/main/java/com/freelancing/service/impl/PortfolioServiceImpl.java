package com.freelancing.service.impl;

import com.freelancing.dto.request.PortfolioItemRequest;
import com.freelancing.dto.response.PortfolioItemResponse;
import com.freelancing.entity.FreelancerProfile;
import com.freelancing.entity.PortfolioItem;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.FreelancerProfileRepository;
import com.freelancing.repository.PortfolioItemRepository;
import com.freelancing.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioItemRepository portfolioRepo;
    private final FreelancerProfileRepository freelancerRepo;
    private final ModelMapper modelMapper;

    @Override
    public List<PortfolioItemResponse> getPortfolioItems(Long freelancerId) {
        return portfolioRepo.findByFreelancerProfileId(freelancerId).stream()
                .map(item -> modelMapper.map(item, PortfolioItemResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PortfolioItemResponse addPortfolioItem(Long freelancerId, PortfolioItemRequest request) {
        FreelancerProfile profile = freelancerRepo.findByUserId(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException("FreelancerProfile", "id", freelancerId));
 
        PortfolioItem item = PortfolioItem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .projectUrl(request.getProjectUrl())
                .imageUrl(request.getImageUrl())
                .freelancerProfile(profile)
                .build();

        item = portfolioRepo.save(item);
        return modelMapper.map(item, PortfolioItemResponse.class);
    }

    @Override
    @Transactional
    public PortfolioItemResponse updatePortfolioItem(Long freelancerId, Long portfolioId, PortfolioItemRequest request) {
        PortfolioItem item = portfolioRepo.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("PortfolioItem", "id", portfolioId));

        if (request.getTitle() != null) item.setTitle(request.getTitle());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getProjectUrl() != null) item.setProjectUrl(request.getProjectUrl());
        if (request.getImageUrl() != null) item.setImageUrl(request.getImageUrl());

        item = portfolioRepo.save(item);
        return modelMapper.map(item, PortfolioItemResponse.class);
    }

    @Override
    @Transactional
    public void deletePortfolioItem(Long freelancerId, Long portfolioId) {
        PortfolioItem item = portfolioRepo.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("PortfolioItem", "id", portfolioId));
        portfolioRepo.delete(item);
    }
}
