package com.edushare_backend.edushare_backend.service;

import com.edushare_backend.edushare_backend.entity.*;
import com.edushare_backend.edushare_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class PersonService {

    private final PersonRepository personRepo;
    private final VideoRepository videoRepo;
    private final TransactionRepository transRepo;
    private final PaymentRepository paymentRepo;
    private final PasswordEncoder passwordEncoder;
    private final PaymentService paymentService;

    // ===================================================
    // INSCRIPTION ET CONNEXION
    // ===================================================

    // Inscription — étudiant ou contributeur
    public Person register(Person person) {
        if (personRepo.findByEmail(person.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }
        // Hasher le mot de passe avant de sauvegarder
        person.setPassword(passwordEncoder.encode(person.getPassword()));
        person.setRole(Role.PERSON);
        person.setCreditBalance(0.0);
        return personRepo.save(person);
    }

    // Connexion — vérifier email et mot de passe
    public Person login(String email, String password) {
        Person person = personRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier si le compte est bloqué
        if (person.isBlocked()) {
            throw new RuntimeException("Votre compte est bloqué. Contactez l'administrateur.");
        }

        if (!passwordEncoder.matches(password, person.getPassword())) {
            throw new RuntimeException("Mot de passe invalide");
        }

        return person;
    }

    // ===================================================
    // GESTION DES VIDÉOS — PUBLICATION
    // Seulement pour les contributeurs
    // ===================================================

    // Publier une vidéo — vérification isContributor ajoutée
    public Video uploadVideo(Long personId, Video video) {
        Person contributor = personRepo.findById(personId)
                .orElseThrow(() -> new RuntimeException("Personne non trouvée"));

        // Vérifier que c'est bien un contributeur
        if (!contributor.isContributor()) {
            throw new RuntimeException(
                "Vous devez être contributeur pour publier une vidéo");
        }

        video.setContributor(contributor);
        // Statut PENDING — en attente de validation admin
        video.setStatus(Video.VideoStatus.PENDING);
        return videoRepo.save(video);
    }

    // Modifier une vidéo — seulement le propriétaire
    public Video updateVideo(Long videoId, Video videoDetails, Long personId) {
        Video video = videoRepo.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));

        // Vérifier que c'est bien le propriétaire
        if (!video.getContributor().getId().equals(personId)) {
            throw new RuntimeException("Vous ne pouvez modifier que vos propres vidéos");
        }

        if (videoDetails.getTitle() != null) video.setTitle(videoDetails.getTitle());
        if (videoDetails.getDescription() != null) video.setDescription(videoDetails.getDescription());
        if (videoDetails.getCategory() != null) video.setCategory(videoDetails.getCategory());
        if (videoDetails.getPrice() >= 0) video.setPrice(videoDetails.getPrice());
        if (videoDetails.getVideoUrl() != null) video.setVideoUrl(videoDetails.getVideoUrl());
        if (videoDetails.getThumbnailUrl() != null) video.setThumbnailUrl(videoDetails.getThumbnailUrl());

        return videoRepo.save(video);
    }

    // Supprimer une vidéo — seulement le propriétaire
    public void deleteVideo(Long videoId, Long personId) {
        Video video = videoRepo.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));

        // Vérifier que c'est bien le propriétaire
        if (!video.getContributor().getId().equals(personId)) {
            throw new RuntimeException("Vous ne pouvez supprimer que vos propres vidéos");
        }

        videoRepo.deleteById(videoId);
    }

    // ===================================================
    // CONSULTATION — étudiant + contributeur
    // ===================================================

    // Toutes les vidéos actives
    public List<Video> getAllVideos() {
        return videoRepo.findByStatus(Video.VideoStatus.ACTIVE);
    }

    // Recherche par catégorie
    public List<Video> searchVideosByCategory(String category) {
        return videoRepo.findByCategoryNameContainingIgnoreCase(category);
    }

    // Recherche par titre
    public List<Video> searchVideosByTitle(String title) {
        return videoRepo.findByTitleContainingIgnoreCase(title);
    }

    // Recherche générale par mot clé
    public List<Video> searchVideos(String keyword) {
        return videoRepo.searchByKeyword(keyword);
    }

    // Vidéo par id
    public Video getVideoById(Long videoId) {
        return videoRepo.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));
    }

    // Incrémenter les vues
    public Video incrementViews(Long videoId) {
        Video video = videoRepo.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));
        video.setViews(video.getViews() + 1);
        return videoRepo.save(video);
    }

    // ===================================================
    // ACHAT — étudiant + contributeur
    // ===================================================

    // Acheter une vidéo avec les crédits
    @Transactional
    public Transaction buyVideo(Long personId, Long videoId) {
        return paymentService.processVideoPurchase(personId, videoId);
    }

    // ===================================================
    // CRÉDITS ET PAIEMENTS
    // ===================================================
    
    // Ajouter des crédits au compte
    @Transactional
    public Payment addCredits(Long personId, double amount, String paymentMethod) {
        return paymentService.addCredits(personId, amount, paymentMethod);
    }

    // Retirer des gains — contributeur seulement
    @Transactional
    public Payment withdrawEarnings(Long personId, double amount, String withdrawalMethod) {
        Person person = personRepo.findById(personId)
                .orElseThrow(() -> new RuntimeException("Personne non trouvée"));

        // Vérifier que c'est un contributeur
        if (!person.isContributor()) {
            throw new RuntimeException(
                "Seuls les contributeurs peuvent retirer des gains");
        }

        return paymentService.withdrawEarnings(personId, amount, withdrawalMethod);
    }

    // ===================================================
    // STATISTIQUES — contributeur seulement
    // ===================================================

    // Statistiques de ventes d'un contributeur
    public Map<String, Object> getSalesStats(Long contributorId) {
        List<Video> videos = videoRepo.findByContributorId(contributorId);

        // Total vues via repository
        Long totalViews = videoRepo.getTotalViewsByContributor(contributorId);
        if (totalViews == null) totalViews = 0L;

        // Total gains via repository
        Double totalRevenue = transRepo.getTotalEarnedByContributor(contributorId);
        if (totalRevenue == null) totalRevenue = 0.0;

        // Total ventes
        long totalSales = transRepo.countByVideoContributorId(contributorId);

        Person contributor = personRepo.findById(contributorId)
                .orElseThrow(() -> new RuntimeException("Contributeur non trouvé"));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVideos", videos.size());
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalViews", totalViews);
        stats.put("totalSales", totalSales);
        stats.put("availableBalance", contributor.getCreditBalance());

        return stats;
    }

    // ===================================================
    // PROFIL
    // ===================================================

    // Voir son profil
    public Person getProfile(Long personId) {
        return personRepo.findById(personId)
                .orElseThrow(() -> new RuntimeException("Personne non trouvée"));
    }

    // Modifier son profil
    public Person updateProfile(Long personId, ProfileUpdateRequest request) {
        Person person = personRepo.findById(personId)
                .orElseThrow(() -> new RuntimeException("Personne non trouvée"));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            person.setName(request.getName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();
            // Vérifier que le nouvel email n'est pas déjà utilisé
            if (!person.getEmail().equals(newEmail) &&
                    personRepo.findByEmail(newEmail).isPresent()) {
                throw new RuntimeException("Email déjà utilisé");
            }
            person.setEmail(newEmail);
        }
        if (request.getPhone() != null) {
            person.setPhone(request.getPhone());
        }

        return personRepo.save(person);
    }

    // Devenir contributeur
    @Transactional
    public Person becomeContributor(Long personId) {
        Person person = personRepo.findById(personId)
                .orElseThrow(() -> new RuntimeException("Personne non trouvée"));

        person.setContributor(true);
        return personRepo.save(person);
    }

    // ===================================================
    // MES VIDÉOS ET CONTENU
    // ===================================================

    // Mes vidéos publiées — contributeur seulement
    public List<Video> getMyVideos(Long contributorId) {
        return videoRepo.findByContributorId(contributorId);
    }

    // Vidéos achetées — étudiant + contributeur
    public List<Video> getPurchasedVideos(Long personId) {
        return videoRepo.findPurchasedVideosByBuyerId(personId);
    }

    // Mes transactions d'achat
    public List<Transaction> getMyPurchases(Long buyerId) {
        return paymentService.getUserTransactions(buyerId);
    }

    // Mes paiements
    public List<Payment> getMyPayments(Long personId) {
        return paymentService.getPersonPayments(personId);
    }

    // ===================================================
    // UTILITAIRES
    // ===================================================

    // Vidéos populaires
    public List<Video> getPopularVideos() {
        return videoRepo.findAllByOrderByViewsDesc();
    }

    // Vidéos récentes
    public List<Video> getRecentVideos() {
        return videoRepo.findAllByOrderByCreatedAtDesc();
    }

    // Vidéos gratuites
    public List<Video> getFreeVideos() {
        return videoRepo.findByPriceAndStatusOrderByCreatedAtDesc(
                0.0, Video.VideoStatus.ACTIVE);
    }

    // Vidéos par fourchette de prix
    public List<Video> getVideosByPriceRange(double minPrice, double maxPrice) {
        return videoRepo.findByPriceBetween(minPrice, maxPrice);
    }

    // Vérifier si propriétaire d'une vidéo
    public boolean isVideoOwner(Long personId, Long videoId) {
        Video video = videoRepo.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));
        return video.getContributor().getId().equals(personId);
    }

    // Solde de crédits
    public double getCreditBalance(Long personId) {
        Person person = personRepo.findById(personId)
                .orElseThrow(() -> new RuntimeException("Personne non trouvée"));
        return person.getCreditBalance();
    }

    // Vérifier si une vidéo a été achetée
    public boolean hasPurchasedVideo(Long personId, Long videoId) {
        return paymentService.hasUserPurchasedVideo(personId, videoId);
    }

    // Stats d'achat
    public Map<String, Object> getPurchaseStats(Long personId) {
        return paymentService.getUserPurchaseStats(personId);
    }

    // Stats de paiement
    public Map<String, Object> getPaymentStats(Long personId) {
        return paymentService.getPaymentStats(personId);
    }

    // ===================================================
    // CLASSE INTERNE — mise à jour du profil
    // ===================================================

    public static class ProfileUpdateRequest {
        private String name;
        private String email;
        private String phone;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }
}