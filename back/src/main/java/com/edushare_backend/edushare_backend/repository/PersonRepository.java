package com.edushare_backend.edushare_backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.edushare_backend.edushare_backend.entity.Person;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {

  
    Optional<Person> findByEmail(String email);

    
    boolean existsByEmail(String email);

    List<Person> findAllByOrderByDateCreationDesc();

    List<Person> findByNameContainingIgnoreCase(String name);


    List<Person> findByIsBlocked(boolean isBlocked);

    long countByIsBlocked(boolean isBlocked);

  
    List<Person> findByIsContributor(boolean isContributor);

    @Query("SELECT p FROM Person p WHERE p.isContributor = true " +
           "ORDER BY SIZE(p.uploadedVideos) DESC")
    List<Person> findTop5Contributors();

    @Query("SELECT COUNT(p) FROM Person p WHERE p.isContributor = true")
    long countContributors();

   
    @Query("SELECT COUNT(p) FROM Person p WHERE p.isContributor = false")
    long countStudents();
e
    long countByDateCreationAfter(LocalDateTime date);
}