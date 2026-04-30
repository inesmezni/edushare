package com.edushare_backend.edushare_backend.service;

import com.edushare_backend.edushare_backend.entity.*;
import com.edushare_backend.edushare_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PersonRepository personRepository;
    private final VideoRepository videoRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public Payment addCredits(Long personId, double amount, String paymentMethod) {
        if (amount <= 0) {
            throw new RuntimeException("Le montant doit être positif");
        }

        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new RuntimeException("Personne non trouvée"));

        boolean paymentSuccess = processPayment(amount, paymentMethod);
        if (!paymentSuccess) {
            throw new RuntimeException("Échec du traitement du paiement");
        }

        // Mettre à jour le solde de crédits
        person.setCreditBalance(person.getCreditBalance() + amount);
        personRepository.save(person);

        Payment payment = Payment.builder()
                .person(person)
                .amount(amount)
                .type(Payment.PaymentType.CREDIT)
                .status(Payment.PaymentStatus.SUCCESS)
                .paymentMethod(paymentMethod)
                .transactionId(generateTransactionId())
                .date(LocalDateTime.now())
                .processedAt(LocalDateTime.now())
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment withdrawEarnings(Long personId, double amount, String withdrawalMethod) {
        if (amount <= 0) {
            throw new RuntimeException("Le montant doit être positif");
        }

        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new RuntimeException("Personne non trouvée"));

        // Vérifier le solde directement
        if (person.getCreditBalance() < amount) {
            throw new RuntimeException("Solde insuffisant pour effectuer ce retrait");
        }

        boolean withdrawalSuccess = processWithdrawal(amount, withdrawalMethod);
        if (!withdrawalSuccess) {
            throw new RuntimeException("Échec du traitement du retrait");
        }

        // Retirer les crédits
        person.setCreditBalance(person.getCreditBalance() - amount);
        personRepository.save(person);

        Payment withdrawal = Payment.builder()
                .person(person)
                .amount(amount)
                .type(Payment.PaymentType.WITHDRAWAL)
                .status(Payment.PaymentStatus.SUCCESS)
                .paymentMethod(withdrawalMethod)
                .transactionId(generateTransactionId())
                .date(LocalDateTime.now())
                .processedAt(LocalDateTime.now())
                .build();

        return paymentRepository.save(withdrawal);
    }

    @Transactional(readOnly = true)
    public List<Payment> getPersonPayments(Long personId) {
        return paymentRepository.findByPerson_IdOrderByDateDesc(personId);
    }

    @Transactional(readOnly = true)
    public List<Payment> getPersonCredits(Long personId) {
        return paymentRepository.findByPerson_IdAndTypeOrderByDateDesc(personId, Payment.PaymentType.CREDIT);
    }

    @Transactional(readOnly = true)
    public List<Payment> getPersonWithdrawals(Long personId) {
        return paymentRepository.findByPerson_IdAndTypeOrderByDateDesc(personId, Payment.PaymentType.WITHDRAWAL);
    }

    @Transactional(readOnly = true)
    public Payment getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé"));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPaymentStats(Long personId) {
        Double totalCredits = paymentRepository.getTotalCreditsByPerson(personId);
        Double totalWithdrawals = paymentRepository.getTotalWithdrawalsByPerson(personId);

        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new RuntimeException("Personne non trouvée"));

        return Map.of(
                "currentBalance", person.getCreditBalance(),
                "totalCreditsAdded", totalCredits != null ? totalCredits : 0.0,
                "totalWithdrawn", totalWithdrawals != null ? totalWithdrawals : 0.0,
                "netBalance", (totalCredits != null ? totalCredits : 0.0) - (totalWithdrawals != null ? totalWithdrawals : 0.0)
        );
    }

    private boolean processPayment(double amount, String paymentMethod) {
        try {
            Thread.sleep(1000);
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private boolean processWithdrawal(double amount, String withdrawalMethod) {
        try {
            Thread.sleep(1500);
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private String generateTransactionId() {
        return "PAY_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }

    @Transactional
    public Payment cancelPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé"));

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new RuntimeException("Seuls les paiements en attente peuvent être annulés");
        }

        payment.setStatus(Payment.PaymentStatus.CANCELLED);
        return paymentRepository.save(payment);
    }

    @Transactional
    public Transaction processVideoPurchase(Long buyerId, Long videoId) {
        Person buyer = personRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Acheteur non trouvé"));

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));

        if (buyer.getId().equals(video.getContributor().getId())) {
            throw new RuntimeException("Vous ne pouvez pas acheter votre propre vidéo");
        }

        // Vérifier si la vidéo est achetable
        if (video.getStatus() != Video.VideoStatus.ACTIVE || video.getPrice() <= 0) {
            throw new RuntimeException("Cette vidéo n'est pas disponible à l'achat");
        }

        if (buyer.getCreditBalance() < video.getPrice()) {
            throw new RuntimeException("Solde insuffisant. Veuillez recharger votre compte.");
        }

        if (transactionRepository.existsByBuyerIdAndVideoId(buyerId, videoId)) {
            throw new RuntimeException("Vous avez déjà acheté cette vidéo");
        }

        // Débiter l'acheteur
        buyer.setCreditBalance(buyer.getCreditBalance() - video.getPrice());
        personRepository.save(buyer);

        // Créditer le contributeur
        Person contributor = video.getContributor();
        contributor.setCreditBalance(contributor.getCreditBalance() + video.getPrice());
        personRepository.save(contributor);

        Transaction transaction = Transaction.builder()
                .buyer(buyer)
                .video(video)
                .amount(video.getPrice())
                .status(Transaction.TransactionStatus.COMPLETED)
                .paymentMethod("CREDITS")
                .transactionId(generateTransactionId())
                .completedAt(LocalDateTime.now())
                .build();

        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction processRefund(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction non trouvée"));

        // Vérifier si la transaction est remboursable (moins de 30 jours)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        if (transaction.getCompletedAt().isBefore(thirtyDaysAgo)) {
            throw new RuntimeException("Cette transaction n'est pas remboursable");
        }

        Person buyer = transaction.getBuyer();
        Person contributor = transaction.getVideo().getContributor();

        // Rembourser l'acheteur
        buyer.setCreditBalance(buyer.getCreditBalance() + transaction.getAmount());
        personRepository.save(buyer);

        // Débiter le contributeur
        contributor.setCreditBalance(contributor.getCreditBalance() - transaction.getAmount());
        personRepository.save(contributor);

        transaction.setStatus(Transaction.TransactionStatus.REFUNDED);
        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getUserTransactions(Long userId) {
        return transactionRepository.findByBuyerIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getContributorTransactions(Long contributorId) {
        return transactionRepository.findByVideoContributorIdOrderByCreatedAtDesc(contributorId);
    }

    @Transactional(readOnly = true)
    public Transaction getTransactionById(Long transactionId) {
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction non trouvée"));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserPurchaseStats(Long userId) {
        long totalPurchases = transactionRepository.countByBuyerId(userId);
        Double totalSpent = transactionRepository.getTotalSpentByBuyer(userId);

        return Map.of(
                "totalPurchases", totalPurchases,
                "totalSpent", totalSpent != null ? totalSpent : 0.0,
                "averagePurchaseValue", totalPurchases > 0 ? (totalSpent != null ? totalSpent / totalPurchases : 0.0) : 0.0
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getContributorEarningStats(Long contributorId) {
        long totalSales = transactionRepository.countByVideoContributorId(contributorId);
        Double totalEarned = transactionRepository.getTotalEarnedByContributor(contributorId);

        return Map.of(
                "totalSales", totalSales,
                "totalEarned", totalEarned != null ? totalEarned : 0.0,
                "averageSaleValue", totalSales > 0 ? (totalEarned != null ? totalEarned / totalSales : 0.0) : 0.0
        );
    }

    public boolean hasUserPurchasedVideo(Long userId, Long videoId) {
        return transactionRepository.existsByBuyerIdAndVideoId(userId, videoId);
    }

    public long getUserPurchaseCountForVideo(Long userId, Long videoId) {
        return transactionRepository.countCompletedPurchases(userId, videoId);
    }
}