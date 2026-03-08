package com.freelancing.service;

import com.freelancing.dto.request.SkillRequest;
import com.freelancing.dto.response.SkillResponse;
import com.freelancing.entity.SkillCategory;

import java.util.List;

public interface SkillService {
    List<SkillResponse> getAllSkills(Long categoryId);
    SkillResponse getSkillById(Long id);
    SkillResponse createSkill(SkillRequest request);
    SkillResponse updateSkill(Long id, SkillRequest request);
    void deleteSkill(Long id);
    List<SkillCategory> getAllCategories();
}
