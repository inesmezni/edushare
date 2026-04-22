import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/authService';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiBookOpen } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    phone: '', contributor: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit avoir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      const response = await register(formData);
      loginUser(response.user, response.token);
      toast.success('Inscription réussie ! Bienvenue 🎉');
      navigate(formData.contributor ? '/dashboard/contributor' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>
            <FiBookOpen size={22} color="white" />
          </div>
          <span style={styles.logoText}>Edu<span style={{ color: '#1a56db' }}>Share</span></span>
        </Link>

        {/* Carte */}
        <div style={styles.card}>
          <h1 style={styles.title}>Créer un compte</h1>
          <p style={styles.subtitle}>Rejoignez la communauté EduShare</p>

          {/* Type de compte */}
          <div style={styles.typeSection}>
            <p style={styles.typeLabel}>Je veux :</p>
            <div style={styles.typeButtons}>
              <button
                type="button"
                style={{ ...styles.typeBtn, ...(!formData.contributor ? styles.typeBtnActive : {}) }}
                onClick={() => setFormData({ ...formData, contributor: false })}
              >
                <span style={styles.typeEmoji}>📚</span>
                <span style={styles.typeName}>Apprendre</span>
                <span style={styles.typeDesc}>Acheter et visionner des vidéos</span>
              </button>
              <button
                type="button"
                style={{ ...styles.typeBtn, ...(formData.contributor ? styles.typeBtnActive : {}) }}
                onClick={() => setFormData({ ...formData, contributor: true })}
              >
                <span style={styles.typeEmoji}>🎥</span>
                <span style={styles.typeName}>Enseigner</span>
                <span style={styles.typeDesc}>Publier et vendre des vidéos</span>
              </button>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            {/* Nom */}
            <div style={styles.field}>
              <label style={styles.label}>Nom complet</label>
              <div style={styles.inputWrapper}>
                <FiUser size={16} style={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Ines Mezni"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrapper}>
                <FiMail size={16} style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="votre@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Téléphone */}
            <div style={styles.field}>
              <label style={styles.label}>Téléphone</label>
              <div style={styles.inputWrapper}>
                <FiPhone size={16} style={styles.inputIcon} />
                <input
                  type="tel"
                  placeholder="+216 XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div style={styles.field}>
              <label style={styles.label}>Mot de passe</label>
              <div style={styles.inputWrapper}>
                <FiLock size={16} style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 caractères"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={styles.input}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Inscription...' : 'Créer mon compte'}
            </button>
          </form>

          {/* Connexion */}
          <p style={styles.footer}>
            Déjà un compte ?{' '}
            <Link to="/login" style={styles.link}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f5ff 0%, #e8f0fe 50%, #f0f9ff 100%)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '20px', position: 'relative', overflow: 'hidden',
  },
  bg: {
    position: 'absolute', bottom: -200, left: -200,
    width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%', maxWidth: 460,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
  },
  logoIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    fontSize: 24, fontWeight: 700, color: '#0f172a',
    fontFamily: "'Outfit', sans-serif",
  },
  card: {
    background: 'white', borderRadius: 24, padding: '36px',
    boxShadow: '0 4px 40px rgba(26,86,219,0.1)',
    border: '1px solid #e2e8f0', width: '100%',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 6,
  },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  typeSection: { marginBottom: 24 },
  typeLabel: { fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 10 },
  typeButtons: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  typeBtn: {
    padding: '14px 12px',
    border: '2px solid #e2e8f0', borderRadius: 12,
    background: 'white', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    transition: 'all 0.2s',
  },
  typeBtnActive: {
    border: '2px solid #1a56db', background: '#f0f5ff',
  },
  typeEmoji: { fontSize: 24 },
  typeName: { fontSize: 13, fontWeight: 600, color: '#0f172a' },
  typeDesc: { fontSize: 11, color: '#64748b', textAlign: 'center' },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, color: '#94a3b8' },
  input: {
    width: '100%', padding: '12px 40px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, color: '#0f172a', outline: 'none',
    transition: 'all 0.2s', fontFamily: "'Outfit', sans-serif",
  },
  eyeBtn: {
    position: 'absolute', right: 14,
    background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
  },
  submitBtn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    color: 'white', border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s', marginTop: 6,
    fontFamily: "'Outfit', sans-serif",
  },
  footer: { textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 20 },
  link: { color: '#1a56db', fontWeight: 600, textDecoration: 'none' },
};

export default Register;
