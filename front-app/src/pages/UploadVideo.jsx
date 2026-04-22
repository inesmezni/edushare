import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadVideo } from '../services/videoService';
import { getAllCategories } from '../services/categoryService';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiVideo, FiImage, FiX, FiArrowLeft } from 'react-icons/fi';

const UploadVideo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', price: 0, category: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error);
  }, []);

  // Dropzone vidéo
  const { getRootProps: getVideoProps, getInputProps: getVideoInput, isDragActive: isVideoDrag } = useDropzone({
    accept: { 'video/*': ['.mp4', '.avi', '.mov', '.mkv'] },
    maxFiles: 1,
    onDrop: (files) => setVideoFile(files[0]),
  });

  // Dropzone thumbnail
  const { getRootProps: getThumbProps, getInputProps: getThumbInput } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: (files) => {
      setThumbnailFile(files[0]);
      setThumbnailPreview(URL.createObjectURL(files[0]));
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) { toast.error('Veuillez sélectionner une vidéo'); return; }
    if (!thumbnailFile) { toast.error('Veuillez sélectionner une miniature'); return; }
    if (!formData.category) { toast.error('Veuillez choisir une catégorie'); return; }

    setLoading(true);
    setUploadProgress(0);

    try {
      const data = new FormData();
      data.append('videoFile', videoFile);
      data.append('thumbnail', thumbnailFile);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);

      await uploadVideo(user.id, data);
      toast.success('Vidéo publiée ! En attente de validation par l\'admin 🎉');
      navigate('/dashboard/contributor');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <FiArrowLeft size={16} /> Retour
          </button>
          <div>
            <h1 style={styles.title}>Publier une vidéo</h1>
            <p style={styles.subtitle}>Votre vidéo sera visible après validation de l'admin</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.layout}>
            {/* Colonne gauche */}
            <div style={styles.leftCol}>
              {/* Upload vidéo */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                  <FiVideo size={18} /> Fichier vidéo *
                </h3>
                <div {...getVideoProps()} style={{
                  ...styles.dropzone,
                  ...(isVideoDrag ? styles.dropzoneActive : {}),
                  ...(videoFile ? styles.dropzoneFilled : {}),
                }}>
                  <input {...getVideoInput()} />
                  {videoFile ? (
                    <div style={styles.fileInfo}>
                      <span style={styles.fileIcon}>🎬</span>
                      <div>
                        <p style={styles.fileName}>{videoFile.name}</p>
                        <p style={styles.fileSize}>
                          {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                        style={styles.removeBtn}
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={styles.dropzoneContent}>
                      <FiUpload size={32} style={{ color: '#94a3b8', marginBottom: 8 }} />
                      <p style={styles.dropzoneText}>
                        Glissez votre vidéo ici ou <span style={{ color: '#1a56db' }}>cliquez</span>
                      </p>
                      <p style={styles.dropzoneHint}>MP4, AVI, MOV, MKV — Max 500MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload thumbnail */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                  <FiImage size={18} /> Miniature *
                </h3>
                <div {...getThumbProps()} style={styles.thumbDropzone}>
                  <input {...getThumbInput()} />
                  {thumbnailPreview ? (
                    <div style={styles.thumbPreview}>
                      <img src={thumbnailPreview} alt="Preview" style={styles.thumbImg} />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setThumbnailFile(null);
                          setThumbnailPreview(null);
                        }}
                        style={styles.thumbRemoveBtn}
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={styles.dropzoneContent}>
                      <FiImage size={28} style={{ color: '#94a3b8', marginBottom: 8 }} />
                      <p style={styles.dropzoneText}>
                        Ajouter une miniature
                      </p>
                      <p style={styles.dropzoneHint}>JPG, PNG, WEBP — Max 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div style={styles.rightCol}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Informations</h3>

                {/* Titre */}
                <div style={styles.field}>
                  <label style={styles.label}>Titre *</label>
                  <input
                    type="text"
                    placeholder="Titre de votre vidéo"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>

                {/* Description */}
                <div style={styles.field}>
                  <label style={styles.label}>Description *</label>
                  <textarea
                    placeholder="Décrivez votre vidéo..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ ...styles.input, height: 120, resize: 'vertical' }}
                    required
                  />
                </div>

                {/* Catégorie */}
                <div style={styles.field}>
                  <label style={styles.label}>Catégorie *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={styles.input}
                    required
                  >
                    <option value="">Choisir une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Prix */}
                <div style={styles.field}>
                  <label style={styles.label}>Prix (crédits)</label>
                  <div style={styles.priceWrapper}>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      style={styles.input}
                    />
                    <p style={styles.priceHint}>
                      {formData.price === 0 ? '✅ Vidéo gratuite' : `💰 ${formData.price} crédits`}
                    </p>
                  </div>
                </div>

                {/* Info validation */}
                <div style={styles.infoBox}>
                  ℹ️ Votre vidéo sera examinée par un admin avant d'être publiée.
                </div>

                {/* Bouton submit */}
                <button
                  type="submit"
                  style={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div style={styles.btnSpinner} />
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <FiUpload size={16} /> Publier la vidéo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: { paddingTop: 100, paddingBottom: 60, minHeight: '100vh', background: '#f8fafc' },
  container: { maxWidth: 1100, margin: '0 auto', padding: '0 24px' },
  header: { marginBottom: 28 },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'white', border: '1px solid #e2e8f0',
    padding: '8px 16px', borderRadius: 10,
    fontSize: 14, fontWeight: 500, color: '#334155',
    cursor: 'pointer', marginBottom: 16,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28, fontWeight: 700, color: '#0f172a',
  },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  form: {},
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  leftCol: { display: 'flex', flexDirection: 'column', gap: 20 },
  rightCol: {},
  card: {
    background: 'white', borderRadius: 16, padding: '24px',
    border: '1px solid #e2e8f0',
  },
  cardTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15, fontWeight: 600, color: '#0f172a',
    marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
  },
  dropzone: {
    border: '2px dashed #e2e8f0', borderRadius: 12,
    padding: '32px 20px', cursor: 'pointer',
    transition: 'all 0.2s', textAlign: 'center',
  },
  dropzoneActive: { border: '2px dashed #1a56db', background: '#f0f5ff' },
  dropzoneFilled: { border: '2px solid #1a56db', background: '#f0f5ff' },
  dropzoneContent: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  dropzoneText: { fontSize: 14, color: '#64748b', fontWeight: 500 },
  dropzoneHint: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  fileInfo: {
    display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
  },
  fileIcon: { fontSize: 32 },
  fileName: { fontSize: 14, fontWeight: 600, color: '#0f172a' },
  fileSize: { fontSize: 12, color: '#64748b' },
  removeBtn: {
    background: '#fee2e2', border: 'none',
    width: 28, height: 28, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#ef4444', cursor: 'pointer', marginLeft: 'auto',
  },
  thumbDropzone: {
    border: '2px dashed #e2e8f0', borderRadius: 12,
    aspectRatio: '16/9', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  thumbPreview: { position: 'relative', width: '100%', height: '100%' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbRemoveBtn: {
    position: 'absolute', top: 8, right: 8,
    background: 'rgba(0,0,0,0.6)', border: 'none',
    width: 28, height: 28, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', cursor: 'pointer',
  },
  field: { marginBottom: 18 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 },
  input: {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, color: '#0f172a', outline: 'none',
    transition: 'all 0.2s', fontFamily: "'Outfit', sans-serif",
    background: 'white', boxSizing: 'border-box',
  },
  priceWrapper: {},
  priceHint: { fontSize: 12, color: '#64748b', marginTop: 6 },
  infoBox: {
    background: '#f0f5ff', border: '1px solid #c7d7fd',
    borderRadius: 10, padding: '12px 16px',
    fontSize: 13, color: '#1a56db', marginBottom: 20,
  },
  submitBtn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    color: 'white', border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: "'Outfit', sans-serif",
  },
  btnSpinner: {
    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: 'white', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

export default UploadVideo;
