package com.edushare_backend.edushare_backend.config;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


// Il vérifie si le token JWT est valide avant d'autoriser l'accès
public class JwtAuthenticationFilter extends OncePerRequestFilter {

   
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    // Injection des dépendances via le constructeur
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        // Récupérer le header "Authorization" de la requête HTTP
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        // Étape 1 : Extraire le token JWT du header Authorization
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {

            // Enlever "Bearer " pour garder seulement le token
            jwt = authorizationHeader.substring(7);

            try {
                // Extraire le nom d'utilisateur (email) depuis le token
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                log.warn("JWT token invalide ou expiré : {}", e.getMessage());
            }
        }

        // Étape 2 : Valider le token et authentifier l'utilisateur
        // On vérifie aussi qu'il n'y a pas déjà une authentification active
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            try {
                // Charger les détails de l'utilisateur depuis la base de données
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                // Vérifier que le token est valide :
            
                if (jwtUtil.validateToken(jwt, userDetails)) {

                    // Créer l'objet d'authentification pour Spring Security
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,        
                                    null,              
                                    userDetails.getAuthorities() 
                            );

                
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // Enregistrer l'authentification dans le contexte Spring Security
                    // À partir d'ici, l'utilisateur est considéré comme connecté
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("Utilisateur authentifié avec succès : {}", username);
                }

            } catch (Exception e) {
                // Erreur lors du chargement de l'utilisateur ou de la validation
                log.error("Erreur d'authentification pour l'utilisateur {} : {}", username, e.getMessage());
            }
        }

        // Étape 3 : Passer la requête au filtre suivant dans la chaîne
        chain.doFilter(request, response);
    }
}