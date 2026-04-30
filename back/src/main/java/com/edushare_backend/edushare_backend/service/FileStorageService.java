package com.edushare_backend.edushare_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    // Types MIME autorisés pour les vidéos
    private static final String[] ALLOWED_VIDEO_TYPES = {
            "video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv",
            "video/webm", "video/mkv", "video/3gp"
    };

    // Types MIME autorisés pour les images
    private static final String[] ALLOWED_IMAGE_TYPES = {
            "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"
    };

    public String storeVideo(MultipartFile file) throws IOException {
        validateVideoFile(file);
        return storeFile(file, "videos");
    }

    public String storeThumbnail(MultipartFile file) throws IOException {
        validateImageFile(file);
        return storeFile(file, "thumbnails");
    }

    private String storeFile(MultipartFile file, String subDirectory) throws IOException {
        // Créer le répertoire s'il n'existe pas
        Path uploadPath = Paths.get(uploadDir, subDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Générer un nom de fichier unique
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String fileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(fileName);

        // Sauvegarder le fichier
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retourner l'URL relative du fichier
        return String.format("/%s/%s/%s", uploadDir, subDirectory, fileName);
    }

    private void validateVideoFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Le fichier vidéo est vide");
        }

        String contentType = file.getContentType();
        boolean isValidType = false;

        for (String allowedType : ALLOWED_VIDEO_TYPES) {
            if (allowedType.equals(contentType)) {
                isValidType = true;
                break;
            }
        }

        if (!isValidType) {
            throw new RuntimeException("Type de fichier vidéo non supporté: " + contentType);
        }

        // Vérifier la taille (max 500MB)
        if (file.getSize() > 500 * 1024 * 1024) {
            throw new RuntimeException("Fichier trop volumineux (max 500MB)");
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Le fichier image est vide");
        }

        String contentType = file.getContentType();
        boolean isValidType = false;

        for (String allowedType : ALLOWED_IMAGE_TYPES) {
            if (allowedType.equals(contentType)) {
                isValidType = true;
                break;
            }
        }

        if (!isValidType) {
            throw new RuntimeException("Type de fichier image non supporté: " + contentType);
        }

        // Vérifier la taille (max 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("Fichier trop volumineux (max 10MB)");
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf(".") == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    public boolean deleteFile(String fileUrl) {
        try {
            if (fileUrl == null || fileUrl.isEmpty()) {
                return false;
            }

            // Extraire le chemin du fichier de l'URL
            String filePath = fileUrl.replaceFirst("^/", "");
            Path path = Paths.get(filePath);

            return Files.deleteIfExists(path);
        } catch (IOException e) {
            System.err.println("Erreur lors de la suppression du fichier: " + e.getMessage());
            return false;
        }
    }

    public boolean deleteVideo(String videoUrl) {
        return deleteFile(videoUrl);
    }

    public boolean deleteThumbnail(String thumbnailUrl) {
        return deleteFile(thumbnailUrl);
    }

    // Méthode pour obtenir le chemin absolu d'un fichier
    public Path getFilePath(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return null;
        }
        String filePath = fileUrl.replaceFirst("^/", "");
        return Paths.get(filePath);
    }

    // Méthode pour vérifier si un fichier existe
    public boolean fileExists(String fileUrl) {
        try {
            Path filePath = getFilePath(fileUrl);
            return filePath != null && Files.exists(filePath);
        } catch (Exception e) {
            return false;
        }
    }

    // Méthode pour obtenir la taille d'un fichier
    public long getFileSize(String fileUrl) {
        try {
            Path filePath = getFilePath(fileUrl);
            if (filePath != null && Files.exists(filePath)) {
                return Files.size(filePath);
            }
            return 0;
        } catch (IOException e) {
            return 0;
        }
    }
}