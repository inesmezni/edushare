package com.edushare_backend.edushare_backend.service;

import com.edushare_backend.edushare_backend.entity.*;
import com.edushare_backend.edushare_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final PersonRepository personRepo;
    private final AdminRepository adminRepo;
    private final VideoRepository videoRepo;
    private final TransactionRepository transRepo;
    private final PaymentRepository paymentRepo;
    private final PasswordEncoder passwordEncoder;

    // ===================================================
    // COMPTE ADMIN
    // ===================================================

    // Inscription d'un nouvel admin
    public Admin registerAdmin(Admin admin) {
        if (adminRepo.findByEmail(admin.getEmail()).isPresent()) {
            throw new RuntimeException("Un admin avec cet email existe déjà");
        }
        // Hasher le mot de passe avant de sauvegarder
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setRole(Role.ADMIN);
        return adminRepo.save(admin);
    }

    // Connexion admin — vérifier email et mot de passe
    public Admin loginAdmin(String email, String password) {
        Admin admin = adminRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin non trouvé"));

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("Mot de passe invalide");
        }
        return admin;
    }

    // ===================================================
    // GESTION DES UTILISATEURS
    // ===================================================

    // Récupérer tous les utilisateurs
    public List<Person> getAllUsers() {
        return personRepo.findAllByOrderByDateCreationDesc();
    }

    // Récupérer les comptes bloqués seulement
    public List<Person> getBlockedUsers() {
        return personRepo.findByIsBlocked(true);
    }

    // Récupérer les comptes actifs seulement
    public List<Person> getActiveUsers() {
        return personRepo.findByIsBlocked(false);
    }

    // Rechercher un utilisateur par nom
    public List<Person> searchUsers(String name) {
        return personRepo.findByNameContainingIgnoreCase(name);
    }

    // Récupérer un utilisateur par son id
    public Person getUserById(Long userId) {
        return personRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    
    @Transactional
    public void blockUser(Long userId) {
        Person person = personRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

     
        person.setBlocked(true);
        personRepo.save(person);
    }

   
    @Transactional
    public void unblockUser(Long userId) {
        Person person = personRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

    
        person.setBlocked(false);
        personRepo.save(person);
    }

  
    @Transactional
    public void validateUser(Long userId) {
        Person person = personRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        person.setBlocked(false);
        personRepo.save(person);
    }

    
    @Transactional
    public void deleteUser(Long userId) {
        if (!personRepo.existsById(userId)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        personRepo.deleteById(userId);
    }

  
    // Récupérer toutes les vidéos
    public List<Video> getAllVideos() {
        return videoRepo.findAll();
    }

    // Récupérer les vidéos en attente de validation
    public List<Video> getPendingVideos() {
        return videoRepo.findByStatus(Video.VideoStatus.PENDING);
    }

    // Rechercher une vidéo par titre ou catégorie
    public List<Video> searchVideos(String query) {
        return videoRepo.searchByKeyword(query);
    }

    // Récupérer une vidéo par son id
    public Video getVideoById(Long videoId) {
        return videoRepo.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));
    }

   
    @Transactional
    public Video validateVideo(Long videoId) {
        Video video = videoRepo.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));

        // Vérifier que la vidéo est bien en attente
        if (video.getStatus() != Video.VideoStatus.PENDING) {
            throw new RuntimeException("Cette vidéo n'est pas en attente de validation");
        }

        
        video.validate();
        return videoRepo.save(video);
    }

    
    @Transactional
    public Video rejectVideo(Long videoId) {
        Video video = videoRepo.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));

        // Rejeter la vidéo
        video.reject();
        return videoRepo.save(video);
    }

    // Supprimer une vidéo — action admin
    @Transactional
    public void deleteVideo(Long videoId) {
        if (!videoRepo.existsById(videoId)) {
            throw new RuntimeException("Vidéo non trouvée");
        }
        videoRepo.deleteById(videoId);
    }

  

    
    public List<Transaction> getAllTransactions() {
        return transRepo.findTop10ByOrderByCreatedAtDesc();
    }

   
    public List<Transaction> getTransactionsByUser(Long userId) {
        return transRepo.findByBuyerIdOrderByCreatedAtDesc(userId);
    }

    
    public Transaction getTransactionById(Long transactionId) {
        return transRepo.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction non trouvée"));
    }

    
    public List<Transaction> getTransactionsBetweenDates(
            LocalDateTime start, LocalDateTime end) {
        return transRepo.findByCreatedAtBetween(start, end);
    }


    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        // Nombre total d'utilisateurs
        long totalUsers = personRepo.count();

        // Nombre total de vidéos
        long totalVideos = videoRepo.count();

        // Nombre de vidéos en attente de validation
        long pendingVideos = videoRepo.countByStatus(Video.VideoStatus.PENDING);

        // Nombre total de transactions
        long totalTransactions = transRepo.count();

        // Revenu total — calculé en base de données
        Double totalRevenue = transRepo.getTotalRevenue();
        if (totalRevenue == null) totalRevenue = 0.0;

        // Nombre de contributeurs
        long totalContributors = personRepo.countContributors();

        // Nombre d'étudiants
        long totalStudents = personRepo.countStudents();

        // Nombre de comptes bloqués
        long blockedUsers = personRepo.countByIsBlocked(true);

        stats.put("totalUsers", totalUsers);
        stats.put("totalContributors", totalContributors);
        stats.put("totalStudents", totalStudents);
        stats.put("blockedUsers", blockedUsers);
        stats.put("totalVideos", totalVideos);
        stats.put("pendingVideos", pendingVideos);
        stats.put("totalTransactions", totalTransactions);
        stats.put("totalRevenue", totalRevenue);
        // La plateforme prend 10% de commission
        stats.put("platformEarnings", totalRevenue * 0.1);

        return stats;
    }

   
    public Map<String, Object> getDailyStats() {
        Map<String, Object> dailyStats = new HashMap<>();

       
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0)
                .withMinute(0).withSecond(0);

      
        long newUsersToday = personRepo.countByDateCreationAfter(startOfDay);

   
        long newVideosToday = videoRepo.countByCreatedAtAfter(startOfDay);

    
        long newTransactionsToday = transRepo.countByCreatedAtAfter(startOfDay);

     
        Double revenueToday = transRepo.getRevenueBetweenDates(
                startOfDay, LocalDateTime.now());
        if (revenueToday == null) revenueToday = 0.0;

        dailyStats.put("newUsersToday", newUsersToday);
        dailyStats.put("newVideosToday", newVideosToday);
        dailyStats.put("newTransactionsToday", newTransactionsToday);
        dailyStats.put("revenueToday", revenueToday);

        return dailyStats;
    }

    // Analyse complète d'un utilisateur
    public Map<String, Object> getUserAnalytics(Long userId) {
        Person user = personRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vidéos publiées par cet utilisateur
        List<Video> userVideos = videoRepo.findByContributorId(userId);

        // Achats effectués
        List<Transaction> userPurchases = transRepo.findByBuyerId(userId);

        // Ventes réalisées (si contributeur)
        List<Transaction> userSales = transRepo.findByVideoContributorId(userId);

        
        Double totalSpent = transRepo.getTotalSpentByBuyer(userId);
        if (totalSpent == null) totalSpent = 0.0;

        Double totalEarned = transRepo.getTotalEarnedByContributor(userId);
        if (totalEarned == null) totalEarned = 0.0;

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("user", user);
        analytics.put("isContributor", user.isContributor());
        analytics.put("isBlocked", user.isBlocked());
        analytics.put("totalVideosUploaded", userVideos.size());
        analytics.put("totalVideosPurchased", userPurchases.size());
        analytics.put("totalSales", userSales.size());
        analytics.put("totalSpent", totalSpent);
        analytics.put("totalEarned", totalEarned);
        analytics.put("currentBalance", user.getCreditBalance());
        analytics.put("joinDate", user.getDateCreation());

        return analytics;
    }

  

    // Vérifier si un utilisateur existe
    public boolean userExists(Long userId) {
        return personRepo.existsById(userId);
    }

    // Vérifier si une vidéo existe
    public boolean videoExists(Long videoId) {
        return videoRepo.existsById(videoId);
    }

    // Nombre total de transactions
    public long getTotalTransactions() {
        return transRepo.count();
    }

   
    public double getTotalRevenue() {
        Double revenue = transRepo.getTotalRevenue();
        return revenue != null ? revenue : 0.0;
    }
}