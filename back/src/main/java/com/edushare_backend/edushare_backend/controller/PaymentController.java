package com.edushare_backend.edushare_backend.controller;

import com.edushare_backend.edushare_backend.service.PaymentService;
import com.edushare_backend.edushare_backend.service.PersonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PersonService personService;

    @PostMapping("/purchase/{buyerId}/{videoId}")
    public ResponseEntity<?> processPurchase(
            @PathVariable Long buyerId,
            @PathVariable Long videoId) {
        try {
            return ResponseEntity.ok(paymentService.processVideoPurchase(buyerId, videoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/refund/{transactionId}")
    public ResponseEntity<?> refund(@PathVariable Long transactionId) {
        try {
            return ResponseEntity.ok(paymentService.processRefund(transactionId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/add-credits/{personId}")
    public ResponseEntity<?> addCredits(
            @PathVariable Long personId,
            @RequestBody Map<String, Object> request) {
        try {
            double amount = Double.parseDouble(request.get("amount").toString());
            String paymentMethod = request.get("paymentMethod").toString();
            return ResponseEntity.ok(personService.addCredits(personId, amount, paymentMethod));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/withdraw/{personId}")
    public ResponseEntity<?> withdraw(
            @PathVariable Long personId,
            @RequestBody Map<String, Object> request) {
        try {
            double amount = Double.parseDouble(request.get("amount").toString());
            String withdrawalMethod = request.get("withdrawalMethod").toString();
            return ResponseEntity.ok(personService.withdrawEarnings(personId, amount, withdrawalMethod));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/transactions/user/{userId}")
    public ResponseEntity<?> getUserTransactions(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(paymentService.getUserTransactions(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/transactions/contributor/{contributorId}")
    public ResponseEntity<?> getContributorTransactions(@PathVariable Long contributorId) {
        try {
            return ResponseEntity.ok(paymentService.getContributorTransactions(contributorId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}