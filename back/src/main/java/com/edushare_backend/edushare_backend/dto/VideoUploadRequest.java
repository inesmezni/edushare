package com.edushare_backend.edushare_backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class VideoUploadRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 100, message = "Le titre doit contenir entre 3 et 100 caractères")
    private String title;

    @NotBlank(message = "La description est obligatoire")
    @Size(min = 10, max = 1000, message = "La description doit contenir entre 10 et 1000 caractères")
    private String description;

    @NotNull(message = "Le prix est obligatoire")
    @DecimalMin(value = "0.0", inclusive = true, message = "Le prix ne peut pas être négatif")
    @DecimalMax(value = "9999.99", message = "Le prix ne peut pas dépasser 9999.99")
    private Double price;

    @NotBlank(message = "La catégorie est obligatoire")
    private String category;

    @NotNull(message = "Le fichier vidéo est obligatoire")
    private MultipartFile videoFile;

    @NotNull(message = "La miniature est obligatoire")
    private MultipartFile thumbnail;
}