package com.edushare_backend.edushare_backend.service;

import com.edushare_backend.edushare_backend.entity.Category;
import com.edushare_backend.edushare_backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAllOrderByName();
    }

    public Category createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Cette catégorie existe déjà");
        }
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        if (!category.getName().equals(categoryDetails.getName()) &&
                categoryRepository.existsByName(categoryDetails.getName())) {
            throw new RuntimeException("Cette catégorie existe déjà");
        }

        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setColor(categoryDetails.getColor());
        category.setIcon(categoryDetails.getIcon());

        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        if (!category.getVideos().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer une catégorie contenant des vidéos");
        }

        categoryRepository.delete(category);
    }

    public Map<String, Object> getCategoryStats() {
        List<Object[]> results = categoryRepository.findCategoriesWithVideoCount();

        return Map.of(
                "categoriesWithCount", results.stream()
                        .map(obj -> Map.of(
                                "categoryName", obj[0],
                                "videoCount", obj[1]
                        ))
                        .collect(Collectors.toList())
        );
    }
}