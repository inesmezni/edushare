import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiStar, FiSend, FiTrash2, FiEdit2 } from 'react-icons/fi';
import api from '../services/api';

const CommentSection = ({ videoId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [ratingStats, setRatingStats] = useState(null);

  useEffect(() => {
    fetchComments();
    fetchRatingStats();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/comments/video/${videoId}`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingStats = async () => {
    try {
      const res = await api.get(`/api/comments/video/${videoId}/rating`);
      setRatingStats(res.data);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { toast.error('Écrivez un commentaire'); return; }
    setSubmitting(true);
    try {
      await api.post(`/api/comments/video/${videoId}?authorId=${user.id}`, {
        content, rating: rating.toString()
      });
      toast.success('Commentaire ajouté !');
      setContent('');
      setRating(5);
      fetchComments();
      fetchRatingStats();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/api/comments/${commentId}?authorId=${user.id}`);
      toast.success('Commentaire supprimé');
      fetchComments();
    } catch (e) {
      toast.error('Erreur suppression');
    }
  };

  const renderStars = (count, interactive = false) => (
    <div style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          onClick={interactive ? () => setRating(star) : undefined}
          onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
          onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
          style={{
            ...styles.star,
            color: star <= (interactive ? (hoveredStar || rating) : count)
              ? '#f59e0b' : '#e2e8f0',
            cursor: interactive ? 'pointer' : 'default',
            background: 'none', border: 'none', padding: '2px',
          }}
        >
          <FiStar size={interactive ? 20 : 14}
            fill={star <= (interactive ? (hoveredStar || rating) : count) ? '#f59e0b' : 'none'}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div style={styles.section}>
      {/* Header stats */}
      {ratingStats && (
        <div style={styles.statsBar}>
          <div style={styles.avgRating}>
            <span style={styles.avgNum}>{ratingStats.averageRating || 0}</span>
            {renderStars(Math.round(ratingStats.averageRating || 0))}
          </div>
          <span style={styles.totalComments}>
            {ratingStats.totalComments || 0} commentaire(s)
          </span>
        </div>
      )}

      {/* Formulaire */}
      {isAuthenticated() && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formTitle}>Laisser un avis</h3>
          <div style={styles.ratingRow}>
            <span style={styles.ratingLabel}>Note :</span>
            {renderStars(rating, true)}
            <span style={styles.ratingValue}>{rating}/5</span>
          </div>
          <div style={styles.inputRow}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Votre commentaire..."
              style={styles.textarea}
              rows={3}
            />
            <button type="submit" style={styles.submitBtn} disabled={submitting}>
              <FiSend size={16} />
              {submitting ? '...' : 'Envoyer'}
            </button>
          </div>
        </form>
      )}

      {/* Liste commentaires */}
      <div style={styles.list}>
        {loading ? (
          <div style={styles.loading}><div style={styles.spinner} /></div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} style={styles.commentCard}>
              <div style={styles.commentHeader}>
                <div style={styles.commentAvatar}>
                  {comment.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={styles.commentMeta}>
                  <span style={styles.commentAuthor}>{comment.author?.name || 'Utilisateur'}</span>
                  <span style={styles.commentDate}>
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('fr-FR') : ''}
                  </span>
                </div>
                {renderStars(comment.rating || 0)}
                {/* Supprimer si auteur */}
                {user?.id === comment.author?.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    style={styles.deleteBtn}
                  >
                    <FiTrash2 size={13} />
                  </button>
                )}
              </div>
              <p style={styles.commentText}>{comment.content}</p>
            </div>
          ))
        ) : (
          <div style={styles.empty}>
            <FiStar size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>Aucun commentaire — soyez le premier !</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  section: { marginTop: 32 },
  statsBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'white', borderRadius: 14, padding: '16px 20px',
    border: '1px solid #e2e8f0', marginBottom: 20,
  },
  avgRating: { display: 'flex', alignItems: 'center', gap: 10 },
  avgNum: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 32, fontWeight: 700, color: '#0f172a',
  },
  stars: { display: 'flex', alignItems: 'center' },
  star: { lineHeight: 1 },
  totalComments: { fontSize: 13, color: '#64748b' },
  form: {
    background: 'white', borderRadius: 14, padding: '20px',
    border: '1px solid #e2e8f0', marginBottom: 20,
  },
  formTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 14,
  },
  ratingRow: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  ratingLabel: { fontSize: 13, color: '#64748b', fontWeight: 500 },
  ratingValue: { fontSize: 13, color: '#f59e0b', fontWeight: 600 },
  inputRow: { display: 'flex', gap: 10, alignItems: 'flex-end' },
  textarea: {
    flex: 1, padding: '10px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, fontFamily: "'Outfit', sans-serif",
    resize: 'vertical', outline: 'none', color: '#0f172a',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#1a56db', color: 'white',
    border: 'none', padding: '10px 16px', borderRadius: 10,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  loading: { display: 'flex', justifyContent: 'center', padding: '30px 0' },
  spinner: {
    width: 28, height: 28, border: '2px solid #e2e8f0',
    borderTopColor: '#1a56db', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  commentCard: {
    background: 'white', borderRadius: 12, padding: '16px',
    border: '1px solid #e2e8f0',
  },
  commentHeader: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
  },
  commentAvatar: {
    width: 32, height: 32, borderRadius: 8,
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0,
  },
  commentMeta: { flex: 1 },
  commentAuthor: { fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'block' },
  commentDate: { fontSize: 11, color: '#94a3b8' },
  deleteBtn: {
    background: '#fee2e2', border: 'none',
    width: 26, height: 26, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#ef4444', cursor: 'pointer',
  },
  commentText: { fontSize: 14, color: '#334155', lineHeight: 1.6 },
  empty: {
    textAlign: 'center', padding: '30px 20px',
    color: '#94a3b8', display: 'flex',
    flexDirection: 'column', alignItems: 'center',
    fontSize: 14,
  },
};

export default CommentSection;
