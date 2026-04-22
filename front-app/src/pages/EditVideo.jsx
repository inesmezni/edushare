import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVideoById, updateVideo } from '../services/videoService';
import { getAllCategories } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

const EditVideo = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: 0,
    categoryId: '',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [videoData, catsData] = await Promise.all([
        getVideoById(id),
        getAllCategories(),
      ]);
      setCategories(Array.isArray(catsData) ? catsData : []);
      setForm({
        title: videoData.title || '',
        description: videoData.description || '',
        price: videoData.price ?? 0,
        categoryId: videoData.category?.id || '',
      });
    } catch (error) {
      toast.error('Vidéo introuvable');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Le titre est requis'); return; }
    setSaving(true);
    try {
      await updateVideo(id, user.id, {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price) || 0,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      });
      toast.success('Vidéo mise à jour avec succès !');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return (
    <div style={styles.loading}><div style={styles.spinner} /></div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <FiArrowLeft size={16} /> Retour
        </button>

        <div style={styles.card}>
          <h1 style={styles.title}>Modifier la vidéo</h1>
          <p style={styles.subtitle}>Mettez à jour les informations de votre vidéo</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Titre */}
            <div style={styles.field}>
              <label style={styles.label}>Titre *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder="Titre de la vidéo"
                style={styles.input}
                required
              />
            </div>

            {/* Description */}
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Décrivez le contenu de votre vidéo..."
                style={styles.textarea}
                rows={5}
              />
            </div>

            {/* Prix & Catégorie */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Prix (crédits)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => handleChange('price', e.target.value)}
                  placeholder="0 = gratuit"
                  style={styles.input}
                  min="0"
                  step="0.5"
                />
                <span style={styles.hint}>0 = vidéo gratuite</span>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Catégorie</label>
                <select
                  value={form.categoryId}
                  onChange={e => handleChange('categoryId', e.target.value)}
                  style={styles.select}
                >
                  <option value="">-- Aucune catégorie --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note info */}
            <div style={styles.infoBox}>
              ℹ️ La modification d'une vidéo remet son statut en <strong>PENDING</strong> pour validation admin.
            </div>

            {/* Submit */}
            <div style={styles.footer}>
              <button type="button" onClick={() => navigate(-1)} style={styles.cancelBtn}>
                Annuler
              </button>
              <button type="submit" style={styles.submitBtn} disabled={saving}>
                <FiSave size={16} />
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { paddingTop: 100, paddingBottom: 60, minHeight: '100vh', background: '#f8fafc' },
  container: { maxWidth: 720, margin: '0 auto', padding: '0 24px' },
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
  card: {
    background: 'white', borderRadius: 20, padding: '36px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 24px rgba(26,86,219,0.07)',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 6,
  },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 32 },
  form: { display: 'flex', flexDirection: 'column', gap: 22 },
  field: { display: 'flex', flexDirection: 'column', gap: 7, flex: 1 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: {
    padding: '11px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: 14,
    fontFamily: "'Outfit', sans-serif", outline: 'none', color: '#0f172a',
  },
  textarea: {
    padding: '11px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: 14,
    fontFamily: "'Outfit', sans-serif", outline: 'none',
    resize: 'vertical', color: '#0f172a',
  },
  select: {
    padding: '11px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: 14,
    fontFamily: "'Outfit', sans-serif", outline: 'none',
    background: 'white', color: '#0f172a', cursor: 'pointer',
  },
  hint: { fontSize: 11, color: '#94a3b8' },
  infoBox: {
    background: '#eff6ff', border: '1px solid #bfdbfe',
    borderRadius: 10, padding: '12px 16px',
    fontSize: 13, color: '#1e40af',
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8,
  },
  cancelBtn: {
    padding: '11px 22px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: 14, fontWeight: 600,
    background: 'white', color: '#64748b', cursor: 'pointer',
  },
  submitBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '11px 26px',
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    color: 'white', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
  },
};

export default EditVideo;
