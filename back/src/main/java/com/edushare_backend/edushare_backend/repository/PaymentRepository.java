package com.edushare_backend.edushare_backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.edushare_backend.edushare_backend.entity.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Paiements d'une personne triés par date
    List<Payment> findByPerson_IdOrderByDateDesc(Long personId);

    // Paiements par type (CREDIT ou WITHDRAWAL)
    List<Payment> findByPerson_IdAndTypeOrderByDateDesc(
            Long personId, Payment.PaymentType type);

    // Paiements par statut
    List<Payment> findByStatus(Payment.PaymentStatus status);

    // Paiements après une date
    List<Payment> findByDateAfter(LocalDateTime date);

    // Paiements par statut et personne
    List<Payment> findByPerson_IdAndStatusOrderByDateDesc(
            Long personId, Payment.PaymentStatus status);

    // Total des crédits ajoutés par une personne
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE " +
           "p.person.id = :personId AND p.type = 'CREDIT' " +
           "AND p.status = 'SUCCESS'")
    Double getTotalCreditsByPerson(@Param("personId") Long personId);

    // Total des retraits effectués par une personne
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE " +
           "p.person.id = :personId AND p.type = 'WITHDRAWAL' " +
           "AND p.status = 'SUCCESS'")
    Double getTotalWithdrawalsByPerson(@Param("personId") Long personId);

    // ===== STATISTIQUES ADMIN =====
    // Total des crédits entre deux dates
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE " +
           "p.type = 'CREDIT' AND p.status = 'SUCCESS' " +
           "AND p.date BETWEEN :start AND :end")
    Double getTotalCreditsBetweenDates(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Total des retraits entre deux dates
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE " +
           "p.type = 'WITHDRAWAL' AND p.status = 'SUCCESS' " +
           "AND p.date BETWEEN :start AND :end")
    Double getTotalWithdrawalsBetweenDates(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Tous les paiements d'une personne
    @Query("SELECT p FROM Payment p WHERE p.person.id = :personId " +
           "ORDER BY p.date DESC")
    List<Payment> findPaymentsByPersonId(@Param("personId") Long personId);
}