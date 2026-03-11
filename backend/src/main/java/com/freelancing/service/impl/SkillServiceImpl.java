package com.freelancing.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.freelancing.dto.request.SkillRequest;
import com.freelancing.dto.response.SkillResponse;
import com.freelancing.entity.Skill;
import com.freelancing.entity.SkillCategory;
import com.freelancing.exception.BadRequestException;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.SkillCategoryRepository;
import com.freelancing.repository.SkillRepository;
import com.freelancing.service.SkillService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepo;
    private final SkillCategoryRepository categoryRepo;
    private final ModelMapper modelMapper;

    @Override
    public List<SkillResponse> getAllSkills(Long categoryId) {
        if (categoryId != null) {
            return skillRepo.findByCategoryId(categoryId).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return skillRepo.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SkillResponse getSkillById(Long id) {
        Skill skill = skillRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", id));
        return mapToResponse(skill);
    }

    @Override
    @Transactional
    public SkillResponse createSkill(SkillRequest request) {
        if (skillRepo.existsByName(request.getName())) {
            throw new BadRequestException("Skill with name '" + request.getName() + "' already exists");
        }

        SkillCategory category = categoryRepo.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("SkillCategory", "id", request.getCategoryId()));

        Skill skill = Skill.builder()
                .name(request.getName())
                .slug(request.getName().toLowerCase().replaceAll("\\s+", "-"))
                .category(category)
                .build();

        skill = skillRepo.save(skill);
        return mapToResponse(skill);
    }

    @Override
    @Transactional
    public SkillResponse updateSkill(Long id, SkillRequest request) {
        Skill skill = skillRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", id));

        if (request.getName() != null) {
            skill.setName(request.getName());
            skill.setSlug(request.getName().toLowerCase().replaceAll("\\s+", "-"));
        }
        if (request.getCategoryId() != null) {
            SkillCategory category = categoryRepo.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("SkillCategory", "id", request.getCategoryId()));
            skill.setCategory(category);
        }

        skill = skillRepo.save(skill);
        return mapToResponse(skill);
    }

    @Override
    @Transactional
    public void deleteSkill(Long id) { 
        Skill skill = skillRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", id));
        skillRepo.delete(skill);
    }

    // --- Category methods ---

    @Override
    public List<SkillCategory> getAllCategories() {
        return categoryRepo.findAll();
    }

    @Override
    @Transactional
    public SkillCategory createCategory(String name, String description) {
        if (categoryRepo.existsByName(name)) {
            throw new BadRequestException("Category with name '" + name + "' already exists");
        }
        SkillCategory category = SkillCategory.builder()
                .name(name)
                .slug(name.toLowerCase().replaceAll("\\s+", "-"))
                .description(description)
                .build();
        return categoryRepo.save(category);
    }


    @Transactional
    @Override
    public void deleteCategory(Long id) {
        SkillCategory category = categoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SkillCategory", "id", id));
        categoryRepo.delete(category);
    }

    private SkillResponse mapToResponse(Skill skill) {
        SkillResponse response = modelMapper.map(skill, SkillResponse.class);
        if (skill.getCategory() != null) {
            response.setCategoryId(skill.getCategory().getId());
            response.setCategoryName(skill.getCategory().getName());
        }
        return response;
    }
}
