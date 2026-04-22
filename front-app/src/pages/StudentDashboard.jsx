import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, getBalance, getPurchasedVideos, getMyTransactions } from '../services/personService';
import VideoCard from '../components/VideoCard';
import { FiVideo, FiCreditCard, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(0);
  const [purchasedVideos, setPurchasedVideos] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [profRes, balRes, videosRes, transRes] = await Promise.allSettled([
        getProfile(user.id),
        getBalance(user.id),
        getPurchasedVideos(user.id),
        getMyTransactions(user.id),
      ]);
      if (profRes.status === 'fulfilled') setProfile(profRes.value);
      if (balRes.status === 'fulfilled') setBalance(balRes.value?.balance ?? 0);
      if (videosRes.status === 'fulfilled') setPurchasedVideos(Array.isArray(videosRes.value) ? videosRes.value : []);
      if (transRes.status === 'fulfilled') setTransactions(Array.isArray(transRes.value) ? transRes.value : []);
    } catch (error) {
      toast.error('Erreur chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={styles.loading}>
      <div style={styles.spinner} />
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 style={styles.title}>Bonjour, {user?.name?.split(' ')[0]} </h1>
              <p style={styles.subtitle}>
                {user?.contributor ? 'Contributeur' : 'Étudiant'} · {user?.email}
              </p>
            </div>
          </div>
          <Link to="/videos" style={styles.exploreBtn}>
            Explorer les vidéos
          </Link>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: '#e8f0fe' }}>
              <FiVideo size={20} color="#1a56db" />
            </div>
            <div>
              <h3 style={styles.statNum}>{purchasedVideos.length}</h3>
              <p style={styles.statLabel}>Vidéos achetées</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: '#d1fae5' }}>
              <FiCreditCard size={20} color="#059669" />
            </div>
            <div>
              <h3 style={styles.statNum}>{balance}</h3>
              <p style={styles.statLabel}>Crédits disponibles</p>
            </div>
          </div>
        </div>

        {/* Recharger crédits */}
        <div style={styles.creditCard}>
          <div>
            <h3 style={styles.creditTitle}>💳 Solde : {balance} crédits</h3>
            <p style={styles.creditSubtitle}>Rechargez pour accéder aux vidéos premium</p>
          </div>
          <Link to="/profile" style={styles.creditBtn}>
            <FiPlus size={14} /> Recharger
          </Link>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'videos' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('videos')}
          >
            Mes vidéos achetées ({purchasedVideos.length})
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'transactions' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('transactions')}
          >
            Mes transactions ({transactions.length})
          </button>
        </div>

        {/* Contenu tabs */}
        {activeTab === 'videos' && (
          purchasedVideos.length > 0 ? (
            <div style={styles.videosGrid}>
              {purchasedVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div style={styles.empty}>
              <FiVideo size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p>Vous n'avez pas encore acheté de vidéos</p>
              <Link to="/videos" style={styles.emptyBtn}>Explorer les vidéos</Link>
            </div>
          )
        )}

        {activeTab === 'transactions' && (
          transactions.length > 0 ? (
            <div style={styles.transactionsList}>
              {transactions.map((trans, i) => (
                <div key={i} style={styles.transactionItem}>
                  <div style={styles.transIcon}>💳</div>
                  <div style={styles.transInfo}>
                    <p style={styles.transTitle}>{trans.video?.title || 'Achat vidéo'}</p>
                    <p style={styles.transDate}>
                      {new Date(trans.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div style={styles.transAmount}>
                    -{trans.amount} crédits
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.empty}>
              <FiVideo size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p>Aucune transaction pour le moment</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { paddingTop: 100, paddingBottom: 60, minHeight: '100vh', background: '#f8fafc' },
  container: { maxWidth: 1280, margin: '0 auto', padding: '0 24px' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  spinner: {
    width: 40, height: 40, border: '3px solid #e2e8f0',
    borderTopColor: '#1a56db', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  avatar: {
    width: 56, height: 56, borderRadius: 16,
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: 22, fontWeight: 700,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24, fontWeight: 700, color: '#0f172a',
  },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 3 },
  exploreBtn: {
    background: '#1a56db', color: 'white',
    padding: '10px 20px', borderRadius: 10,
    fontSize: 14, fontWeight: 600, textDecoration: 'none',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16, marginBottom: 24,
  },
  statCard: {
    background: 'white', borderRadius: 16, padding: '20px',
    display: 'flex', alignItems: 'center', gap: 14,
    border: '1px solid #e2e8f0',
  },
  statIcon: {
    width: 48, height: 48, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  statNum: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24, fontWeight: 700, color: '#0f172a',
  },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 3 },
  creditCard: {
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    borderRadius: 16, padding: '20px 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 32, flexWrap: 'wrap', gap: 12,
  },
  creditTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 18, fontWeight: 700, color: 'white',
  },
  creditSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  creditBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'white', color: '#1a56db',
    padding: '10px 20px', borderRadius: 10,
    fontSize: 14, fontWeight: 700, textDecoration: 'none',
  },
  tabs: {
    display: 'flex', gap: 4, marginBottom: 24,
    background: 'white', padding: 4, borderRadius: 12,
    border: '1px solid #e2e8f0', width: 'fit-content',
  },
  tab: {
    padding: '8px 18px', border: 'none', background: 'transparent',
    borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: '#64748b', cursor: 'pointer', transition: 'all 0.2s',
  },
  tabActive: { background: '#1a56db', color: 'white' },
  videosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 20,
  },
  transactionsList: { display: 'flex', flexDirection: 'column', gap: 8 },
  transactionItem: {
    background: 'white', borderRadius: 12, padding: '16px',
    display: 'flex', alignItems: 'center', gap: 14,
    border: '1px solid #e2e8f0',
  },
  transIcon: { fontSize: 24 },
  transInfo: { flex: 1 },
  transTitle: { fontSize: 14, fontWeight: 500, color: '#0f172a' },
  transDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  transAmount: { fontSize: 14, fontWeight: 700, color: '#ef4444' },
  empty: {
    textAlign: 'center', padding: '60px 20px', color: '#94a3b8',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  emptyBtn: {
    marginTop: 16, padding: '10px 24px',
    background: '#1a56db', color: 'white',
    borderRadius: 10, fontSize: 14, fontWeight: 600,
    textDecoration: 'none',
  },
};

export default StudentDashboard;
