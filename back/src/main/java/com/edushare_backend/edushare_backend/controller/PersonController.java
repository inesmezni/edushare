package com.edushare_backend.edushare_backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edushare_backend.edushare_backend.entity.Person;
import com.edushare_backend.edushare_backend.entity.Video;
import com.edushare_backend.edushare_backend.repository.PaymentRepository;
import com.edushare_backend.edushare_backend.repository.PersonRepository;
import com.edushare_backend.edushare_backend.service.PersonService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/person")
@RequiredArgsConstructor
public class PersonController {

    private final PersonService personService;
    private final PersonRepository personRepository;
    private final PaymentRepository paymentRepository;

    // ===================================================
    // AUTHENTIFICATION
    // ===================================================

    // Inscription — étudiant ou contributeur
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Person person) {
        try {
            return ResponseEntity.ok(personService.register(person));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Connexion
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            return ResponseEntity.ok(personService.login(email, password));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===================================================
    // GESTION DES VIDÉOS — CONSULTATION
    // ===================================================

    // Toutes les vidéos
    @GetMapping("/videos")
    public ResponseEntity<?> getAllVideos() {
        return ResponseEntity.ok(personService.getAllVideos());
    }

    // Vidéo par id
    @GetMapping("/videos/{videoId}")
    public ResponseEntity<?> getVideo(@PathVariable Long videoId) {
        try {
            return ResponseEntity.ok(personService.getVideoById(videoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Recherche par catégorie 
    @GetMapping("/search/category")
    public ResponseEntity<?> searchByCategory(@RequestParam String category) {
        return ResponseEntity.ok(personService.searchVideosByCategory(category));
    }

    // Recherche par titre 
    @GetMapping("/search/title")
    public ResponseEntity<?> searchByTitle(@RequestParam String title) {
        return ResponseEntity.ok(personService.searchVideosByTitle(title));
    }

    // Visionner une vidéo — incrémenter les vues
    @PostMapping("/videos/{videoId}/watch")
    public ResponseEntity<?> watchVideo(@PathVariable Long videoId) {
        try {
            return ResponseEntity.ok(personService.incrementViews(videoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Vidéos populaires
    @GetMapping("/videos/popular")
    public ResponseEntity<?> getPopularVideos() {
        return ResponseEntity.ok(personService.getPopularVideos());
    }

    // ===================================================
    // GESTION DES VIDÉOS — PUBLICATION
    // Accessible seulement aux contributeurs
    // ===================================================

    // Publier une vidéo 
    @PostMapping("/{id}/upload")
    @PreAuthorize("hasRole('CONTRIBUTOR')")
    public ResponseEntity<?> upload(@PathVariable Long id, @RequestBody Video video) {
        try {
            return ResponseEntity.ok(personService.uploadVideo(id, video));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Modifier une vidéo 
    @PutMapping("/videos/{videoId}")
    @PreAuthorize("hasRole('CONTRIBUTOR')")
    public ResponseEntity<?> updateVideo(@PathVariable Long videoId,
                                         @RequestBody Video video,
                                         @RequestParam Long personId) {
        try {
            return ResponseEntity.ok(personService.updateVideo(videoId, video, personId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Supprimer une vidéo 
    @DeleteMapping("/videos/{videoId}")
    @PreAuthorize("hasRole('CONTRIBUTOR')")
    public ResponseEntity<?> deleteVideo(@PathVariable Long videoId,
                                         @RequestParam Long personId) {
        try {
            personService.deleteVideo(videoId, personId);
            return ResponseEntity.ok(Map.of("message", "Vidéo supprimée avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===================================================
    // ACHAT ET CRÉDITS
    // ===================================================

    // Acheter une vidéo
    @PostMapping("/{id}/buy/{videoId}")
    @PreAuthorize("hasAnyRole('PERSON', 'CONTRIBUTOR')")
    public ResponseEntity<?> buyVideo(@PathVariable Long id,
                                      @PathVariable Long videoId) {
        try {
            return ResponseEntity.ok(personService.buyVideo(id, videoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Ajouter des crédits
    @PostMapping("/{personId}/add-credits")
    @PreAuthorize("hasAnyRole('PERSON', 'CONTRIBUTOR')")
    public ResponseEntity<?> addCredits(@PathVariable Long personId,
                                        @RequestBody CreditRequest request) {
        try {
            return ResponseEntity.ok(personService.addCredits(
                    personId, request.getAmount(), request.getPaymentMethod()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Retirer des gains 
    @PostMapping("/{personId}/withdraw")
    @PreAuthorize("hasRole('CONTRIBUTOR')")
    public ResponseEntity<?> withdraw(@PathVariable Long personId,
                                      @RequestBody WithdrawRequest request) {
        try {
            return ResponseEntity.ok(personService.withdrawEarnings(
                    personId, request.getAmount(), request.getWithdrawalMethod()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===================================================
    // PROFIL
    // ===================================================

    // Voir son profil
    @GetMapping("/{id}/profile")
    @PreAuthorize("hasAnyRole('PERSON', 'CONTRIBUTOR')")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(personService.getProfile(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Modifier son profil
    @PutMapping("/{id}/profile")
    @PreAuthorize("hasAnyRole('PERSON', 'CONTRIBUTOR')")
    public ResponseEntity<?> updateProfile(@PathVariable Long id,
                                           @RequestBody PersonService.ProfileUpdateRequest request) {
        try {
            return ResponseEntity.ok(personService.updateProfile(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===================================================
    // MES VIDÉOS ET CONTENU
    // ===================================================

    // Mes vidéos publiées 
    @GetMapping("/{id}/my-videos")
    @PreAuthorize("hasRole('CONTRIBUTOR')")
    public ResponseEntity<?> getMyVideos(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(personService.getMyVideos(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Vidéos achetées 
    @GetMapping("/{id}/purchased-videos")
    @PreAuthorize("hasAnyRole('PERSON', 'CONTRIBUTOR')")
    public ResponseEntity<?> getPurchasedVideos(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(personService.getPurchasedVideos(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===================================================
    // STATISTIQUES — contributeur seulement
    // ===================================================

    // Stats de ventes
    @GetMapping("/{id}/stats")
    @PreAuthorize("hasRole('CONTRIBUTOR')")
    public ResponseEntity<?> getStats(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(personService.getSalesStats(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===================================================
    // TRANSACTIONS ET PAIEMENTS
    // ===================================================

    // Mes transactions
    @GetMapping("/{id}/transactions")
    @PreAuthorize("hasAnyRole('PERSON', 'CONTRIBUTOR')")
    public ResponseEntity<?> getMyTransactions(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(personService.getMyPurchases(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Mes paiements
    @GetMapping("/{id}/payments")
    @PreAuthorize("hasAnyRole('PERSON', 'CONTRIBUTOR')")
    public ResponseEntity<?> getMyPayments(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(personService.getMyPayments(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===================================================
    // UTILITAIRES
    // ===================================================

    // Vérifier si propriétaire d'une vidéo
    @GetMapping("/{personId}/videos/{videoId}/is-owner")
    public ResponseEntity<?> isVideoOwner(@PathVariable Long personId,
                                          @PathVariable Long videoId) {
        try {
            return ResponseEntity.ok(personService.isVideoOwner(personId, videoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Vérifier si une vidéo a été achetée
    @GetMapping("/{personId}/videos/{videoId}/has-purchased")
    @PreAuthorize("hasAnyRole('PERSON', 'CONTRIBUTOR')")
    public ResponseEntity<?> hasPurchasedVideo(@PathVariable Long personId,
                                               @PathVariable Long videoId) {
        try {
            return ResponseEntity.ok(personService.hasPurchasedVideo(personId, videoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Solde de crédits
    @GetMapping("/{personId}/balance")
    @PreAuthorize("hasAnyRole('PERSON', 'CONTRIBUTOR')")
    public ResponseEntity<?> getBalance(@PathVariable Long personId) {
        try {
            return ResponseEntity.ok(Map.of("balance", personService.getCreditBalance(personId)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===================================================
    // CLASSES DE REQUÊTES
    // ===================================================

    public static class CreditRequest {
        private double amount;
        private String paymentMethod;

        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }

    public static class WithdrawRequest {
        private double amount;
        private String withdrawalMethod;

        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public String getWithdrawalMethod() { return withdrawalMethod; }
        public void setWithdrawalMethod(String m) { this.withdrawalMethod = m; }
    }
}