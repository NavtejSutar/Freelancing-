package com.freelancing.service;

import java.util.List;

import com.freelancing.dto.request.SkillRequest;
import com.freelancing.dto.response.SkillCategoryResponse;
import com.freelancing.dto.response.SkillResponse;

public interface SkillService {
    List<SkillResponse> getAllSkills(Long categoryId);
    SkillResponse getSkillById(Long id);
    SkillResponse createSkill(SkillRequest request);
    SkillResponse updateSkill(Long id, SkillRequest request);
    void deleteSkill(Long id);
    // FIX: return SkillCategoryResponse DTO instead of raw SkillCategory entity
    List<SkillCategoryResponse> getAllCategories();
    SkillCategoryResponse createCategory(String name, String description);
    void deleteCategory(Long id);
}