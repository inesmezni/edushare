package com.edushare_backend.edushare_backend.controller;

import com.edushare_backend.edushare_backend.service.AdminService;
import com.edushare_backend.edushare_backend.service.PersonService;
import com.edushare_backend.edushare_backend.service.CategoryService;
import com.edushare_backend.edushare_backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final AdminService adminService;
    private final PersonService personService;
    private final CategoryService categoryService;
    private final PaymentService paymentService;

    @GetMapping("/admin/overview")
    public ResponseEntity<?> getAdminOverview() {
        try {
            Map<String, Object> adminStats = adminService.getAdminStats();
            Map<String, Object> categoryStats = categoryService.getCategoryStats();

            Map<String, Object> overview = new HashMap<>();
            overview.put("platformStats", adminStats);
            overview.put("categoryStats", categoryStats);
            overview.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            return ResponseEntity.ok(overview);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/daily")
    public ResponseEntity<?> getAdminDailyStats() {
        try {
            Map<String, Object> dailyStats = adminService.getDailyStats();
            return ResponseEntity.ok(dailyStats);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}/overview")
    public ResponseEntity<?> getUserOverview(@PathVariable Long userId) {
        try {
            Map<String, Object> salesStats = personService.getSalesStats(userId);
            Map<String, Object> purchaseStats = paymentService.getUserPurchaseStats(userId);
            Map<String, Object> paymentStats = paymentService.getPaymentStats(userId);

            Map<String, Object> overview = new HashMap<>();
            overview.put("salesStats", salesStats);
            overview.put("purchaseStats", purchaseStats);
            overview.put("paymentStats", paymentStats);
            overview.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            return ResponseEntity.ok(overview);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}/earnings")
    public ResponseEntity<?> getUserEarnings(@PathVariable Long userId) {
        try {
            Map<String, Object> salesStats = personService.getSalesStats(userId);
            Map<String, Object> paymentStats = paymentService.getPaymentStats(userId);

            Map<String, Object> earnings = new HashMap<>();
            earnings.put("totalRevenue", salesStats.get("totalRevenue"));
            earnings.put("availableBalance", paymentStats.get("currentBalance"));
            earnings.put("totalWithdrawn", paymentStats.get("totalWithdrawn"));
            earnings.put("totalSales", salesStats.get("totalSales"));

            return ResponseEntity.ok(earnings);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}