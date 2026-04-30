package com.edushare_backend.edushare_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.edushare_backend.edushare_backend.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    boolean existsByName(String name);
    
    // Toutes les catégories triées par nom
    @Query("SELECT c FROM Category c ORDER BY c.name ASC")
    List<Category> findAllOrderByName();

    // Catégories avec nombre de vidéos
    @Query("SELECT c.name, COUNT(v) FROM Category c LEFT JOIN c.videos v GROUP BY c.id, c.name ORDER BY COUNT(v) DESC")
    List<Object[]> findCategoriesWithVideoCount();
}