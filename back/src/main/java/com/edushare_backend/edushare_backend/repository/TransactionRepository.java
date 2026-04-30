package com.edushare_backend.edushare_backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.edushare_backend.edushare_backend.entity.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {


    List<Transaction> findByBuyerId(Long buyerId);
    List<Transaction> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    List<Transaction> findByBuyerIdAndStatus(
            Long buyerId, Transaction.TransactionStatus status);

    List<Transaction> findByVideoContributorId(Long contributorId);
    List<Transaction> findByVideoContributorIdOrderByCreatedAtDesc(Long contributorId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.buyer.id = :buyerId")
    Double getTotalSpentByBuyer(@Param("buyerId") Long buyerId);

    @Query("SELECT SUM(t.amount) FROM Transaction t " +
           "WHERE t.video.contributor.id = :contributorId")
    Double getTotalEarnedByContributor(@Param("contributorId") Long contributorId);

    long countByBuyerId(Long buyerId);
    long countByVideoContributorId(Long contributorId);

    
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'COMPLETED'")
    Double getTotalRevenue();

    
    @Query("SELECT SUM(t.amount) FROM Transaction t " +
           "WHERE t.createdAt BETWEEN :start AND :end")
    Double getRevenueBetweenDates(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

  
    @Query("SELECT FUNCTION('DATE', t.createdAt), SUM(t.amount) " +
           "FROM Transaction t WHERE t.createdAt BETWEEN :start AND :end " +
           "GROUP BY FUNCTION('DATE', t.createdAt)")
    List<Object[]> getDailyRevenue(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    List<Transaction> findByCreatedAtAfter(LocalDateTime date);
    List<Transaction> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByCreatedAtAfter(LocalDateTime date);


    List<Transaction> findByStatus(Transaction.TransactionStatus status);

    
    List<Transaction> findTop10ByOrderByCreatedAtDesc();

   
    boolean existsByBuyerIdAndVideoId(Long buyerId, Long videoId);

   
    @Query("SELECT COUNT(t) FROM Transaction t WHERE " +
           "t.buyer.id = :buyerId AND t.video.id = :videoId " +
           "AND t.status = 'COMPLETED'")
    long countCompletedPurchases(
            @Param("buyerId") Long buyerId,
            @Param("videoId") Long videoId);
}