import React from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiHeart, FiClock } from 'react-icons/fi';

const VideoCard = ({ video }) => {
  const formatPrice = (price) => {
    if (price === 0) return <span style={styles.free}>Gratuit</span>;
    return <span style={styles.price}>{price} crédits</span>;
  };

  const formatViews = (views) => {
    if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
    return views;
  };

  return (
    <Link to={`/videos/${video.id}`} style={styles.card}>
      {/* Thumbnail */}
      <div style={styles.thumbnail}>
        {video.thumbnailUrl ? (
          <img
            src={`http://localhost:8082${video.thumbnailUrl}`}
            alt={video.title}
            style={styles.img}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={styles.placeholder}>
            <span style={styles.placeholderIcon}>🎥</span>
          </div>
        )}

        {/* Badge statut */}
        {video.status === 'PENDING' && (
          <div style={styles.statusBadge}>En attente</div>
        )}

        {/* Prix overlay */}
        <div style={styles.priceOverlay}>
          {formatPrice(video.price)}
        </div>
      </div>

      {/* Infos */}
      <div style={styles.info}>
        {/* Catégorie */}
        {video.category && (
          <span style={styles.category}>{video.category.name}</span>
        )}

        {/* Titre */}
        <h3 style={styles.title}>{video.title}</h3>

        {/* Description */}
        {video.description && (
          <p style={styles.description}>{video.description}</p>
        )}

        {/* Stats */}
        <div style={styles.stats}>
          <span style={styles.stat}>
            <FiEye size={13} /> {formatViews(video.views || 0)}
          </span>
          <span style={styles.stat}>
            <FiHeart size={13} /> {video.likes || 0}
          </span>
          {video.duration > 0 && (
            <span style={styles.stat}>
              <FiClock size={13} /> {Math.floor(video.duration / 60)}min
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

const styles = {
  card: {
    display: 'block',
    background: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    textDecoration: 'none',
    transition: 'all 0.25s',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 32px rgba(26,86,219,0.15)',
    },
  },
  thumbnail: {
    position: 'relative',
    aspectRatio: '16/9',
    background: 'linear-gradient(135deg, #e8f0fe, #dbeafe)',
    overflow: 'hidden',
  },
  img: {
    width: '100%', height: '100%', objectFit: 'cover',
  },
  placeholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #e8f0fe, #dbeafe)',
  },
  placeholderIcon: { fontSize: 40, opacity: 0.5 },
  statusBadge: {
    position: 'absolute', top: 10, left: 10,
    background: '#f59e0b', color: 'white',
    padding: '3px 10px', borderRadius: 100,
    fontSize: 11, fontWeight: 600,
  },
  priceOverlay: {
    position: 'absolute', bottom: 10, right: 10,
  },
  free: {
    background: '#d1fae5', color: '#065f46',
    padding: '4px 10px', borderRadius: 100,
    fontSize: 11, fontWeight: 700,
  },
  price: {
    background: '#1a56db', color: 'white',
    padding: '4px 10px', borderRadius: 100,
    fontSize: 11, fontWeight: 700,
  },
  info: { padding: '16px' },
  category: {
    display: 'inline-block',
    background: '#e8f0fe', color: '#1a56db',
    padding: '3px 10px', borderRadius: 100,
    fontSize: 11, fontWeight: 600,
    marginBottom: 8,
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15, fontWeight: 600,
    color: '#0f172a', lineHeight: 1.4,
    marginBottom: 6,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  description: {
    fontSize: 13, color: '#64748b',
    lineHeight: 1.5, marginBottom: 12,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  stats: {
    display: 'flex', gap: 12,
    alignItems: 'center',
  },
  stat: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 12, color: '#94a3b8', fontWeight: 500,
  },
};

export default VideoCard;
