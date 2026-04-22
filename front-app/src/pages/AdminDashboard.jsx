import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAdminStats, getDailyStats, getAllUsers, getPendingVideos,
  validateVideo, rejectVideo, blockUser, unblockUser, deleteUser, validateUser
} from '../services/adminService';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { toast } from 'react-toastify';
import {
  FiUsers, FiVideo, FiDollarSign, FiClock, FiCheck, FiX,
  FiLock, FiUnlock, FiTrash2, FiUserCheck, FiTag, FiPlus, FiEdit2
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [dailyStats, setDailyStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingVideos, setPendingVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Catégories form state
  const [catForm, setCatForm] = useState({ name: '', description: '', color: '#3B82F6' });
  const [editingCat, setEditingCat] = useState(null);
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, dailyRes, usersRes, pendingRes, catsRes] = await Promise.allSettled([
        getAdminStats(),
        getDailyStats(),
        getAllUsers(),
        getPendingVideos(),
        getAllCategories(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (dailyRes.status === 'fulfilled') setDailyStats(dailyRes.value);
      if (usersRes.status === 'fulfilled') setUsers(Array.isArray(usersRes.value) ? usersRes.value : []);
      if (pendingRes.status === 'fulfilled') setPendingVideos(Array.isArray(pendingRes.value) ? pendingRes.value : []);
      if (catsRes.status === 'fulfilled') setCategories(Array.isArray(catsRes.value) ? catsRes.value : []);
    } catch (error) {
      toast.error('Erreur chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateVideo = async (videoId) => {
    try {
      await validateVideo(videoId);
      toast.success('Vidéo validée !');
      setPendingVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (error) {
      toast.error('Erreur validation');
    }
  };

  const handleRejectVideo = async (videoId) => {
    try {
      await rejectVideo(videoId);
      toast.success('Vidéo rejetée');
      setPendingVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (error) {
      toast.error('Erreur rejet');
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      if (isBlocked) {
        await unblockUser(userId);
        toast.success('Compte débloqué');
      } else {
        await blockUser(userId);
        toast.success('Compte bloqué');
      }
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleValidateUser = async (userId) => {
    try {
      await validateUser(userId);
      toast.success('Compte validé');
      fetchData();
    } catch (error) {
      toast.error('Erreur validation compte');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Supprimer cet utilisateur définitivement ?')) return;
    try {
      await deleteUser(userId);
      toast.success('Utilisateur supprimé');
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      toast.error('Erreur suppression');
    }
  };

  // ---- Catégories ----
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) { toast.error('Nom requis'); return; }
    setCatLoading(true);
    try {
      if (editingCat) {
        const updated = await updateCategory(editingCat.id, catForm);
        setCategories(prev => prev.map(c => c.id === editingCat.id ? updated : c));
        toast.success('Catégorie modifiée');
        setEditingCat(null);
      } else {
        const created = await createCategory(catForm);
        setCategories(prev => [...prev, created]);
        toast.success('Catégorie créée');
      }
      setCatForm({ name: '', description: '', color: '#3B82F6' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur catégorie');
    } finally {
      setCatLoading(false);
    }
  };

  const handleEditCat = (cat) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, description: cat.description || '', color: cat.color || '#3B82F6' });
  };

  const handleDeleteCat = async (catId) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    try {
      await deleteCategory(catId);
      setCategories(prev => prev.filter(c => c.id !== catId));
      toast.success('Catégorie supprimée');
    } catch (e) {
      toast.error('Erreur suppression catégorie');
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
          <div>
            <h1 style={styles.title}>Dashboard Admin</h1>
            <p style={styles.subtitle}>Bienvenue {user?.name} — Gestion de la plateforme</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#e8f0fe' }}>
                <FiUsers size={20} color="#1a56db" />
              </div>
              <div>
                <h3 style={styles.statNum}>{stats.totalUsers || 0}</h3>
                <p style={styles.statLabel}>Utilisateurs</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#d1fae5' }}>
                <FiVideo size={20} color="#059669" />
              </div>
              <div>
                <h3 style={styles.statNum}>{stats.totalVideos || 0}</h3>
                <p style={styles.statLabel}>Vidéos</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#fef3c7' }}>
                <FiClock size={20} color="#d97706" />
              </div>
              <div>
                <h3 style={styles.statNum}>{stats.pendingVideos || 0}</h3>
                <p style={styles.statLabel}>En attente</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#f0fdf4' }}>
                <FiDollarSign size={20} color="#16a34a" />
              </div>
              <div>
                <h3 style={styles.statNum}>{(stats.totalRevenue || 0).toFixed(0)}</h3>
                <p style={styles.statLabel}>Revenus (crédits)</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          {['overview', 'users', 'videos', 'categories'].map((tab) => (
            <button
              key={tab}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && '📊 Vue d\'ensemble'}
              {tab === 'users' && `👥 Utilisateurs (${users.length})`}
              {tab === 'videos' && `🎥 En attente (${pendingVideos.length})`}
              {tab === 'categories' && `🏷️ Catégories (${categories.length})`}
            </button>
          ))}
        </div>

        {/* Vue d'ensemble */}
        {activeTab === 'overview' && stats && (
          <div style={styles.overviewGrid}>
            <div style={styles.overviewCard}>
              <h3 style={styles.overviewTitle}>Utilisateurs</h3>
              <div style={styles.overviewStats}>
                <div style={styles.overviewStat}>
                  <span style={styles.overviewNum}>{stats.totalContributors || 0}</span>
                  <span style={styles.overviewLabel}>Contributeurs</span>
                </div>
                <div style={styles.overviewStat}>
                  <span style={styles.overviewNum}>{stats.totalStudents || 0}</span>
                  <span style={styles.overviewLabel}>Étudiants</span>
                </div>
                <div style={styles.overviewStat}>
                  <span style={{ ...styles.overviewNum, color: '#ef4444' }}>{stats.blockedUsers || 0}</span>
                  <span style={styles.overviewLabel}>Bloqués</span>
                </div>
              </div>
            </div>
            <div style={styles.overviewCard}>
              <h3 style={styles.overviewTitle}>Transactions</h3>
              <div style={styles.overviewStats}>
                <div style={styles.overviewStat}>
                  <span style={styles.overviewNum}>{stats.totalTransactions || 0}</span>
                  <span style={styles.overviewLabel}>Total</span>
                </div>
                <div style={styles.overviewStat}>
                  <span style={{ ...styles.overviewNum, color: '#16a34a' }}>
                    {(stats.platformEarnings || 0).toFixed(0)}
                  </span>
                  <span style={styles.overviewLabel}>Commission (10%)</span>
                </div>
              </div>
            </div>
            {dailyStats && (
              <div style={{ ...styles.overviewCard, gridColumn: '1 / -1' }}>
                <h3 style={styles.overviewTitle}>Aujourd'hui</h3>
                <div style={styles.overviewStats}>
                  <div style={styles.overviewStat}>
                    <span style={{ ...styles.overviewNum, color: '#1a56db' }}>{dailyStats.newUsersToday || 0}</span>
                    <span style={styles.overviewLabel}>Nouveaux utilisateurs</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={{ ...styles.overviewNum, color: '#7c3aed' }}>{dailyStats.newVideosToday || 0}</span>
                    <span style={styles.overviewLabel}>Nouvelles vidéos</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={{ ...styles.overviewNum, color: '#059669' }}>{dailyStats.salesToday || 0}</span>
                    <span style={styles.overviewLabel}>Ventes aujourd'hui</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={{ ...styles.overviewNum, color: '#d97706' }}>
                      {(dailyStats.revenueToday || 0).toFixed(0)}
                    </span>
                    <span style={styles.overviewLabel}>Revenus aujourd'hui</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Utilisateurs */}
        {activeTab === 'users' && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Utilisateur</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.userAvatar}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span style={styles.userName}>{u.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: u.contributor ? '#e8f0fe' : '#f1f5f9',
                        color: u.contributor ? '#1a56db' : '#64748b',
                      }}>
                        {u.contributor ? 'Contributeur' : 'Étudiant'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: u.blocked ? '#fee2e2' : '#d1fae5',
                        color: u.blocked ? '#ef4444' : '#059669',
                      }}>
                        {u.blocked ? 'Bloqué' : 'Actif'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => handleValidateUser(u.id)}
                          style={{ ...styles.actionBtn, color: '#1a56db' }}
                          title="Valider le compte"
                        >
                          <FiUserCheck size={15} />
                        </button>
                        <button
                          onClick={() => handleBlockUser(u.id, u.blocked)}
                          style={{ ...styles.actionBtn, color: u.blocked ? '#059669' : '#f59e0b' }}
                          title={u.blocked ? 'Débloquer' : 'Bloquer'}
                        >
                          {u.blocked ? <FiUnlock size={15} /> : <FiLock size={15} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          style={{ ...styles.actionBtn, color: '#ef4444' }}
                          title="Supprimer"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Vidéos en attente */}
        {activeTab === 'videos' && (
          pendingVideos.length > 0 ? (
            <div style={styles.pendingList}>
              {pendingVideos.map((video) => (
                <div key={video.id} style={styles.pendingCard}>
                  <div style={styles.pendingThumb}>
                    {video.thumbnailUrl ? (
                      <img
                        src={`http://localhost:8082${video.thumbnailUrl}`}
                        alt={video.title}
                        style={styles.pendingImg}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <span style={{ fontSize: 32 }}>🎥</span>
                    )}
                  </div>
                  <div style={styles.pendingInfo}>
                    <h3 style={styles.pendingTitle}>{video.title}</h3>
                    <p style={styles.pendingDesc}>{video.description}</p>
                    <div style={styles.pendingMeta}>
                      <span style={styles.pendingCategory}>{video.category?.name}</span>
                      <span style={styles.pendingPrice}>{video.price === 0 ? 'Gratuit' : `${video.price} crédits`}</span>
                      {video.contributor && (
                        <span style={styles.pendingContributor}>par {video.contributor.name}</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.pendingActions}>
                    <button onClick={() => handleValidateVideo(video.id)} style={styles.validateBtn}>
                      <FiCheck size={16} /> Valider
                    </button>
                    <button onClick={() => handleRejectVideo(video.id)} style={styles.rejectBtn}>
                      <FiX size={16} /> Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.empty}>
              <FiCheck size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p>Aucune vidéo en attente de validation</p>
            </div>
          )
        )}

        {/* Catégories */}
        {activeTab === 'categories' && (
          <div style={styles.categoriesLayout}>
            {/* Formulaire */}
            <div style={styles.catFormCard}>
              <h3 style={styles.catFormTitle}>
                {editingCat ? <><FiEdit2 size={16} /> Modifier la catégorie</> : <><FiPlus size={16} /> Nouvelle catégorie</>}
              </h3>
              <form onSubmit={handleCatSubmit} style={styles.catForm}>
                <div style={styles.catField}>
                  <label style={styles.catLabel}>Nom *</label>
                  <input
                    type="text"
                    value={catForm.name}
                    onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Nom de la catégorie"
                    style={styles.catInput}
                    required
                  />
                </div>
                <div style={styles.catField}>
                  <label style={styles.catLabel}>Description</label>
                  <input
                    type="text"
                    value={catForm.description}
                    onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Description (optionnel)"
                    style={styles.catInput}
                  />
                </div>
                <div style={styles.catField}>
                  <label style={styles.catLabel}>Couleur</label>
                  <div style={styles.colorRow}>
                    <input
                      type="color"
                      value={catForm.color}
                      onChange={e => setCatForm(p => ({ ...p, color: e.target.value }))}
                      style={styles.colorPicker}
                    />
                    <span style={styles.colorHex}>{catForm.color}</span>
                  </div>
                </div>
                <div style={styles.catBtns}>
                  <button type="submit" style={styles.catSubmitBtn} disabled={catLoading}>
                    {catLoading ? '...' : editingCat ? 'Enregistrer' : 'Créer'}
                  </button>
                  {editingCat && (
                    <button
                      type="button"
                      style={styles.catCancelBtn}
                      onClick={() => { setEditingCat(null); setCatForm({ name: '', description: '', color: '#3B82F6' }); }}
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Liste */}
            <div style={styles.catList}>
              {categories.length === 0 ? (
                <div style={styles.empty}>
                  <FiTag size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p>Aucune catégorie</p>
                </div>
              ) : (
                categories.map(cat => (
                  <div key={cat.id} style={styles.catCard}>
                    <div style={{ ...styles.catDot, background: cat.color || '#3B82F6' }} />
                    <div style={styles.catInfo}>
                      <span style={styles.catName}>{cat.name}</span>
                      {cat.description && <span style={styles.catDesc}>{cat.description}</span>}
                      <span style={styles.catVideos}>{cat.videos?.length || 0} vidéo(s)</span>
                    </div>
                    <div style={styles.catActions}>
                      <button onClick={() => handleEditCat(cat)} style={{ ...styles.actionBtn, color: '#1a56db' }} title="Modifier">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDeleteCat(cat.id)} style={{ ...styles.actionBtn, color: '#ef4444' }} title="Supprimer">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
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
  header: { marginBottom: 32 },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28, fontWeight: 700, color: '#0f172a',
  },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16, marginBottom: 32,
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
  overviewGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  overviewCard: {
    background: 'white', borderRadius: 16, padding: '24px',
    border: '1px solid #e2e8f0',
  },
  overviewTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 20,
  },
  overviewStats: { display: 'flex', gap: 24, flexWrap: 'wrap' },
  overviewStat: { display: 'flex', flexDirection: 'column', gap: 4 },
  overviewNum: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 28, fontWeight: 700, color: '#0f172a',
  },
  overviewLabel: { fontSize: 12, color: '#64748b' },
  tableWrapper: {
    background: 'white', borderRadius: 16,
    border: '1px solid #e2e8f0', overflow: 'auto',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { background: '#f8fafc' },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: 12, fontWeight: 600, color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 16px', fontSize: 14, color: '#334155' },
  userCell: { display: 'flex', alignItems: 'center', gap: 10 },
  userAvatar: {
    width: 32, height: 32, borderRadius: 8,
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: 13, fontWeight: 700,
  },
  userName: { fontWeight: 500 },
  badge: {
    padding: '4px 10px', borderRadius: 100,
    fontSize: 12, fontWeight: 600,
  },
  actions: { display: 'flex', gap: 6 },
  actionBtn: {
    width: 30, height: 30, borderRadius: 8,
    background: '#f1f5f9', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },
  pendingList: { display: 'flex', flexDirection: 'column', gap: 12 },
  pendingCard: {
    background: 'white', borderRadius: 16, padding: '16px',
    display: 'flex', alignItems: 'center', gap: 16,
    border: '1px solid #e2e8f0',
  },
  pendingThumb: {
    width: 100, height: 64, borderRadius: 8,
    background: '#e8f0fe', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  pendingImg: { width: '100%', height: '100%', objectFit: 'cover' },
  pendingInfo: { flex: 1 },
  pendingTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15, fontWeight: 600, color: '#0f172a',
  },
  pendingDesc: { fontSize: 13, color: '#64748b', marginTop: 4 },
  pendingMeta: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  pendingCategory: {
    background: '#e8f0fe', color: '#1a56db',
    padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600,
  },
  pendingPrice: {
    background: '#f1f5f9', color: '#334155',
    padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600,
  },
  pendingContributor: {
    background: '#fef3c7', color: '#d97706',
    padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600,
  },
  pendingActions: { display: 'flex', flexDirection: 'column', gap: 8 },
  validateBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#d1fae5', color: '#059669',
    border: 'none', padding: '8px 14px', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  rejectBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#fee2e2', color: '#ef4444',
    border: 'none', padding: '8px 14px', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  empty: {
    textAlign: 'center', padding: '60px 20px', color: '#94a3b8',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  // Catégories
  categoriesLayout: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' },
  catFormCard: {
    background: 'white', borderRadius: 16, padding: '24px',
    border: '1px solid #e2e8f0',
  },
  catFormTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, color: '#0f172a',
    marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
  },
  catForm: { display: 'flex', flexDirection: 'column', gap: 14 },
  catField: { display: 'flex', flexDirection: 'column', gap: 6 },
  catLabel: { fontSize: 12, fontWeight: 600, color: '#64748b' },
  catInput: {
    padding: '9px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: 9, fontSize: 14, outline: 'none',
    fontFamily: "'Outfit', sans-serif",
  },
  colorRow: { display: 'flex', alignItems: 'center', gap: 10 },
  colorPicker: { width: 40, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 2 },
  colorHex: { fontSize: 13, color: '#64748b', fontFamily: 'monospace' },
  catBtns: { display: 'flex', gap: 8 },
  catSubmitBtn: {
    flex: 1, padding: '10px',
    background: '#1a56db', color: 'white',
    border: 'none', borderRadius: 9,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  catCancelBtn: {
    padding: '10px 16px',
    background: '#f1f5f9', color: '#64748b',
    border: 'none', borderRadius: 9,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  catList: { display: 'flex', flexDirection: 'column', gap: 8 },
  catCard: {
    background: 'white', borderRadius: 12, padding: '14px 16px',
    display: 'flex', alignItems: 'center', gap: 12,
    border: '1px solid #e2e8f0',
  },
  catDot: { width: 14, height: 14, borderRadius: '50%', flexShrink: 0 },
  catInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  catName: { fontSize: 14, fontWeight: 600, color: '#0f172a' },
  catDesc: { fontSize: 12, color: '#64748b' },
  catVideos: { fontSize: 11, color: '#94a3b8' },
  catActions: { display: 'flex', gap: 6 },
};

export default AdminDashboard;
