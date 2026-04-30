package com.edushare_backend.edushare_backend.service;

import java.util.Collections;
import java.util.Optional;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.edushare_backend.edushare_backend.entity.Admin;
import com.edushare_backend.edushare_backend.entity.Person;
import com.edushare_backend.edushare_backend.entity.Utilisateurs;
import com.edushare_backend.edushare_backend.repository.AdminRepository;
import com.edushare_backend.edushare_backend.repository.PersonRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final PersonRepository personRepository;
    private final AdminRepository adminRepository;

    public CustomUserDetailsService(PersonRepository personRepository,
                                    AdminRepository adminRepository) {
        this.personRepository = personRepository;
        this.adminRepository = adminRepository;
    }

    // Charger un utilisateur par son email — utilisé par Spring Security
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        // Chercher l'utilisateur dans la base de données
        Utilisateurs utilisateur = findUserByEmail(email);

        // Vérifier si le compte est bloqué et déterminer le rôle Spring Security
        String role;
        if (utilisateur instanceof Person) {
            Person person = (Person) utilisateur;
            if (person.isBlocked()) {
                throw new UsernameNotFoundException("Compte bloqué : " + email);
            }
            // Un contributeur reçoit ROLE_CONTRIBUTOR, un étudiant reçoit ROLE_PERSON
            role = person.isContributor() ? "ROLE_CONTRIBUTOR" : "ROLE_PERSON";
        } else {
            role = "ROLE_" + utilisateur.getRole().name();
        }

        // Retourner les détails de l'utilisateur pour Spring Security
        return User.builder()
                .username(utilisateur.getEmail())
                .password(utilisateur.getPassword())
                .authorities(Collections.singletonList(
                        new SimpleGrantedAuthority(role)))
                .build();
    }

    // Chercher l'utilisateur dans Person puis Admin
    private Utilisateurs findUserByEmail(String email) {

        // Chercher d'abord dans la table Person
        Optional<Person> person = personRepository.findByEmail(email);
        if (person.isPresent()) {
            return person.get();
        }

        // Chercher ensuite dans la table Admin
        Optional<Admin> admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            return admin.get();
        }

        throw new UsernameNotFoundException("Utilisateur non trouvé : " + email);
    }
}