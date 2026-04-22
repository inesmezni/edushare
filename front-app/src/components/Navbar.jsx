import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiVideo, FiUser, FiLogOut, FiMenu, FiX, FiShield, FiUpload, FiBookOpen, FiGrid } from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isContributor, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logoutUser(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}><FiBookOpen size={18} color="white" /></div>
          <span style={styles.logoText}>Edu<span style={{ color: '#1a56db' }}>Share</span></span>
        </Link>

        <div style={styles.menu}>
          <Link to="/" style={{ ...styles.link, ...(isActive('/') ? styles.linkActive : {}) }}><FiHome size={15} /> Accueil</Link>
          <Link to="/videos" style={{ ...styles.link, ...(isActive('/videos') ? styles.linkActive : {}) }}><FiVideo size={15} /> Vidéos</Link>
          {isAuthenticated() && !isAdmin() && (
            <Link to="/dashboard" style={{ ...styles.link, ...(isActive('/dashboard') ? styles.linkActive : {}) }}><FiGrid size={15} /> Dashboard</Link>
          )}
          {isAuthenticated() && isContributor() && (
            <Link to="/upload" style={{ ...styles.link, ...(isActive('/upload') ? styles.linkActive : {}) }}><FiUpload size={15} /> Publier</Link>
          )}
          {isAuthenticated() && isAdmin() && (
            <Link to="/admin" style={{ ...styles.link, ...(isActive('/admin') ? styles.linkActive : {}) }}><FiShield size={15} /> Admin</Link>
          )}
        </div>

        <div style={styles.actions}>
          {isAuthenticated() ? (
            <>
              <Link to={isAdmin() ? '/admin' : '/profile'} style={styles.userBtn}>
                <div style={styles.avatar}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                <div style={styles.userInfo}>
                  <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
                  <span style={styles.userRole}>{isAdmin() ? 'Admin' : isContributor() ? 'Contributeur' : 'Étudiant'}</span>
                </div>
              </Link>
              <button onClick={handleLogout} style={styles.logoutBtn} title="Déconnexion">
                <FiLogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.loginBtn}>Connexion</Link>
              <Link to="/register" style={styles.registerBtn}>S'inscrire</Link>
            </>
          )}
        </div>

        <button style={styles.burger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🏠 Accueil</Link>
          <Link to="/videos" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🎥 Vidéos</Link>
          {isAuthenticated() ? (
            <>
              {!isAdmin() && <Link to="/profile" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>👤 Mon profil</Link>}
              {!isAdmin() && <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📊 Dashboard</Link>}
              {isContributor() && <Link to="/upload" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📤 Publier</Link>}
              {isAdmin() && <Link to="/admin" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🛡️ Administration</Link>}
              <button onClick={handleLogout} style={styles.mobileLogout}>🚪 Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 20px rgba(26,86,219,0.07)' },
  container: { maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' },
  logoIcon: { width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 19, fontWeight: 700, color: '#0f172a', fontFamily: "'Outfit', sans-serif" },
  menu: { display: 'flex', alignItems: 'center', gap: 2 },
  link: { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#475569', textDecoration: 'none', transition: 'all 0.2s' },
  linkActive: { background: '#e8f0fe', color: '#1a56db' },
  actions: { display: 'flex', alignItems: 'center', gap: 8 },
  userBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', textDecoration: 'none' },
  avatar: { width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 },
  userRole: { fontSize: 10, color: '#64748b' },
  logoutBtn: { width: 34, height: 34, borderRadius: 8, background: '#fee2e2', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer' },
  loginBtn: { padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#475569', textDecoration: 'none' },
  registerBtn: { padding: '7px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none' },
  burger: { background: 'none', border: 'none', cursor: 'pointer', color: '#334155' },
  mobileMenu: { background: 'white', padding: '12px 20px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 2 },
  mobileLink: { padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#334155', textDecoration: 'none' },
  mobileLogout: { padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#ef4444', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' },
};

export default Navbar;
