import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyVideos, getSalesStats, getBalance, getMyTransactions } from '../services/personService';
import { deleteVideo } from '../services/videoService';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiVideo, FiDollarSign, FiEye, FiShoppingBag, FiPlus, FiEdit, FiTrash2, FiClock } from 'react-icons/fi';

const ContributorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myVideos, setMyVideos] = useState([]);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, videosRes, balRes, transRes] = await Promise.allSettled([
        getSalesStats(user.id),
        getMyVideos(user.id),
        getBalance(user.id),
        getMyTransactions(user.id),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (videosRes.status === 'fulfilled') setMyVideos(Array.isArray(videosRes.value) ? videosRes.value : []);
      if (balRes.status === 'fulfilled') setBalance(balRes.value?.balance ?? 0);
      if (transRes.status === 'fulfilled') setTransactions(Array.isArray(transRes.value) ? transRes.value : []);
    } catch (error) {
      toast.error('Erreur chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Supprimer cette vidéo ?')) return;
    try {
      await deleteVideo(videoId, user.id);
      toast.success('Vidéo supprimée');
      setMyVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (error) {
      toast.error('Erreur suppression');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: { bg: '#d1fae5', color: '#059669', label: 'Active' },
      PENDING: { bg: '#fef3c7', color: '#d97706', label: 'En attente' },
      REJECTED: { bg: '#fee2e2', color: '#ef4444', label: 'Rejetée' },
    };
    const b = badges[status] || badges.PENDING;
    return (
      <span style={{ background: b.bg, color: b.color, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>
        {b.label}
      </span>
    );
  };

  // Données graphique
  const chartData = myVideos.slice(0, 6).map(v => ({
    name: v.title?.substring(0, 12) + '...',
    vues: v.views || 0,
    likes: v.likes || 0,
  }));

  if (loading) return (
    <div style={styles.loading}><div style={styles.spinner} /></div>
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
              <h1 style={styles.title}>Mon Dashboard 🎥</h1>
              <p style={styles.subtitle}>Contributeur · {user?.email}</p>
            </div>
          </div>
          <Link to="/upload" style={styles.uploadBtn}>
            <FiPlus size={16} /> Publier une vidéo
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#e8f0fe' }}>
                <FiVideo size={20} color="#1a56db" />
              </div>
              <div>
                <h3 style={styles.statNum}>{stats.totalVideos || 0}</h3>
                <p style={styles.statLabel}>Mes vidéos</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#d1fae5' }}>
                <FiDollarSign size={20} color="#059669" />
              </div>
              <div>
                <h3 style={styles.statNum}>{balance}</h3>
                <p style={styles.statLabel}>Crédits gagnés</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#fef3c7' }}>
                <FiEye size={20} color="#d97706" />
              </div>
              <div>
                <h3 style={styles.statNum}>{stats.totalViews || 0}</h3>
                <p style={styles.statLabel}>Total vues</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#f0fdf4' }}>
                <FiShoppingBag size={20} color="#16a34a" />
              </div>
              <div>
                <h3 style={styles.statNum}>{stats.totalSales || 0}</h3>
                <p style={styles.statLabel}>Ventes</p>
              </div>
            </div>
          </div>
        )}

        {/* Retrait */}
        <div style={styles.withdrawCard}>
          <div>
            <h3 style={styles.withdrawTitle}>💰 Solde disponible : {balance} crédits</h3>
            <p style={styles.withdrawSubtitle}>Retirez vos gains à tout moment</p>
          </div>
          <Link to="/profile" style={styles.withdrawBtn}>
            Retirer mes gains
          </Link>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['overview', 'videos', 'transactions'].map(tab => (
            <button
              key={tab}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && '📊 Statistiques'}
              {tab === 'videos' && `🎥 Mes vidéos (${myVideos.length})`}
              {tab === 'transactions' && `💳 Transactions (${transactions.length})`}
            </button>
          ))}
        </div>

        {/* Statistiques */}
        {activeTab === 'overview' && (
          <div style={styles.chartSection}>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Vues et likes par vidéo</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip />
                    <Bar dataKey="vues" fill="#1a56db" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="likes" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={styles.empty}>
                  <p>Pas encore de données</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mes vidéos */}
        {activeTab === 'videos' && (
          myVideos.length > 0 ? (
            <div style={styles.videosTable}>
              {myVideos.map((video) => (
                <div key={video.id} style={styles.videoRow}>
                  {/* Thumbnail */}
                  <div style={styles.videoThumb}>
                    {video.thumbnailUrl ? (
                      <img
                        src={`http://localhost:8082${video.thumbnailUrl}`}
                        alt={video.title}
                        style={styles.thumbImg}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <span style={{ fontSize: 24 }}>🎥</span>
                    )}
                  </div>

                  {/* Infos */}
                  <div style={styles.videoInfo}>
                    <h3 style={styles.videoTitle}>{video.title}</h3>
                    <div style={styles.videoMeta}>
                      <span style={styles.metaItem}><FiEye size={12} /> {video.views || 0}</span>
                      <span style={styles.metaItem}>{video.price === 0 ? 'Gratuit' : `${video.price} crédits`}</span>
                      {getStatusBadge(video.status)}
                    </div>
                  </div>

                  {/* Status icon */}
                  {video.status === 'PENDING' && (
                    <div style={styles.pendingIcon} title="En attente de validation">
                      <FiClock size={16} color="#d97706" />
                    </div>
                  )}

                  {/* Actions */}
                  <div style={styles.videoActions}>
                    <Link to={`/edit-video/${video.id}`} style={styles.editBtn}>
                      <FiEdit size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(video.id)}
                      style={styles.deleteBtn}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.empty}>
              <FiVideo size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p>Vous n'avez pas encore publié de vidéos</p>
              <Link to="/upload" style={styles.emptyBtn}>
                <FiPlus size={14} /> Publier ma première vidéo
              </Link>
            </div>
          )
        )}

        {/* Transactions */}
        {activeTab === 'transactions' && (
          transactions.length > 0 ? (
            <div style={styles.transactionsList}>
              {transactions.map((trans, i) => (
                <div key={i} style={styles.transactionItem}>
                  <div style={styles.transIcon}>💰</div>
                  <div style={styles.transInfo}>
                    <p style={styles.transTitle}>{trans.video?.title || 'Vente vidéo'}</p>
                    <p style={styles.transDate}>
                      {new Date(trans.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div style={{ ...styles.transAmount, color: '#059669' }}>
                    +{trans.amount} crédits
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.empty}>
              <FiShoppingBag size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p>Aucune vente pour le moment</p>
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
  uploadBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    color: 'white', padding: '11px 22px', borderRadius: 12,
    fontSize: 14, fontWeight: 600, textDecoration: 'none',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16, marginBottom: 24,
  },
  statCard: {
    background: 'white', borderRadius: 16, padding: '20px',
    display: 'flex', alignItems: 'center', gap: 14,
    border: '1px solid #e2e8f0',
  },
  statIcon: {
    width: 48, height: 48, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statNum: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24, fontWeight: 700, color: '#0f172a',
  },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 3 },
  withdrawCard: {
    background: 'linear-gradient(135deg, #059669, #10b981)',
    borderRadius: 16, padding: '20px 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 32, flexWrap: 'wrap', gap: 12,
  },
  withdrawTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 18, fontWeight: 700, color: 'white',
  },
  withdrawSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  withdrawBtn: {
    background: 'white', color: '#059669',
    padding: '10px 20px', borderRadius: 10,
    fontSize: 14, fontWeight: 700, textDecoration: 'none',
  },
  tabs: {
    display: 'flex', gap: 4, marginBottom: 24,
    background: 'white', padding: 4, borderRadius: 12,
    border: '1px solid #e2e8f0', flexWrap: 'wrap',
  },
  tab: {
    padding: '8px 18px', border: 'none', background: 'transparent',
    borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: '#64748b', cursor: 'pointer', transition: 'all 0.2s',
  },
  tabActive: { background: '#1a56db', color: 'white' },
  chartSection: {},
  chartCard: {
    background: 'white', borderRadius: 16, padding: '24px',
    border: '1px solid #e2e8f0',
  },
  chartTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 20,
  },
  videosTable: { display: 'flex', flexDirection: 'column', gap: 8 },
  videoRow: {
    background: 'white', borderRadius: 14, padding: '14px 16px',
    display: 'flex', alignItems: 'center', gap: 14,
    border: '1px solid #e2e8f0',
  },
  videoThumb: {
    width: 80, height: 52, borderRadius: 8,
    background: '#e8f0fe', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  videoInfo: { flex: 1, minWidth: 0 },
  videoTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14, fontWeight: 600, color: '#0f172a',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  videoMeta: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 },
  metaItem: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 12, color: '#64748b',
  },
  pendingIcon: { flexShrink: 0 },
  videoActions: { display: 'flex', gap: 6, flexShrink: 0 },
  editBtn: {
    width: 30, height: 30, borderRadius: 8,
    background: '#e8f0fe', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    color: '#1a56db', textDecoration: 'none',
  },
  deleteBtn: {
    width: 30, height: 30, borderRadius: 8,
    background: '#fee2e2', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#ef4444', cursor: 'pointer',
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
  transAmount: { fontSize: 14, fontWeight: 700 },
  empty: {
    textAlign: 'center', padding: '60px 20px', color: '#94a3b8',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  emptyBtn: {
    marginTop: 16, padding: '10px 24px',
    background: '#1a56db', color: 'white',
    borderRadius: 10, fontSize: 14, fontWeight: 600,
    textDecoration: 'none', display: 'inline-flex',
    alignItems: 'center', gap: 6,
  },
};

export default ContributorDashboard;
