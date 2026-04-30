package com.edushare_backend.edushare_backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.edushare_backend.edushare_backend.entity.Category;
import com.edushare_backend.edushare_backend.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

  
    private static final Logger log =
            LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {

        // Créer les catégories par défaut seulement si la table est vide
        if (categoryRepository.count() == 0) {

            categoryRepository.save(Category.builder()
                    .name("Développement")
                    .description("Cours de programmation et développement")
                    .color("#3B82F6")
                    .icon("💻")
                    .build());

            categoryRepository.save(Category.builder()
                    .name("Design")
                    .description("Cours de design graphique et UX/UI")
                    .color("#EF4444")
                    .icon("🎨")
                    .build());

            categoryRepository.save(Category.builder()
                    .name("Business")
                    .description("Cours de business et entrepreneuriat")
                    .color("#10B981")
                    .icon("💼")
                    .build());

            categoryRepository.save(Category.builder()
                    .name("Marketing")
                    .description("Cours de marketing digital")
                    .color("#F59E0B")
                    .icon("📈")
                    .build());

            log.info("Catégories par défaut créées avec succès");
        }
    }
}