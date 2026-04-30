package com.edushare_backend.edushare_backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.edushare_backend.edushare_backend.entity.Video;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    List<Video> findByCategoryId(Long categoryId);
    List<Video> findByCategoryName(String categoryName);
    List<Video> findByCategoryNameContainingIgnoreCase(String categoryName);
    List<Video> findByCategoryIdAndStatus(Long categoryId, Video.VideoStatus status);
    List<Video> findByCategoryNameAndStatus(String categoryName, Video.VideoStatus status);
    List<Video> findByCategoryNameOrderByCreatedAtDesc(String categoryName);


    List<Video> findByContributorId(Long contributorId);
    List<Video> findByContributorIdAndCategoryId(Long contributorId, Long categoryId);
    List<Video> findByStatusAndContributorId(Video.VideoStatus status, Long contributorId);

    // Top vidéos d'un contributeur triées par vues
    @Query("SELECT v FROM Video v WHERE v.contributor.id = :contributorId " +
           "ORDER BY v.views DESC")
    List<Video> findByContributorIdOrderByViewsDesc(
            @Param("contributorId") Long contributorId);

   
    List<Video> findByTitleContainingIgnoreCase(String title);

    // Recherche globale par mot clé — titre, description, catégorie
    @Query("SELECT v FROM Video v WHERE " +
           "LOWER(v.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.category.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Video> searchByKeyword(@Param("keyword") String keyword);

    // Recherche par titre ou catégorie
    @Query("SELECT v FROM Video v WHERE " +
           "LOWER(v.title) LIKE LOWER(CONCAT('%', :title, '%')) OR " +
           "LOWER(v.category.name) LIKE LOWER(CONCAT('%', :category, '%'))")
    List<Video> findByTitleOrCategory(
            @Param("title") String title,
            @Param("category") String category);

    // ===== TRI ET FILTRES =====
    List<Video> findAllByOrderByCreatedAtDesc();
    List<Video> findAllByOrderByViewsDesc();
    List<Video> findByStatusOrderByCreatedAtDesc(Video.VideoStatus status);
    List<Video> findByStatus(Video.VideoStatus status);

   
    List<Video> findTop10ByOrderByViewsDesc();
    List<Video> findTop10ByStatusOrderByViewsDesc(Video.VideoStatus status);
    List<Video> findTop5ByCategoryNameOrderByViewsDesc(String categoryName);

    List<Video> findTop10ByStatusOrderByCreatedAtDesc(Video.VideoStatus status);


   
    List<Video> findByPriceBetween(double minPrice, double maxPrice);
    List<Video> findByPriceLessThanEqual(double maxPrice);
    List<Video> findByPriceGreaterThanEqual(double minPrice);
    List<Video> findByPriceOrderByViewsDesc(double price);
    List<Video> findByPriceAndStatusOrderByCreatedAtDesc(
            double price, Video.VideoStatus status);

    // ===== VIDÉOS GRATUITES =====
    @Query("SELECT v FROM Video v WHERE v.price = 0 AND v.status = 'ACTIVE'")
    List<Video> findFreeVideos();

    // ===== VIDÉOS ACHETÉES PAR UN UTILISATEUR =====
    @Query("SELECT DISTINCT t.video FROM Transaction t WHERE t.buyer.id = :buyerId AND t.status = 'COMPLETED'")
    List<Video> findPurchasedVideosByBuyerId(@Param("buyerId") Long buyerId);

    // ===== VÉRIFICATIONS =====
    boolean existsByTitleAndContributorId(String title, Long contributorId);
    boolean existsByIdAndContributorId(Long videoId, Long contributorId);
    Optional<Video> findByVideoUrl(String videoUrl);

    // ===== STATISTIQUES CONTRIBUTEUR =====
    // Total des vues d'un contributeur
    @Query("SELECT SUM(v.views) FROM Video v WHERE v.contributor.id = :contributorId")
    Long getTotalViewsByContributor(@Param("contributorId") Long contributorId);

    // Total des likes d'un contributeur
    @Query("SELECT SUM(v.likes) FROM Video v WHERE v.contributor.id = :contributorId")
    Long getTotalLikesByContributor(@Param("contributorId") Long contributorId);

    long countByContributorId(Long contributorId);
    long countByCategoryId(Long categoryId);
    long countByCategoryName(String categoryName);
    long countByStatus(Video.VideoStatus status);

    // ===== STATISTIQUES GLOBALES (ADMIN) =====
    // Total des vues de toutes les vidéos actives
    @Query("SELECT SUM(v.views) FROM Video v WHERE v.status = 'ACTIVE'")
    Long getTotalViews();

    // Prix moyen des vidéos
    @Query("SELECT AVG(v.price) FROM Video v")
    Double getAverageVideoPrice();

    // Nombre de vidéos par catégorie
    @Query("SELECT v.category, COUNT(v) FROM Video v " +
           "GROUP BY v.category ORDER BY COUNT(v) DESC")
    List<Object[]> getVideoCountByCategory();

    // ===== RECHERCHE TEMPORELLE =====
    List<Video> findByCreatedAtAfter(LocalDateTime date);
    List<Video> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    long countByCreatedAtAfter(LocalDateTime date);
}