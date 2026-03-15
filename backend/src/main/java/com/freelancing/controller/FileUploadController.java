package com.freelancing.controller;

import com.freelancing.config.FileStorageConfig;
import com.freelancing.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageConfig fileStorageConfig;

    // Upload a PDF (for proposal cover letters)
    @PostMapping("/upload/pdf")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPdf(
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
        }

        String contentType = file.getContentType();
        if (!"application/pdf".equals(contentType)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Only PDF files are allowed"));
        }

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(fileStorageConfig.getUploadDir(), "pdfs");
        Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(filename));

        String fileUrl = "/api/files/pdfs/" + filename;
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", fileUrl, "filename", filename)));
    }

    // Upload an image (for contract signatures)
    @PostMapping("/upload/signature")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadSignature(
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Only image files are allowed for signatures"));
        }

        String ext = contentType.replace("image/", ".");
        String filename = UUID.randomUUID() + "_signature" + ext;
        Path uploadPath = Paths.get(fileStorageConfig.getUploadDir(), "signatures");
        Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(filename));

        String fileUrl = "/api/files/signatures/" + filename;
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", fileUrl, "filename", filename)));
    }

    // Serve uploaded files
    @GetMapping("/pdfs/{filename}")
    public ResponseEntity<byte[]> servePdf(@PathVariable String filename) throws IOException {
        Path filePath = Paths.get(fileStorageConfig.getUploadDir(), "pdfs", filename);
        byte[] content = Files.readAllBytes(filePath);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .body(content);
    }

    @GetMapping("/signatures/{filename}")
    public ResponseEntity<byte[]> serveSignature(@PathVariable String filename) throws IOException {
        Path filePath = Paths.get(fileStorageConfig.getUploadDir(), "signatures", filename);
        byte[] content = Files.readAllBytes(filePath);
        String ext = filename.substring(filename.lastIndexOf('.') + 1);
        return ResponseEntity.ok()
                .header("Content-Type", "image/" + ext)
                .body(content);
    }
}