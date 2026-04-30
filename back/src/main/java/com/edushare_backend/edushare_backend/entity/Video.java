package com.edushare_backend.edushare_backend.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "videos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private double price = 0.0;
    private String videoUrl;
    private String thumbnailUrl;
    private int views = 0;
    private int likes = 0;
    private int duration = 0; // en secondes

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    

    // Statut de la vidéo :
    // PENDING  = en attente de validation par l'admin
    // ACTIVE   = validée et visible par tous
    // INACTIVE = désactivée par le contributeur
    // REJECTED = rejetée par l'admin
    @Enumerated(EnumType.STRING)
    private VideoStatus status = VideoStatus.ACTIVE;
    
    // Relation avec le contributeur
    @ManyToOne
    @JoinColumn(name = "contributor_id", nullable = false)
    @JsonBackReference  
    private Person contributor;

    // Catégorie de la vidéo
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    // Commentaires sur la vidéo
    @OneToMany(mappedBy = "video", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  
    private List<Comment> comments = new ArrayList<>();

    // Transactions pour cette vidéo
    @OneToMany(mappedBy = "video", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  
    private List<Transaction> transactions = new ArrayList<>();

    public enum VideoStatus {
        ACTIVE, INACTIVE, PENDING, REJECTED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    
    public void incrementViews() {
        this.views++;
    }

   
    public void incrementLikes() {
        this.likes++;
    }

   
    public void decrementLikes() {
        if (this.likes > 0) {
            this.likes--;
        }
    }
     
    // Vérifier si la vidéo peut être achetée
    public boolean isPurchasable() {
        return this.price > 0 && this.status == VideoStatus.ACTIVE;
    }

    // Valider la vidéo — action de l'admin
    public void validate() {
        this.status = VideoStatus.ACTIVE;
    }

    // Rejeter la vidéo — action de l'admin
    public void reject() {
        this.status = VideoStatus.REJECTED;
    }
}