import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, loginAdmin } from '../services/authService';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff, FiBookOpen } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (isAdmin) {
        response = await loginAdmin(formData);
        loginUser(response.admin, response.token);
        toast.success('Bienvenue Admin !');
        navigate('/admin');
      } else {
        response = await login(formData);
        loginUser(response.user, response.token);
        toast.success('Connexion réussie !');
        // Rediriger selon le rôle
        if (response.user?.contributor) {
          navigate('/dashboard/contributor');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Fond décoratif */}
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
          <h1 style={styles.title}>Bon retour 👋</h1>
          <p style={styles.subtitle}>Connectez-vous à votre compte EduShare</p>

          {/* Toggle Admin/Utilisateur */}
          <div style={styles.toggle}>
            <button
              style={{ ...styles.toggleBtn, ...(isAdmin ? {} : styles.toggleActive) }}
              onClick={() => setIsAdmin(false)}
              type="button"
            >
              Étudiant / Contributeur
            </button>
            <button
              style={{ ...styles.toggleBtn, ...(isAdmin ? styles.toggleActive : {}) }}
              onClick={() => setIsAdmin(true)}
              type="button"
            >
              Administrateur
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrapper}>
                <FiMail size={16} style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={styles.input}
                  required
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
                  placeholder="••••••••"
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
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Inscription */}
          {!isAdmin && (
            <p style={styles.footer}>
              Pas encore de compte ?{' '}
              <Link to="/register" style={styles.link}>S'inscrire gratuitement</Link>
            </p>
          )}
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
    padding: '20px',
    position: 'relative', overflow: 'hidden',
  },
  bg: {
    position: 'absolute', top: -200, right: -200,
    width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,86,219,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%', maxWidth: 420,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    textDecoration: 'none',
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
    background: 'white',
    borderRadius: 24, padding: '36px',
    boxShadow: '0 4px 40px rgba(26,86,219,0.1)',
    border: '1px solid #e2e8f0',
    width: '100%',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 26, fontWeight: 700, color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  toggle: {
    display: 'flex', background: '#f1f5f9',
    borderRadius: 10, padding: 4, marginBottom: 24,
  },
  toggleBtn: {
    flex: 1, padding: '8px 12px', border: 'none',
    background: 'transparent', borderRadius: 8,
    fontSize: 13, fontWeight: 500, color: '#64748b',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  toggleActive: {
    background: 'white', color: '#1a56db',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    fontWeight: 600,
  },
  field: { marginBottom: 18 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, color: '#94a3b8' },
  input: {
    width: '100%', padding: '12px 40px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, color: '#0f172a',
    outline: 'none', transition: 'all 0.2s',
    fontFamily: "'Outfit', sans-serif",
  },
  eyeBtn: {
    position: 'absolute', right: 14,
    background: 'none', border: 'none',
    color: '#94a3b8', cursor: 'pointer',
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

export default Login;
