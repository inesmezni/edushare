package com.edushare_backend.edushare_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.edushare_backend.edushare_backend.entity.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByVideoIdOrderByCreatedAtDesc(Long videoId);
    List<Comment> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
     

    // Note moyenne d'une vidéo
    @Query("SELECT AVG(c.rating) FROM Comment c WHERE c.video.id = :videoId")
    Double getAverageRatingByVideoId(@Param("videoId") Long videoId);
    
    // Nombre de commentaires d'une vidéo
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.video.id = :videoId")
    Long countByVideoId(@Param("videoId") Long videoId);

    boolean existsByAuthorIdAndVideoId(Long authorId, Long videoId);
}