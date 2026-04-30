package com.edushare_backend.edushare_backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.edushare_backend.edushare_backend.entity.Comment;
import com.edushare_backend.edushare_backend.entity.Person;
import com.edushare_backend.edushare_backend.entity.Transaction;
import com.edushare_backend.edushare_backend.entity.Video;
import com.edushare_backend.edushare_backend.repository.CommentRepository;
import com.edushare_backend.edushare_backend.repository.PersonRepository;
import com.edushare_backend.edushare_backend.repository.VideoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final PersonRepository personRepository;
    private final VideoRepository videoRepository;

    // Ajouter un commentaire — étudiant ou contributeur
    public Comment addComment(Long videoId, Long authorId,
                               String content, Integer rating) {

        Person author = personRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));

        // Vérifier si l'auteur est le propriétaire de la vidéo
        boolean isVideoOwner = video.getContributor().getId().equals(authorId);

    
        boolean isFreeVideo = video.getPrice() == 0;

        boolean hasPurchased = video.getTransactions().stream()
                .anyMatch(t -> t.getBuyer().getId().equals(authorId) &&
                        t.getStatus() == Transaction.TransactionStatus.COMPLETED);

        // Seul le propriétaire, un acheteur ou pour une vidéo gratuite peut commenter
        if (!isVideoOwner && !isFreeVideo && !hasPurchased) {
            throw new RuntimeException(
                "Vous devez acheter la vidéo pour pouvoir la commenter");
        }

        // Vérifier la note — doit être entre 1 et 5
        int finalRating = (rating != null) ? rating : 1;
        if (finalRating < 1 || finalRating > 5) {
            throw new RuntimeException("La note doit être entre 1 et 5");
        }

        Comment comment = Comment.builder()
                .content(content)
                .author(author)
                .video(video)
                .rating(finalRating)
                .build();

        return commentRepository.save(comment);
    }

    // Récupérer les commentaires d'une vidéo
    public List<Comment> getVideoComments(Long videoId) {
        return commentRepository.findByVideoIdOrderByCreatedAtDesc(videoId);
    }

    // Modifier un commentaire — seulement l'auteur
    public Comment updateComment(Long commentId, Long authorId,
                                  String content, Integer rating) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commentaire non trouvé"));

        // Vérifier que c'est bien l'auteur
        if (!comment.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException(
                "Vous ne pouvez modifier que vos propres commentaires");
        }

        if (content != null) comment.setContent(content);
        if (rating != null) {
            if (rating < 1 || rating > 5) {
                throw new RuntimeException("La note doit être entre 1 et 5");
            }
            comment.setRating(rating);
        }

        return commentRepository.save(comment);
    }

    // Supprimer un commentaire — auteur, admin ou propriétaire de la vidéo
    public void deleteComment(Long commentId, Long authorId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commentaire non trouvé"));

        Person person = personRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        boolean isAuthor = comment.getAuthor().getId().equals(authorId);
        boolean isAdmin = person.getRole().name().equals("ADMIN");
        boolean isVideoOwner = comment.getVideo().getContributor().getId().equals(authorId);

        if (!isAuthor && !isAdmin && !isVideoOwner) {
            throw new RuntimeException(
                "Vous n'êtes pas autorisé à supprimer ce commentaire");
        }

        commentRepository.delete(comment);
    }

    // Stats de notation d'une vidéo
    public Map<String, Object> getVideoRatingStats(Long videoId) {
        Double averageRating = commentRepository.getAverageRatingByVideoId(videoId);
        Long totalComments = commentRepository.countByVideoId(videoId);

        return Map.of(
                "averageRating", averageRating != null ?
                        Math.round(averageRating * 10.0) / 10.0 : 0,
                "totalComments", totalComments,
                "videoId", videoId
        );
    }
}