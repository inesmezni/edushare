package com.edushare_backend.edushare_backend.config;

import java.io.File;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class FileUploadConfig {

    
    private static final Logger log =
            LoggerFactory.getLogger(FileUploadConfig.class);

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    // Créer les dossiers au démarrage
    @PostConstruct
    public void init() {
        createUploadDirectories();
    }

    private void createUploadDirectories() {
        try {
            // Créer le dossier principal uploads/
            createDirectory(uploadDir);

            // Créer le sous-dossier uploads/videos/
            createDirectory(uploadDir + "/videos");

            // Créer le sous-dossier uploads/thumbnails/
            createDirectory(uploadDir + "/thumbnails");

        } catch (Exception e) {
            log.error("Erreur lors de la création des répertoires : {}",
                    e.getMessage());
        }
    }

    // Créer un dossier s'il n'existe pas
    private void createDirectory(String path) {
        File dir = new File(path);
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            if (created) {
                log.info("Répertoire créé : {}", dir.getAbsolutePath());
            }
        }
    }
}