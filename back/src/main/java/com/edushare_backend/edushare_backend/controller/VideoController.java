package com.edushare_backend.edushare_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edushare_backend.edushare_backend.dto.VideoUploadRequest;
import com.edushare_backend.edushare_backend.entity.Video;
import com.edushare_backend.edushare_backend.service.VideoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
@Validated
public class VideoController {

    private final VideoService videoService;

    // ===================================================
    // UPLOAD — contributeur seulement
    // ===================================================

   
    @PostMapping(value = "/upload/{contributorId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('CONTRIBUTOR', 'ADMIN')")
    public ResponseEntity<?> uploadVideo(
            @PathVariable Long contributorId,
            @Valid @ModelAttribute VideoUploadRequest request) {
        try {
            Video createdVideo = videoService.createVideoWithFiles(request, contributorId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVideo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            ));
        }
    }

    // ===================================================
    // CONSULTATION — public (étudiant + contributeur)
    // ===================================================

    // Toutes les vidéos avec pagination
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Video>> getAllVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(videoService.getAllVideos(page, size));
    }

    // Vidéo par id
    @GetMapping(value = "/{videoId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getVideoById(@PathVariable Long videoId) {
        try {
            return ResponseEntity.ok(videoService.getVideoById(videoId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Vidéos par catégorie
    @GetMapping(value = "/category/{category}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Video>> getVideosByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(videoService.getVideosByCategory(category, page, size));
    }

    // Recherche avec filtres
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Video>> searchVideos(
            @RequestParam String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(videoService.searchVideos(
                keyword, category, minPrice, maxPrice, page, size));
    }

    // Vidéos d'un contributeur
    @GetMapping(value = "/contributor/{contributorId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Video>> getVideosByContributor(
            @PathVariable Long contributorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(videoService.getVideosByContributor(contributorId, page, size));
    }

    // Vidéos populaires
    @GetMapping(value = "/popular", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Video>> getPopularVideos(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(videoService.getPopularVideos(limit));
    }

    // Vidéos récentes
    @GetMapping(value = "/recent", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Video>> getRecentVideos(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(videoService.getRecentVideos(limit));
    }

    // Vidéos gratuites
    @GetMapping(value = "/free", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Video>> getFreeVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(videoService.getFreeVideos(page, size));
    }

    // Vidéos tendance
    @GetMapping(value = "/trending", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Video>> getTrendingVideos() {
        return ResponseEntity.ok(videoService.getTrendingVideos());
    }

    // ===================================================
    // MODIFICATION — contributeur seulement
    // ===================================================

    // Modifier une vidéo
    @PutMapping(value = "/{videoId}",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('CONTRIBUTOR', 'ADMIN')")
    public ResponseEntity<?> updateVideo(
            @PathVariable Long videoId,
            @Valid @RequestBody Video videoDetails,
            @RequestParam Long contributorId) {
        try {
            return ResponseEntity.ok(videoService.updateVideo(videoId, videoDetails, contributorId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Supprimer une vidéo
    @DeleteMapping(value = "/{videoId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('CONTRIBUTOR', 'ADMIN')")
    public ResponseEntity<?> deleteVideo(
            @PathVariable Long videoId,
            @RequestParam Long contributorId) {
        try {
            videoService.deleteVideo(videoId, contributorId);
            return ResponseEntity.ok(Map.of(
                    "message", "Vidéo supprimée avec succès",
                    "videoId", videoId
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ===================================================
    // INTERACTIONS — étudiant + contributeur
    // ===================================================

    // Visionner une vidéo — incrémenter les vues
    @PostMapping(value = "/{videoId}/watch", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> watchVideo(@PathVariable Long videoId) {
        try {
            Video video = videoService.incrementViews(videoId);
            return ResponseEntity.ok(Map.of(
                    "views", video.getViews(),
                    "videoId", videoId
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Liker une vidéo
    @PostMapping(value = "/{videoId}/like", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> likeVideo(@PathVariable Long videoId) {
        try {
            Video video = videoService.likeVideo(videoId);
            return ResponseEntity.ok(Map.of(
                    "likes", video.getLikes(),
                    "videoId", videoId
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Enlever un like
    @PostMapping(value = "/{videoId}/unlike", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> unlikeVideo(@PathVariable Long videoId) {
        try {
            Video video = videoService.unlikeVideo(videoId);
            return ResponseEntity.ok(Map.of(
                    "likes", video.getLikes(),
                    "videoId", videoId
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ===================================================
    // STATISTIQUES
    // ===================================================

    // Stats d'un contributeur
    @GetMapping(value = "/stats/contributor/{contributorId}",
            produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('CONTRIBUTOR', 'ADMIN')")
    public ResponseEntity<?> getContributorStats(@PathVariable Long contributorId) {
        try {
            return ResponseEntity.ok(videoService.getVideoStats(contributorId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Stats par catégorie
    @GetMapping(value = "/stats/categories", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getCategoryStats() {
        return ResponseEntity.ok(videoService.getCategoryStats());
    }

    // ===================================================
    // UTILITAIRES
    // ===================================================

    // Vérifier si propriétaire
    @GetMapping(value = "/{videoId}/is-owner/{personId}",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> isVideoOwner(
            @PathVariable Long videoId,
            @PathVariable Long personId) {
        try {
            boolean isOwner = videoService.isVideoOwner(videoId, personId);
            return ResponseEntity.ok(Map.of(
                    "isOwner", isOwner,
                    "videoId", videoId,
                    "personId", personId
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Vérifier si achetable
    @GetMapping(value = "/{videoId}/can-purchase",
            produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> canPurchaseVideo(@PathVariable Long videoId) {
        try {
            boolean canPurchase = videoService.canPurchaseVideo(videoId);
            return ResponseEntity.ok(Map.of(
                    "canPurchase", canPurchase,
                    "videoId", videoId
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}