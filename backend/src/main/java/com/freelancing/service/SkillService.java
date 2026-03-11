package com.freelancing.service;

import java.util.List;

import com.freelancing.dto.request.SkillRequest;
import com.freelancing.dto.response.SkillResponse;
import com.freelancing.entity.SkillCategory;

public interface SkillService {
    List<SkillResponse> getAllSkills(Long categoryId);
    SkillResponse getSkillById(Long id);
    SkillResponse createSkill(SkillRequest request);
    SkillResponse updateSkill(Long id, SkillRequest request);
    void deleteSkill(Long id);
    List<SkillCategory> getAllCategories();
    SkillCategory createCategory(String name, String description);
    void deleteCategory(Long id);
}
