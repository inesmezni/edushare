package com.edushare_backend.edushare_backend.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.edushare_backend.edushare_backend.service.CustomUserDetailsService;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // ===== ENDPOINTS PUBLICS =====

                        // Inscription et connexion
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/person/login").permitAll()
                        .requestMatchers("/api/person/register").permitAll()
                        .requestMatchers("/api/admin/login").permitAll()
                        .requestMatchers("/api/admin/register").permitAll()

                        // Catégories — public
                        .requestMatchers("/api/categories/**").permitAll()

                        // Vidéos — lecture publique
                        .requestMatchers(HttpMethod.GET, "/api/videos").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/videos/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/videos/search/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/videos/popular").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/videos/recent").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/videos/free").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/videos/category/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/videos/public/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/videos/trending").permitAll()

                        // Recherche publique
                        .requestMatchers(HttpMethod.GET, "/api/person/search/title").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/person/search/category").permitAll()

                        // Fichiers statiques
                        .requestMatchers("/uploads/**").permitAll()

                        
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()

                        // Health check
                        .requestMatchers("/actuator/health").permitAll()

                        // ===== VIDÉOS — PUBLICATION =====
                        // Seulement CONTRIBUTOR et ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/videos/upload/**")
                                .hasAnyRole("CONTRIBUTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/videos/**")
                                .hasAnyRole("CONTRIBUTOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/videos/**")
                                .hasAnyRole("CONTRIBUTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/videos/**")
                                .hasAnyRole("CONTRIBUTOR", "ADMIN")

                        // ADMINISTRATION
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                      
                        .requestMatchers("/api/person/**")
                                .hasAnyRole("PERSON", "CONTRIBUTOR")

                       
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter(),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil, userDetailsService);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:8080",
                "http://localhost:8082"
        ));
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "Accept", "X-Requested-With"
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}