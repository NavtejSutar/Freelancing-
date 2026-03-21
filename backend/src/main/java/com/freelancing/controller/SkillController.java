package com.freelancing.controller;

import com.freelancing.dto.request.SkillRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.SkillCategoryResponse;
import com.freelancing.dto.response.SkillResponse;
import com.freelancing.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SkillResponse>>> getAllSkills(
            @RequestParam(required = false) Long categoryId) {
        List<SkillResponse> response = skillService.getAllSkills(categoryId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SkillResponse>> getSkillById(@PathVariable Long id) {
        SkillResponse response = skillService.getSkillById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SkillResponse>> createSkill(@Valid @RequestBody SkillRequest request) {
        SkillResponse response = skillService.createSkill(request);
        return ResponseEntity.ok(ApiResponse.success("Skill created", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SkillResponse>> updateSkill(@PathVariable Long id, @Valid @RequestBody SkillRequest request) {
        SkillResponse response = skillService.updateSkill(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSkill(@PathVariable Long id) {
        skillService.deleteSkill(id);
        return ResponseEntity.ok(ApiResponse.success("Skill deleted", null));
    }

    // --- Categories ---

    // FIX: return type changed from List<SkillCategory> (raw JPA entity) to
    // List<SkillCategoryResponse> (plain DTO). The raw entity caused Hibernate to
    // attempt serializing the lazy 'skills' collection after the session was closed
    // (open-in-view=false), resulting in LazyInitializationException -> 500 error.
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<SkillCategoryResponse>>> getAllCategories() {
        List<SkillCategoryResponse> response = skillService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SkillCategoryResponse>> createCategory(
            @RequestParam String name,
            @RequestParam(required = false) String description) {
        SkillCategoryResponse response = skillService.createCategory(name, description);
        return ResponseEntity.ok(ApiResponse.success("Category created", response));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        skillService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }
}