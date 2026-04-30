package com.edushare_backend.edushare_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;
@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    @JsonBackReference
    private Person person;

    private double amount;

    @Enumerated(EnumType.STRING)
    private PaymentType type; // CREDIT ou WITHDRAWAL

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String paymentMethod; // CARD, BANK_TRANSFER, etc.
     
    private String transactionId;

    @Column(updatable = false)
    private LocalDateTime date = LocalDateTime.now();

    private LocalDateTime processedAt;

    // Méthodes utilitaires
    public boolean isCredit() {
        return this.type == PaymentType.CREDIT;
    }
    
    public boolean isWithdrawal() {
        return this.type == PaymentType.WITHDRAWAL;
    }

    public void markAsCompleted() {
        this.status = PaymentStatus.SUCCESS;
        this.processedAt = LocalDateTime.now();
    }

    public void markAsFailed() {
        this.status = PaymentStatus.FAILED;
    }

    public enum PaymentType {
        CREDIT,      // Ajout de crédits
        WITHDRAWAL   // Retrait d'argent
    }

    public enum PaymentStatus {
        PENDING,
        SUCCESS,
        FAILED,
        CANCELLED
    }
}