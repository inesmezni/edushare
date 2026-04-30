package com.edushare_backend.edushare_backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.edushare_backend.edushare_backend.dto.VideoUploadRequest;
import com.edushare_backend.edushare_backend.entity.Category;
import com.edushare_backend.edushare_backend.entity.Person;
import com.edushare_backend.edushare_backend.entity.Video;
import com.edushare_backend.edushare_backend.repository.CategoryRepository;
import com.edushare_backend.edushare_backend.repository.PersonRepository;
import com.edushare_backend.edushare_backend.repository.VideoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class VideoService {

    private final VideoRepository videoRepository;
    private final PersonRepository personRepository;
    private final CategoryRepository categoryRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;


    public Video createVideoWithFiles(VideoUploadRequest request, Long contributorId) {

        // Vérifier que le contributeur existe
        Person contributor = personRepository.findById(contributorId)
                .orElseThrow(() -> new RuntimeException("Contributeur non trouvé"));

        // Vérifier que c'est bien un contributeur
        if (!contributor.isContributor()) {
            throw new RuntimeException("Vous devez être contributeur pour publier une vidéo");
        }

        // Chercher ou créer la catégorie
        Category category = findOrCreateCategory(request.getCategory());

        // Créer l'entité vidéo
        Video video = new Video();
        video.setTitle(request.getTitle());
        video.setDescription(request.getDescription());
        video.setPrice(request.getPrice());
        video.setCategory(category);
        video.setContributor(contributor);
        video.setViews(0);
        video.setLikes(0);
        video.setCreatedAt(LocalDateTime.now());
        video.setUpdatedAt(LocalDateTime.now());

        video.setStatus(Video.VideoStatus.PENDING);

        try {
           
            String videoFileName = saveFile(request.getVideoFile(), "videos");
            String thumbnailFileName = saveFile(request.getThumbnail(), "thumbnails");

            video.setVideoUrl("/uploads/videos/" + videoFileName);
            video.setThumbnailUrl("/uploads/thumbnails/" + thumbnailFileName);

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement des fichiers: " + e.getMessage());
        }

        return videoRepository.save(video);
    }

   
    // Chercher une catégorie par nom ou en créer une nouvelle
    private Category findOrCreateCategory(String categoryName) {
        return categoryRepository.findByName(categoryName)
                .orElseGet(() -> {
                    Category newCategory = new Category();
                    newCategory.setName(categoryName);
                    newCategory.setDescription("Catégorie créée automatiquement");
                    newCategory.setCreatedAt(LocalDateTime.now());
                    return categoryRepository.save(newCategory);
                });
    }


    private String saveFile(MultipartFile file, String subDirectory) throws IOException {

        // Vérifier que le fichier n'est pas vide
        if (file.isEmpty()) {
            throw new IOException("Le fichier est vide");
        }

        // Vérifier le nom du fichier
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IOException("Nom de fichier invalide");
        }

        // Créer le dossier si il n'existe pas
        Path uploadPath = Paths.get(uploadDir, subDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Générer un nom unique pour éviter les conflits
        String fileExtension = "";
        if (originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + fileExtension;

        // Sauvegarder physiquement le fichier
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        return fileName;
    }

    // Créer une vidéo simple (sans fichier)
    public Video createVideo(Video video, Long contributorId) {
        Person contributor = personRepository.findById(contributorId)
                .orElseThrow(() -> new RuntimeException("Contributeur non trouvé"));

        // Vérifier que c'est un contributeur
        if (!contributor.isContributor()) {
            throw new RuntimeException("Vous devez être contributeur pour publier une vidéo");
        }

        video.setContributor(contributor);
        // Statut PENDING — en attente de validation admin
        video.setStatus(Video.VideoStatus.PENDING);
        return videoRepository.save(video);
    }

    public Video updateVideo(Long videoId, Video videoDetails, Long contributorId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));

        // Vérifier que c'est bien le propriétaire
        if (!video.getContributor().getId().equals(contributorId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette vidéo");
        }

        if (videoDetails.getTitle() != null) video.setTitle(videoDetails.getTitle());
        if (videoDetails.getDescription() != null) video.setDescription(videoDetails.getDescription());
        if (videoDetails.getCategory() != null) video.setCategory(videoDetails.getCategory());
        if (videoDetails.getPrice() >= 0) video.setPrice(videoDetails.getPrice());
        if (videoDetails.getVideoUrl() != null) video.setVideoUrl(videoDetails.getVideoUrl());
        if (videoDetails.getThumbnailUrl() != null) video.setThumbnailUrl(videoDetails.getThumbnailUrl());
        if (videoDetails.getStatus() != null) video.setStatus(videoDetails.getStatus());

        video.setUpdatedAt(LocalDateTime.now());
        return videoRepository.save(video);
    }

    public void deleteVideo(Long videoId, Long contributorId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));

        if (!video.getContributor().getId().equals(contributorId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer cette vidéo");
        }

        videoRepository.delete(video);
    }

    @Transactional(readOnly = true)
    public List<Video> getAllVideos() {
        return videoRepository.findAllByOrderByCreatedAtDesc();
    }

  
    @Transactional(readOnly = true)
    public Video getVideoById(Long videoId) {
        return videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));
    }

   
    @Transactional(readOnly = true)
    public List<Video> getVideosByCategory(String categoryName) {
        return videoRepository.findByCategoryNameAndStatus(categoryName, Video.VideoStatus.ACTIVE);
    }


    @Transactional(readOnly = true)
    public List<Video> searchVideos(String keyword) {
        return videoRepository.searchByKeyword(keyword);
    }


    @Transactional(readOnly = true)
    public List<Video> getVideosByContributor(Long contributorId) {
        return videoRepository.findByContributorId(contributorId);
    }


    public Video incrementViews(Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));
        video.incrementViews();
        return videoRepository.save(video);
    }


    public Video likeVideo(Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));
        video.incrementLikes();
        return videoRepository.save(video);
    }

    public Video unlikeVideo(Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));
        video.decrementLikes();
        return videoRepository.save(video);
    }

    @Transactional(readOnly = true)
    public List<Video> getPopularVideos() {
        return videoRepository.findTop10ByOrderByViewsDesc();
    }

    @Transactional(readOnly = true)
    public List<Video> getRecentVideos() {
        return videoRepository.findTop10ByStatusOrderByCreatedAtDesc(Video.VideoStatus.ACTIVE);
    }

   
    @Transactional(readOnly = true)
    public List<Video> getFreeVideos() {
        return videoRepository.findFreeVideos();
    }

    
    @Transactional(readOnly = true)
    public List<Video> getTrendingVideos() {
        return videoRepository.findTop10ByStatusOrderByViewsDesc(Video.VideoStatus.ACTIVE);
    }


    @Transactional(readOnly = true)
    public Map<String, Object> getVideoStats(Long contributorId) {
        List<Video> videos = videoRepository.findByContributorId(contributorId);

        long totalViews = videos.stream().mapToLong(Video::getViews).sum();
        long totalLikes = videos.stream().mapToLong(Video::getLikes).sum();

        double totalRevenue = videos.stream()
                .mapToDouble(v -> v.getPrice() * v.getViews())
                .sum();

        return Map.of(
                "totalVideos", videos.size(),
                "totalViews", totalViews,
                "totalLikes", totalLikes,
                "totalRevenue", totalRevenue,
                "averageViews", videos.isEmpty() ? 0 : totalViews / videos.size()
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getCategoryStats() {
        List<Object[]> results = videoRepository.getVideoCountByCategory();
        return results.stream()
                .collect(Collectors.toMap(
                        obj -> obj[0].toString(),
                        obj -> (Long) obj[1]
                ));
    }

  
    @Transactional(readOnly = true)
    public List<Video> getAllVideos(int page, int size) {
        List<Video> allVideos = videoRepository.findAllByOrderByCreatedAtDesc();
        return paginate(allVideos, page, size);
    }

   
    @Transactional(readOnly = true)
    public List<Video> getVideosByCategory(String category, int page, int size) {
        List<Video> videos = videoRepository.findByCategoryNameAndStatus(
                category, Video.VideoStatus.ACTIVE);
        return paginate(videos, page, size);
    }

    @Transactional(readOnly = true)
    public List<Video> searchVideos(String keyword, String category,
                                    Double minPrice, Double maxPrice,
                                    int page, int size) {
        List<Video> results = videoRepository.searchByKeyword(keyword);

        
        if (category != null && !category.isEmpty()) {
            results = results.stream()
                    .filter(v -> v.getCategory().getName().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        if (minPrice != null) {
            results = results.stream()
                    .filter(v -> v.getPrice() >= minPrice)
                    .collect(Collectors.toList());
        }

        
        if (maxPrice != null) {
            results = results.stream()
                    .filter(v -> v.getPrice() <= maxPrice)
                    .collect(Collectors.toList());
        }

        return paginate(results, page, size);
    }

    @Transactional(readOnly = true)
    public List<Video> getVideosByContributor(Long contributorId, int page, int size) {
        List<Video> videos = videoRepository.findByContributorId(contributorId);
        return paginate(videos, page, size);
    }

   
    @Transactional(readOnly = true)
    public List<Video> getPopularVideos(int limit) {
        return videoRepository.findTop10ByOrderByViewsDesc().stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    
    @Transactional(readOnly = true)
    public List<Video> getRecentVideos(int limit) {
        return videoRepository.findTop10ByStatusOrderByCreatedAtDesc(Video.VideoStatus.ACTIVE)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

   
    @Transactional(readOnly = true)
    public List<Video> getFreeVideos(int page, int size) {
        List<Video> freeVideos = videoRepository.findFreeVideos();
        return paginate(freeVideos, page, size);
    }

    
    @Transactional(readOnly = true)
    public List<Video> getVideosByCategoryId(Long categoryId) {
        return videoRepository.findByCategoryId(categoryId);
    }


    @Transactional(readOnly = true)
    public List<Video> getVideosByPriceRange(double minPrice, double maxPrice) {
        return videoRepository.findByPriceBetween(minPrice, maxPrice);
    }


    public boolean isVideoOwner(Long videoId, Long personId) {
        return videoRepository.existsByIdAndContributorId(videoId, personId);
    }

  
    public boolean canPurchaseVideo(Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));
        return video.isPurchasable();
    }


    private <T> List<T> paginate(List<T> list, int page, int size) {
        int start = page * size;
        if (start >= list.size()) return List.of();
        int end = Math.min(start + size, list.size());
        return list.subList(start, end);
    }
}