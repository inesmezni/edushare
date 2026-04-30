package com.edushare_backend.edushare_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edushare_backend.edushare_backend.config.JwtUtil;
import com.edushare_backend.edushare_backend.entity.Admin;
import com.edushare_backend.edushare_backend.service.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final JwtUtil jwtUtil;


    // Inscription d'un nouvel admin
    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@RequestBody Admin admin) {
        try {
            Admin registeredAdmin = adminService.registerAdmin(admin);
            String token = jwtUtil.generateToken(admin.getEmail());
            return ResponseEntity.ok(Map.of(
                    "admin", registeredAdmin,
                    "token", token,
                    "message", "Admin enregistré avec succès"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Connexion admin
    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            Admin admin = adminService.loginAdmin(email, password);
            String token = jwtUtil.generateToken(email);
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "tokenType", "Bearer",
                    "admin", Map.of(
                            "id", admin.getId(),
                            "name", admin.getName(),
                            "email", admin.getEmail(),
                            "role", admin.getRole(),
                            "adminLevel", admin.getAdminLevel()
                    ),
                    "message", "Connexion réussie"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    // Récupérer tous les utilisateurs
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(
                adminService.getAllUsers().stream().map(p -> Map.of(
                    "id", p.getId(),
                    "name", p.getName(),
                    "email", p.getEmail(),
                    "contributor", p.isContributor(),
                    "blocked", p.isBlocked(),
                    "creditBalance", p.getCreditBalance(),
                    "dateCreation", p.getDateCreation() != null ? p.getDateCreation().toString() : ""
                )).collect(java.util.stream.Collectors.toList())
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Récupérer les comptes bloqués
    @GetMapping("/users/blocked")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBlockedUsers() {
        return ResponseEntity.ok(adminService.getBlockedUsers());
    }

    // Récupérer les comptes actifs
    @GetMapping("/users/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getActiveUsers() {
        return ResponseEntity.ok(adminService.getActiveUsers());
    }

    // Rechercher un utilisateur par nom
    @GetMapping("/users/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchUsers(@RequestParam String name) {
        return ResponseEntity.ok(adminService.searchUsers(name));
    }

    // Récupérer un utilisateur par id
    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(adminService.getUserById(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @PatchMapping("/users/{userId}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> blockUser(@PathVariable Long userId) {
        try {
            adminService.blockUser(userId);
            return ResponseEntity.ok(Map.of("message", "Utilisateur bloqué avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Débloquer un utilisateur
    @PatchMapping("/users/{userId}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> unblockUser(@PathVariable Long userId) {
        try {
            adminService.unblockUser(userId);
            return ResponseEntity.ok(Map.of("message", "Utilisateur débloqué avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Valider un compte utilisateur
    @PatchMapping("/users/{userId}/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> validateUser(@PathVariable Long userId) {
        try {
            adminService.validateUser(userId);
            return ResponseEntity.ok(Map.of("message", "Compte validé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Supprimer définitivement un utilisateur
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            adminService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Analyse complète d'un utilisateur
    @GetMapping("/users/{userId}/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserAnalytics(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(adminService.getUserAnalytics(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    // Récupérer toutes les vidéos
    @GetMapping("/videos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllVideos() {
        return ResponseEntity.ok(adminService.getAllVideos());
    }

    // vidéos en attente de validation
    @GetMapping("/videos/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingVideos() {
        return ResponseEntity.ok(adminService.getPendingVideos());
    }

    // Rechercher une vidéo
    @GetMapping("/videos/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchVideos(@RequestParam String query) {
        return ResponseEntity.ok(adminService.searchVideos(query));
    }

    // Récupérer une vidéo par id
    @GetMapping("/videos/{videoId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getVideoById(@PathVariable Long videoId) {
        try {
            return ResponseEntity.ok(adminService.getVideoById(videoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // valider une vidéo PENDING → ACTIVE
    @PatchMapping("/videos/{videoId}/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> validateVideo(@PathVariable Long videoId) {
        try {
            return ResponseEntity.ok(adminService.validateVideo(videoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // rejeter une vidéo PENDING → REJECTED
    @PatchMapping("/videos/{videoId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectVideo(@PathVariable Long videoId) {
        try {
            return ResponseEntity.ok(adminService.rejectVideo(videoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Supprimer une vidéo
    @DeleteMapping("/videos/{videoId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteVideo(@PathVariable Long videoId) {
        try {
            adminService.deleteVideo(videoId);
            return ResponseEntity.ok(Map.of(
                    "message", "Vidéo supprimée avec succès",
                    "videoId", videoId
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Toutes les transactions
    @GetMapping("/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllTransactions() {
        return ResponseEntity.ok(adminService.getAllTransactions());
    }

    // Transactions d'un utilisateur
    @GetMapping("/transactions/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserTransactions(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(adminService.getTransactionsByUser(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Transaction par id
    @GetMapping("/transactions/{transactionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTransactionById(@PathVariable Long transactionId) {
        try {
            return ResponseEntity.ok(adminService.getTransactionById(transactionId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    // Stats globales de la plateforme
    @GetMapping("/stats/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminStats() {
        try {
            return ResponseEntity.ok(adminService.getAdminStats());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Stats du jour
    @GetMapping("/stats/daily")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDailyStats() {
        try {
            return ResponseEntity.ok(adminService.getDailyStats());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    

    // Vérifier si un utilisateur existe
    @GetMapping("/users/{userId}/exists")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> userExists(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("exists", adminService.userExists(userId)));
    }

    // Vérifier si une vidéo existe
    @GetMapping("/videos/{videoId}/exists")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> videoExists(@PathVariable Long videoId) {
        return ResponseEntity.ok(Map.of("exists", adminService.videoExists(videoId)));
    }

    // Vérification que l'API admin fonctionne
    @GetMapping("/health")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "Admin API is running",
                "timestamp", System.currentTimeMillis()
        ));
    }
}