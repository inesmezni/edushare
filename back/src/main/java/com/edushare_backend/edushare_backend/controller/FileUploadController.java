package com.edushare_backend.edushare_backend.controller;

import com.edushare_backend.edushare_backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = fileStorageService.storeVideo(file);
            return ResponseEntity.ok(Map.of(
                    "message", "Vidéo uploadée avec succès",
                    "fileUrl", fileUrl,
                    "fileName", file.getOriginalFilename(),
                    "fileSize", file.getSize()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/thumbnail")
    public ResponseEntity<?> uploadThumbnail(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = fileStorageService.storeThumbnail(file);
            return ResponseEntity.ok(Map.of(
                    "message", "Thumbnail uploadé avec succès",
                    "fileUrl", fileUrl,
                    "fileName", file.getOriginalFilename(),
                    "fileSize", file.getSize()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/video")
    public ResponseEntity<?> deleteVideo(@RequestParam String fileUrl) {
        try {
            boolean deleted = fileStorageService.deleteVideo(fileUrl);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Vidéo supprimée avec succès"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Impossible de supprimer la vidéo"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/thumbnail")
    public ResponseEntity<?> deleteThumbnail(@RequestParam String fileUrl) {
        try {
            boolean deleted = fileStorageService.deleteThumbnail(fileUrl);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Thumbnail supprimé avec succès"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Impossible de supprimer le thumbnail"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkFile(@RequestParam String fileUrl) {
        try {
            boolean exists = fileStorageService.fileExists(fileUrl);
            long fileSize = fileStorageService.getFileSize(fileUrl);

            return ResponseEntity.ok(Map.of(
                    "exists", exists,
                    "fileSize", fileSize,
                    "fileUrl", fileUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}