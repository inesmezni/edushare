import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecentVideos, getPopularVideos } from '../services/videoService';
import { getAllCategories } from '../services/categoryService';
import VideoCard from '../components/VideoCard';
import { FiArrowRight, FiPlay, FiBookOpen, FiUsers, FiStar } from 'react-icons/fi';

const Home = () => {
  const [recentVideos, setRecentVideos] = useState([]);
  const [popularVideos, setPopularVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recent, popular, cats] = await Promise.all([
          getRecentVideos(8),
          getPopularVideos(4),
          getAllCategories(),
        ]);
        setRecentVideos(Array.isArray(recent) ? recent : []);
        setPopularVideos(Array.isArray(popular) ? popular : []);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (error) {
        console.error('Erreur chargement données:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={styles.page}>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <FiStar size={12} /> Plateforme éducative
          </div>
          <h1 style={styles.heroTitle}>
            Apprenez et Partagez<br />
            <span style={styles.heroAccent}>vos Connaissances</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Découvrez des milliers de cours vidéo créés par des étudiants passionnés.
            Achetez, vendez et partagez le savoir.
          </p>
          <div style={styles.heroActions}>
            <Link to="/videos" style={styles.heroBtnPrimary}>
              Explorer les vidéos <FiArrowRight size={16} />
            </Link>
            <Link to="/register" style={styles.heroBtnSecondary}>
              Commencer gratuitement
            </Link>
          </div>

          {/* Stats */}
          <div style={styles.heroStats}>
            <div style={styles.heroStat}>
              <span style={styles.heroStatNum}>500+</span>
              <span style={styles.heroStatLabel}>Vidéos</span>
            </div>
            <div style={styles.heroDivider} />
            <div style={styles.heroStat}>
              <span style={styles.heroStatNum}>1k+</span>
              <span style={styles.heroStatLabel}>Étudiants</span>
            </div>
            <div style={styles.heroDivider} />
            <div style={styles.heroStat}>
              <span style={styles.heroStatNum}>100+</span>
              <span style={styles.heroStatLabel}>Contributeurs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catégories */}
      {categories.length > 0 && (
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Catégories</h2>
            </div>
            <div style={styles.categoriesGrid}>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/videos?category=${cat.name}`}
                  style={{ ...styles.categoryCard, borderColor: cat.color || '#1a56db' }}
                >
                  <span style={styles.catIcon}>{cat.icon || '📁'}</span>
                  <span style={styles.catName}>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vidéos populaires */}
      {popularVideos.length > 0 && (
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>🔥 Vidéos populaires</h2>
              <Link to="/videos" style={styles.seeAll}>
                Voir tout <FiArrowRight size={14} />
              </Link>
            </div>
            <div style={styles.videosGrid}>
              {popularVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vidéos récentes */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>✨ Nouvelles vidéos</h2>
            <Link to="/videos" style={styles.seeAll}>
              Voir tout <FiArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner} />
            </div>
          ) : recentVideos.length > 0 ? (
            <div style={styles.videosGrid}>
              {recentVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div style={styles.empty}>
              <FiPlay size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p>Aucune vidéo disponible pour le moment</p>
              <Link to="/register" style={styles.emptyBtn}>
                Devenir contributeur
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <div style={styles.container}>
          <div style={styles.ctaCard}>
            <FiBookOpen size={40} style={{ color: 'white', opacity: 0.8 }} />
            <h2 style={styles.ctaTitle}>Prêt à partager vos connaissances ?</h2>
            <p style={styles.ctaSubtitle}>
              Créez votre compte et commencez à publier vos cours vidéo dès aujourd'hui
            </p>
            <Link to="/register" style={styles.ctaBtn}>
              Commencer maintenant <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  page: { paddingTop: 68 },
  hero: {
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(135deg, #f0f5ff 0%, #e8f0fe 60%, #f0f9ff 100%)',
    padding: '80px 24px',
  },
  heroBg: {
    position: 'absolute', top: -100, right: -100,
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,86,219,0.1) 0%, transparent 70%)',
  },
  heroContent: {
    maxWidth: 700, margin: '0 auto', textAlign: 'center',
    position: 'relative', zIndex: 1,
  },
  heroBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'white', border: '1px solid #e2e8f0',
    padding: '6px 16px', borderRadius: 100,
    fontSize: 12, fontWeight: 600, color: '#1a56db',
    marginBottom: 20,
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 52, fontWeight: 700, color: '#0f172a',
    lineHeight: 1.15, marginBottom: 16,
  },
  heroAccent: {
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: { fontSize: 17, color: '#64748b', lineHeight: 1.6, marginBottom: 32 },
  heroActions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  heroBtnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    color: 'white', padding: '14px 28px', borderRadius: 12,
    fontSize: 15, fontWeight: 600, textDecoration: 'none',
    transition: 'all 0.2s',
  },
  heroBtnSecondary: {
    display: 'inline-flex', alignItems: 'center',
    background: 'white', color: '#1a56db',
    border: '2px solid #1a56db',
    padding: '12px 28px', borderRadius: 12,
    fontSize: 15, fontWeight: 600, textDecoration: 'none',
  },
  heroStats: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: 24, marginTop: 48,
    background: 'white', borderRadius: 16,
    padding: '20px 32px', display: 'inline-flex',
    boxShadow: '0 4px 20px rgba(26,86,219,0.08)',
    border: '1px solid #e2e8f0',
  },
  heroStat: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  heroStatNum: { fontSize: 24, fontWeight: 700, color: '#1a56db' },
  heroStatLabel: { fontSize: 12, color: '#64748b' },
  heroDivider: { width: 1, height: 32, background: '#e2e8f0' },
  section: { padding: '60px 0' },
  container: { maxWidth: 1280, margin: '0 auto', padding: '0 24px' },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 26, fontWeight: 700, color: '#0f172a',
  },
  seeAll: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    color: '#1a56db', fontSize: 14, fontWeight: 600,
    textDecoration: 'none',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 12,
  },
  categoryCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 8, padding: '20px 12px',
    background: 'white', borderRadius: 14,
    border: '2px solid transparent',
    textDecoration: 'none', transition: 'all 0.2s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  catIcon: { fontSize: 28 },
  catName: { fontSize: 13, fontWeight: 600, color: '#334155', textAlign: 'center' },
  videosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 20,
  },
  loading: { display: 'flex', justifyContent: 'center', padding: '60px 0' },
  spinner: {
    width: 36, height: 36,
    border: '3px solid #e2e8f0',
    borderTopColor: '#1a56db',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  empty: {
    textAlign: 'center', padding: '60px 20px',
    color: '#94a3b8', display: 'flex',
    flexDirection: 'column', alignItems: 'center',
  },
  emptyBtn: {
    marginTop: 16, padding: '10px 24px',
    background: '#1a56db', color: 'white',
    borderRadius: 10, fontSize: 14, fontWeight: 600,
    textDecoration: 'none',
  },
  cta: { padding: '60px 24px', background: '#f8fafc' },
  ctaCard: {
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    borderRadius: 24, padding: '60px 40px',
    textAlign: 'center', maxWidth: 700, margin: '0 auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
  },
  ctaTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 32, color: 'white', fontWeight: 700,
  },
  ctaSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 400 },
  ctaBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'white', color: '#1a56db',
    padding: '13px 28px', borderRadius: 12,
    fontSize: 15, fontWeight: 700, textDecoration: 'none',
    transition: 'all 0.2s',
  },
};

export default Home;
