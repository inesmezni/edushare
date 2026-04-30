package com.edushare_backend.edushare_backend.controller;

import com.edushare_backend.edushare_backend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/video/{videoId}")
    public ResponseEntity<?> addComment(
            @PathVariable Long videoId,
            @RequestParam Long authorId,
            @RequestBody Map<String, String> request) {

        try {
            String content = request.get("content");
            Integer rating = request.get("rating") != null ? Integer.parseInt(request.get("rating")) : null;

            return ResponseEntity.ok(commentService.addComment(videoId, authorId, content, rating));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/video/{videoId}")
    public ResponseEntity<?> getVideoComments(@PathVariable Long videoId) {
        try {
            return ResponseEntity.ok(commentService.getVideoComments(videoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId,
            @RequestParam Long authorId,
            @RequestBody Map<String, String> request) {

        try {
            String content = request.get("content");
            Integer rating = request.get("rating") != null ? Integer.parseInt(request.get("rating")) : null;

            return ResponseEntity.ok(commentService.updateComment(commentId, authorId, content, rating));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long authorId) {

        try {
            commentService.deleteComment(commentId, authorId);
            return ResponseEntity.ok(Map.of("message", "Commentaire supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/video/{videoId}/rating")
    public ResponseEntity<?> getVideoRatingStats(@PathVariable Long videoId) {
        try {
            return ResponseEntity.ok(commentService.getVideoRatingStats(videoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}