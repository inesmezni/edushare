package com.edushare_backend.edushare_backend.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("PERSON")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Person extends Utilisateurs {
    


    // Solde de crédits pour acheter des vidéos
    private double creditBalance = 0.0;

    private String phone;

    private boolean isContributor = false;
     
    // false = compte actif
    // true  = compte bloqué par l'admin
    private boolean isBlocked = false;
    
    // Vidéos uploadées par cette personne (en tant que contributeur)
    @OneToMany(mappedBy = "contributor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  
    private List<Video> uploadedVideos = new ArrayList<>();

    // Transactions où cette personne est l'acheteur
    @OneToMany(mappedBy = "buyer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  
    private List<Transaction> purchases = new ArrayList<>();

    // Paiements effectués par cette personne
    @OneToMany(mappedBy = "person", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  
    private List<Payment> payments = new ArrayList<>();
}