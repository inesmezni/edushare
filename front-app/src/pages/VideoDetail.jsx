import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVideoById, likeVideo, watchVideo } from '../services/videoService';
import { buyVideo } from '../services/personService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiEye, FiHeart, FiClock, FiShoppingCart, FiPlay, FiArrowLeft } from 'react-icons/fi';
import CommentSection from '../components/CommentSection';
import api from '../services/api';

const VideoDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [canWatch, setCanWatch] = useState(false);
  const [buyError, setBuyError] = useState(null); // message d'erreur achat affiché sous le bouton

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      const data = await getVideoById(id);
      setVideo(data);
      await watchVideo(id);
      await checkAccess(data);
    } catch (error) {
      toast.error('Vidéo non trouvée');
      navigate('/videos');
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async (videoData) => {
    if (videoData.price === 0) { setCanWatch(true); return; }
    if (!isAuthenticated() || !user?.id) return;
    try {
      const ownerRes = await api.get(`/api/person/${user.id}/videos/${videoData.id}/is-owner`);
      if (ownerRes.data === true) { setCanWatch(true); return; }
    } catch (_) {}
    try {
      const purchasedRes = await api.get(`/api/person/${user.id}/videos/${videoData.id}/has-purchased`);
      if (purchasedRes.data === true) { setCanWatch(true); }
    } catch (_) {}
  };

  const handleBuy = async () => {
    if (!isAuthenticated()) {
      toast.info('Connectez-vous pour acheter cette vidéo');
      navigate('/login');
      return;
    }
    setBuying(true);
    setBuyError(null);
    try {
      await buyVideo(user.id, id);
      toast.success('Vidéo achetée avec succès !');
      setCanWatch(true);
      fetchVideo();
    } catch (error) {
      const msg = error.response?.data?.error || 'Erreur lors de l\'achat';
      if (msg.toLowerCase().includes('déjà acheté') || msg.toLowerCase().includes('deja achete')) {
        setCanWatch(true);
        setBuyError(null);
      } else {
        setBuyError(msg);
      }
    } finally {
      setBuying(false);
    }
  };

  const handleLike = async () => {
    try {
      const updated = await likeVideo(id);
      setVideo(prev => ({ ...prev, likes: updated.likes }));
    } catch (error) {
      toast.error('Erreur');
    }
  };

  if (loading) return (
    <div style={styles.loading}><div style={styles.spinner} /></div>
  );

  if (!video) return null;

  const isFree = video.price === 0;
  const isPending = video.status === 'PENDING';
  const watchable = canWatch && video.videoUrl;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <FiArrowLeft size={16} /> Retour
        </button>

        <div style={styles.layout}>
          {/* Colonne principale */}
          <div style={styles.main}>
            {/* Player */}
            <div style={styles.player}>
              {isPending ? (
                <div style={styles.playerOverlay}>
                  <div style={styles.lockIcon}>⏳</div>
                  <p style={styles.lockText}>Cette vidéo est en attente de validation</p>
                </div>
              ) : watchable ? (
                <video
                  controls
                  style={styles.videoEl}
                  poster={video.thumbnailUrl ? `http://localhost:8082${video.thumbnailUrl}` : undefined}
                >
                  <source src={`http://localhost:8082${video.videoUrl}`} />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              ) : (
                <>
                  {video.thumbnailUrl ? (
                    <img
                      src={`http://localhost:8082${video.thumbnailUrl}`}
                      alt={video.title}
                      style={styles.playerImg}
                    />
                  ) : (
                    <div style={styles.playerPlaceholder}>
                      <FiPlay size={60} color="rgba(255,255,255,0.5)" />
                    </div>
                  )}
                  {!isFree && (
                    <div style={styles.playerOverlay}>
                      <div style={styles.lockIcon}>🔒</div>
                      <p style={styles.lockText}>Achetez cette vidéo pour la visionner</p>
                      <button onClick={handleBuy} style={styles.buyOverlayBtn} disabled={buying}>
                        {buying ? 'Achat...' : `Acheter — ${video.price} crédits`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Infos vidéo */}
            <div style={styles.videoInfo}>
              {video.category && (
                <span style={styles.category}>{video.category.name}</span>
              )}
              <h1 style={styles.videoTitle}>{video.title}</h1>
              <p style={styles.videoDesc}>{video.description}</p>

              <div style={styles.videoStats}>
                <span style={styles.videoStat}>
                  <FiEye size={14} /> {video.views || 0} vues
                </span>
                <button onClick={handleLike} style={styles.likeBtn}>
                  <FiHeart size={14} /> {video.likes || 0}
                </button>
                {video.duration > 0 && (
                  <span style={styles.videoStat}>
                    <FiClock size={14} /> {Math.floor(video.duration / 60)} min
                  </span>
                )}
              </div>
            </div>

            {/* Section commentaires */}
            <CommentSection videoId={id} />
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.purchaseCard}>
              <div style={styles.priceSection}>
                {isFree ? (
                  <span style={styles.freeLabel}>Gratuit</span>
                ) : (
                  <>
                    <span style={styles.priceLabel}>Prix</span>
                    <span style={styles.price}>{video.price} crédits</span>
                  </>
                )}
              </div>

              {canWatch ? (
                <div style={styles.accessGranted}>
                   Vous avez accès à cette vidéo
                </div>
              ) : isFree ? (
                <button style={styles.watchBtn}>
                  <FiPlay size={16} /> Regarder maintenant
                </button>
              ) : (
                <button
                  onClick={handleBuy}
                  style={styles.buyBtn}
                  disabled={buying || isPending}
                >
                  <FiShoppingCart size={16} />
                  {buying ? 'Achat en cours...' : `Acheter — ${video.price} crédits`}
                </button>
              )}

              {!isAuthenticated() && !isFree && (
                <p style={styles.loginHint}>
                  <a href="/login" style={{ color: '#1a56db' }}>Connectez-vous</a> pour acheter
                </p>
              )}

              {buyError && (
                <div style={styles.buyErrorBox}>
                  <p style={styles.buyErrorText}>⚠️ {buyError}</p>
                  {buyError.toLowerCase().includes('solde') && (
                    <a href="/profile" style={styles.rechargeLink}>
                      Recharger mes crédits →
                    </a>
                  )}
                </div>
              )}
            </div>

            {video.contributor && (
              <div style={styles.contributorCard}>
                <h3 style={styles.contributorTitle}>Contributeur</h3>
                <div style={styles.contributorInfo}>
                  <div style={styles.contributorAvatar}>
                    {video.contributor.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p style={styles.contributorName}>{video.contributor.name}</p>
                    <p style={styles.contributorEmail}>{video.contributor.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { paddingTop: 100, paddingBottom: 60, minHeight: '100vh', background: '#f8fafc' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  spinner: {
    width: 40, height: 40, border: '3px solid #e2e8f0',
    borderTopColor: '#1a56db', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'white', border: '1px solid #e2e8f0',
    padding: '8px 16px', borderRadius: 10,
    fontSize: 14, fontWeight: 500, color: '#334155',
    cursor: 'pointer', marginBottom: 24,
  },
  layout: {
    display: 'grid', gridTemplateColumns: '1fr 340px',
    gap: 24,
  },
  main: { minWidth: 0 },
  player: {
    position: 'relative', aspectRatio: '16/9',
    background: '#0f172a', borderRadius: 16,
    overflow: 'hidden', marginBottom: 20,
  },
  videoEl: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
  playerImg: { width: '100%', height: '100%', objectFit: 'cover' },
  playerPlaceholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  playerOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  lockIcon: { fontSize: 40 },
  lockText: { color: 'white', fontSize: 15, fontWeight: 500 },
  buyOverlayBtn: {
    background: '#1a56db', color: 'white',
    border: 'none', padding: '12px 28px', borderRadius: 10,
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
  videoInfo: {},
  category: {
    display: 'inline-block',
    background: '#e8f0fe', color: '#1a56db',
    padding: '4px 12px', borderRadius: 100,
    fontSize: 12, fontWeight: 600, marginBottom: 10,
  },
  videoTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 26, fontWeight: 700, color: '#0f172a',
    lineHeight: 1.3, marginBottom: 12,
  },
  videoDesc: { fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 16 },
  videoStats: { display: 'flex', alignItems: 'center', gap: 16 },
  videoStat: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 14, color: '#94a3b8',
  },
  likeBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#fff0f3', color: '#e11d48',
    border: 'none', padding: '6px 12px', borderRadius: 8,
    fontSize: 14, cursor: 'pointer',
  },
  sidebar: { display: 'flex', flexDirection: 'column', gap: 16 },
  purchaseCard: {
    background: 'white', borderRadius: 16, padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 20px rgba(26,86,219,0.08)',
  },
  priceSection: { marginBottom: 20 },
  priceLabel: { display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 },
  price: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 32, fontWeight: 700, color: '#0f172a',
  },
  freeLabel: {
    display: 'inline-block', background: '#d1fae5', color: '#065f46',
    padding: '6px 16px', borderRadius: 100,
    fontSize: 16, fontWeight: 700,
  },
  accessGranted: {
    background: '#d1fae5', color: '#065f46',
    borderRadius: 10, padding: '12px 16px',
    fontSize: 14, fontWeight: 600, textAlign: 'center',
  },
  buyBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    color: 'white', border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: "'Outfit', sans-serif",
  },
  watchBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #059669, #10b981)',
    color: 'white', border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: "'Outfit', sans-serif",
  },
  loginHint: { textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 12 },
  buyErrorBox: {
    marginTop: 12, background: '#fef2f2',
    border: '1px solid #fecaca', borderRadius: 10,
    padding: '10px 14px',
  },
  buyErrorText: { fontSize: 13, color: '#dc2626', marginBottom: 6 },
  rechargeLink: {
    fontSize: 13, fontWeight: 600, color: '#1a56db',
    textDecoration: 'none', display: 'inline-block',
  },
  contributorCard: {
    background: 'white', borderRadius: 16, padding: '20px',
    border: '1px solid #e2e8f0',
  },
  contributorTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14, fontWeight: 600, color: '#64748b',
    marginBottom: 14,
  },
  contributorInfo: { display: 'flex', alignItems: 'center', gap: 12 },
  contributorAvatar: {
    width: 40, height: 40, borderRadius: 10,
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: 16, fontWeight: 700,
  },
  contributorName: { fontSize: 14, fontWeight: 600, color: '#0f172a' },
  contributorEmail: { fontSize: 12, color: '#64748b' },
};

export default VideoDetail;
