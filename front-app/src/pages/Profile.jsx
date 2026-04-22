import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, addCredits } from '../services/personService';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiPlus } from 'react-icons/fi';

const Profile = () => {
  const { user, loginUser, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  // Crédits
  const [showCredits, setShowCredits] = useState(false);
  const [creditAmount, setCreditAmount] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [addingCredits, setAddingCredits] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!user?.id) return;
    if (isAdmin) {
      setProfile({ name: user.name, email: user.email, role: user.role });
      setEditData({ name: user.name || '', email: user.email || '', phone: '' });
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await getProfile(user.id);
        setProfile(data);
        setEditData({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
      } catch (e) {
        toast.error('Erreur chargement profil');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, isAdmin]);

  const fetchProfile = async () => {
    try {
      const data = await getProfile(user.id);
      setProfile(data);
      setEditData({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
    } catch (e) {
      toast.error('Erreur chargement profil');
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(user.id, editData);
      setProfile(updated);
      loginUser(updated, token);
      toast.success('Profil mis à jour !');
      setEditing(false);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCredits = async () => {
    if (creditAmount <= 0) { toast.error('Montant invalide'); return; }
    setAddingCredits(true);
    try {
      await addCredits(user.id, creditAmount, paymentMethod);
      toast.success(`${creditAmount} crédits ajoutés !`);
      fetchProfile();
      setShowCredits(false);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setAddingCredits(false);
    }
  };

  if (loading) return (
    <div style={styles.loading}><div style={styles.spinner} /></div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Mon Profil</h1>

        <div style={styles.layout}>
          {/* Profil card */}
          <div style={styles.profileCard}>
            {/* Avatar */}
            <div style={styles.avatarSection}>
              <div style={styles.avatar}>
                {profile?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h2 style={styles.name}>{profile?.name}</h2>
                <span style={{
                  ...styles.role,
                  background: isAdmin ? '#fef3c7' : '#e8f0fe',
                  color: isAdmin ? '#d97706' : '#1a56db',
                }}>
                  {isAdmin ? '🛡️ Administrateur' : profile?.contributor ? '🎥 Contributeur' : '📚 Étudiant'}
                </span>
              </div>
            </div>

            {/* Infos */}
            <div style={styles.infoSection}>
              {editing ? (
                <>
                  <div style={styles.field}>
                    <label style={styles.label}><FiUser size={13} /> Nom</label>
                    <input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}><FiMail size={13} /> Email</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}><FiPhone size={13} /> Téléphone</label>
                    <input
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.editActions}>
                    <button onClick={handleSave} style={styles.saveBtn} disabled={saving}>
                      <FiSave size={14} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button onClick={() => setEditing(false)} style={styles.cancelBtn}>
                      <FiX size={14} /> Annuler
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.infoRow}>
                    <FiMail size={14} style={styles.infoIcon} />
                    <div>
                      <p style={styles.infoLabel}>Email</p>
                      <p style={styles.infoValue}>{profile?.email}</p>
                    </div>
                  </div>
                  <div style={styles.infoRow}>
                    <FiPhone size={14} style={styles.infoIcon} />
                    <div>
                      <p style={styles.infoLabel}>Téléphone</p>
                      <p style={styles.infoValue}>{profile?.phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                  <div style={styles.infoRow}>
                    <FiUser size={14} style={styles.infoIcon} />
                    <div>
                      <p style={styles.infoLabel}>Membre depuis</p>
                      <p style={styles.infoValue}>
                        {profile?.dateCreation
                          ? new Date(profile.dateCreation).toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setEditing(true)} style={styles.editBtn}>
                    <FiEdit2 size={14} /> Modifier le profil
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Colonne droite */}
          <div style={styles.rightCol}>
            {/* Solde crédits — masqué pour l'admin */}
            {isAdmin && (
              <div style={styles.adminInfoCard}>
                <span style={styles.adminInfoIcon}>🛡️</span>
                <div>
                  <h3 style={styles.adminInfoTitle}>Espace Administrateur</h3>
                  <p style={styles.adminInfoText}>Gérez la plateforme depuis le <a href="/admin" style={{ color: '#d97706', fontWeight: 600 }}>Dashboard Admin</a></p>
                </div>
              </div>
            )}
            {!isAdmin && <div style={styles.creditsCard}>
              <div style={styles.creditsHeader}>
                <div>
                  <h3 style={styles.creditsTitle}>💳 Mes crédits</h3>
                  <p style={styles.creditsSubtitle}>Utilisez vos crédits pour acheter des vidéos</p>
                </div>
                <div style={styles.creditsAmount}>
                  <span style={styles.creditsNum}>{profile?.creditBalance || 0}</span>
                  <span style={styles.creditsUnit}>crédits</span>
                </div>
              </div>

              <button
                onClick={() => setShowCredits(!showCredits)}
                style={styles.addCreditsBtn}
              >
                <FiPlus size={14} /> Recharger mes crédits
              </button>

              {/* Formulaire recharge */}
              {showCredits && (
                <div style={styles.rechargeForm}>
                  <div style={styles.field}>
                    <label style={styles.label}>Montant (crédits)</label>
                    <div style={styles.amountButtons}>
                      {[10, 25, 50, 100].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setCreditAmount(amount)}
                          style={{
                            ...styles.amountBtn,
                            ...(creditAmount === amount ? styles.amountBtnActive : {}),
                          }}
                        >
                          {amount}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                      style={{ ...styles.input, marginTop: 8 }}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Méthode de paiement</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={styles.input}
                    >
                      <option value="CARD">💳 Carte bancaire</option>
                      <option value="PAYPAL">🅿️ PayPal</option>
                      <option value="VIREMENT">🏦 Virement</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAddCredits}
                    style={styles.confirmBtn}
                    disabled={addingCredits}
                  >
                    {addingCredits ? 'Traitement...' : `Ajouter ${creditAmount} crédits`}
                  </button>
                </div>
              )}
            </div>}

            {/* Statut compte */}
            <div style={styles.statusCard}>
              <h3 style={styles.statusTitle}>Statut du compte</h3>
              <div style={styles.statusRow}>
                <span style={styles.statusLabel}>Statut</span>
                <span style={{
                  ...styles.statusBadge,
                  background: profile?.blocked ? '#fee2e2' : '#d1fae5',
                  color: profile?.blocked ? '#ef4444' : '#059669',
                }}>
                  {profile?.blocked ? '🔒 Bloqué' : '✅ Actif'}
                </span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.statusLabel}>Type</span>
                <span style={{
                  ...styles.statusBadge,
                  background: isAdmin ? '#fef3c7' : '#e8f0fe',
                  color: isAdmin ? '#d97706' : '#1a56db',
                }}>
                  {isAdmin ? '🛡️ Administrateur' : profile?.contributor ? '🎥 Contributeur' : '📚 Étudiant'}
                </span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.statusLabel}>Rôle</span>
                <span style={{
                  ...styles.statusBadge,
                  background: isAdmin ? '#fef3c7' : '#f1f5f9',
                  color: isAdmin ? '#d97706' : '#334155',
                }}>
                  {profile?.role || user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { paddingTop: 100, paddingBottom: 60, minHeight: '100vh', background: '#f8fafc' },
  container: { maxWidth: 1000, margin: '0 auto', padding: '0 24px' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  spinner: {
    width: 40, height: 40, border: '3px solid #e2e8f0',
    borderTopColor: '#1a56db', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  pageTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 28,
  },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 },
  profileCard: {
    background: 'white', borderRadius: 20, padding: '28px',
    border: '1px solid #e2e8f0', height: 'fit-content',
  },
  avatarSection: {
    display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
    paddingBottom: 20, borderBottom: '1px solid #f1f5f9',
  },
  avatar: {
    width: 64, height: 64, borderRadius: 18,
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: 26, fontWeight: 700, flexShrink: 0,
  },
  name: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 18, fontWeight: 700, color: '#0f172a',
  },
  role: {
    display: 'inline-block', marginTop: 4,
    background: '#e8f0fe', color: '#1a56db',
    padding: '3px 10px', borderRadius: 100,
    fontSize: 12, fontWeight: 600,
  },
  infoSection: {},
  infoRow: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '12px 0', borderBottom: '1px solid #f1f5f9',
  },
  infoIcon: { color: '#94a3b8', marginTop: 4, flexShrink: 0 },
  infoLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: 500, color: '#0f172a' },
  editBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: '#e8f0fe', color: '#1a56db',
    border: 'none', padding: '10px 18px', borderRadius: 10,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    marginTop: 16,
  },
  field: { marginBottom: 14 },
  label: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 5,
  },
  input: {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 14, fontFamily: "'Outfit', sans-serif",
    color: '#0f172a', outline: 'none', boxSizing: 'border-box',
  },
  editActions: { display: 'flex', gap: 8, marginTop: 16 },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#1a56db', color: 'white',
    border: 'none', padding: '10px 18px', borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  cancelBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#f1f5f9', color: '#64748b',
    border: 'none', padding: '10px 18px', borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  adminInfoCard: {
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    borderRadius: 20, padding: '24px',
    display: 'flex', alignItems: 'center', gap: 16,
    border: '1px solid #fcd34d',
  },
  adminInfoIcon: { fontSize: 36 },
  adminInfoTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 700, color: '#92400e', marginBottom: 4,
  },
  adminInfoText: { fontSize: 13, color: '#78350f' },
  creditsCard: {
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    borderRadius: 20, padding: '24px',
  },
  creditsHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  creditsTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 700, color: 'white',
  },
  creditsSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  creditsAmount: { textAlign: 'right' },
  creditsNum: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 36, fontWeight: 800, color: 'white', display: 'block',
  },
  creditsUnit: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  addCreditsBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'white', color: '#1a56db',
    border: 'none', padding: '10px 18px', borderRadius: 10,
    fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%',
    justifyContent: 'center',
  },
  rechargeForm: {
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 12, padding: '16px', marginTop: 12,
  },
  amountButtons: { display: 'flex', gap: 6 },
  amountBtn: {
    flex: 1, padding: '7px',
    background: 'rgba(255,255,255,0.2)', color: 'white',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  amountBtnActive: {
    background: 'white', color: '#1a56db', border: '1px solid white',
  },
  confirmBtn: {
    width: '100%', padding: '11px',
    background: 'white', color: '#1a56db',
    border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  statusCard: {
    background: 'white', borderRadius: 16, padding: '20px',
    border: '1px solid #e2e8f0',
  },
  statusTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 16,
  },
  statusRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  statusLabel: { fontSize: 13, color: '#64748b' },
  statusBadge: {
    padding: '4px 12px', borderRadius: 100,
    fontSize: 12, fontWeight: 600,
  },
};

export default Profile;
