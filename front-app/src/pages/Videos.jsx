import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllVideos, searchVideos, getFreeVideos, getPopularVideos } from '../services/videoService';
import { getAllCategories } from '../services/categoryService';
import VideoCard from '../components/VideoCard';
import { FiSearch, FiFilter, FiX, FiSliders } from 'react-icons/fi';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  // Filtres
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getAllCategories().then(cats => setCategories(Array.isArray(cats) ? cats : [])).catch(() => {});
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    fetchVideos();
  }, []);

  const fetchVideos = async (params = {}) => {
    setLoading(true);
    try {
      let data;
      const kw = params.keyword !== undefined ? params.keyword : keyword;
      const cat = params.category !== undefined ? params.category : selectedCategory;
      const min = params.minPrice !== undefined ? params.minPrice : minPrice;
      const max = params.maxPrice !== undefined ? params.maxPrice : maxPrice;
      const sort = params.sortBy !== undefined ? params.sortBy : sortBy;

      if (kw || cat || min || max) {
        data = await searchVideos(kw || 'a', cat || undefined, min || undefined, max || undefined);
      } else if (sort === 'popular') {
        data = await getPopularVideos(20);
      } else if (sort === 'free') {
        data = await getFreeVideos();
      } else {
        data = await getAllVideos();
      }

      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVideos();
  };

  const handleCategorySelect = (cat) => {
    const newCat = selectedCategory === cat ? '' : cat;
    setSelectedCategory(newCat);
    fetchVideos({ category: newCat });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    fetchVideos({ sortBy: sort });
  };

  const clearFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('recent');
    fetchVideos({ keyword: '', category: '', minPrice: '', maxPrice: '', sortBy: 'recent' });
  };

  const hasActiveFilters = keyword || selectedCategory || minPrice || maxPrice || sortBy !== 'recent';

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Explorer les vidéos</h1>
            <p style={styles.subtitle}>{videos.length} vidéo(s) trouvée(s)</p>
          </div>
        </div>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} style={styles.searchBar}>
          <div style={styles.searchWrapper}>
            <FiSearch size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Rechercher par titre, matière, niveau..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={styles.searchInput}
            />
            {keyword && (
              <button type="button" onClick={() => { setKeyword(''); fetchVideos({ keyword: '' }); }} style={styles.clearBtn}>
                <FiX size={14} />
              </button>
            )}
          </div>
          <button type="submit" style={styles.searchBtn}>Rechercher</button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            style={{ ...styles.filterToggleBtn, ...(showFilters ? styles.filterToggleBtnActive : {}) }}
          >
            <FiSliders size={16} /> Filtres
            {hasActiveFilters && <span style={styles.filterDot} />}
          </button>
        </form>

        {/* Filtres avancés */}
        {showFilters && (
          <div style={styles.filtersPanel}>
            <div style={styles.filtersGrid}>
              {/* Prix */}
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Prix minimum (crédits)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={styles.filterInput}
                />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Prix maximum (crédits)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={styles.filterInput}
                />
              </div>
            </div>

            <div style={styles.filterActions}>
              <button onClick={() => fetchVideos()} style={styles.applyBtn}>
                Appliquer les filtres
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters} style={styles.clearAllBtn}>
                  <FiX size={14} /> Effacer tout
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tri */}
        <div style={styles.sortRow}>
          <span style={styles.sortLabel}>Trier par :</span>
          <div style={styles.sortButtons}>
            {[
              { key: 'recent', label: '✨ Récents' },
              { key: 'popular', label: '🔥 Populaires' },
              { key: 'free', label: '🆓 Gratuits' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSortChange(key)}
                style={{ ...styles.sortBtn, ...(sortBy === key ? styles.sortBtnActive : {}) }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Catégories */}
        <div style={styles.categories}>
          <button
            style={{ ...styles.catBtn, ...(selectedCategory === '' ? styles.catBtnActive : {}) }}
            onClick={() => handleCategorySelect('')}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              style={{ ...styles.catBtn, ...(selectedCategory === cat.name ? styles.catBtnActive : {}) }}
              onClick={() => handleCategorySelect(cat.name)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Résultats */}
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <p style={{ color: '#94a3b8', marginTop: 12, fontSize: 14 }}>Chargement...</p>
          </div>
        ) : videos.length > 0 ? (
          <div style={styles.grid}>
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div style={styles.empty}>
            <FiSearch size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <p style={{ fontSize: 16, marginBottom: 8 }}>Aucune vidéo trouvée</p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Essayez avec d'autres mots-clés</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} style={styles.clearFiltersBtn}>
                Effacer les filtres
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { paddingTop: 90, paddingBottom: 60, minHeight: '100vh', background: '#f8fafc' },
  container: { maxWidth: 1280, margin: '0 auto', padding: '0 24px' },
  header: { marginBottom: 24 },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 30, fontWeight: 700, color: '#0f172a',
  },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  searchBar: {
    display: 'flex', gap: 8, alignItems: 'center',
    marginBottom: 16, flexWrap: 'wrap',
  },
  searchWrapper: {
    flex: 1, minWidth: 200,
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'white', borderRadius: 12,
    border: '1.5px solid #e2e8f0',
    padding: '4px 8px 4px 14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  searchInput: {
    flex: 1, border: 'none', outline: 'none',
    padding: '9px 6px', fontSize: 14,
    fontFamily: "'Outfit', sans-serif", color: '#0f172a',
    background: 'transparent',
  },
  clearBtn: {
    background: '#f1f5f9', border: 'none',
    width: 24, height: 24, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#94a3b8', cursor: 'pointer', flexShrink: 0,
  },
  searchBtn: {
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    color: 'white', border: 'none', borderRadius: 10,
    padding: '11px 22px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  filterToggleBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'white', border: '1.5px solid #e2e8f0',
    borderRadius: 10, padding: '10px 16px',
    fontSize: 14, fontWeight: 500, color: '#475569',
    cursor: 'pointer', position: 'relative',
  },
  filterToggleBtnActive: { border: '1.5px solid #1a56db', color: '#1a56db', background: '#f0f5ff' },
  filterDot: {
    position: 'absolute', top: 6, right: 6,
    width: 6, height: 6, borderRadius: '50%',
    background: '#ef4444',
  },
  filtersPanel: {
    background: 'white', borderRadius: 14, padding: '20px',
    border: '1px solid #e2e8f0', marginBottom: 16,
  },
  filtersGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  filterGroup: {},
  filterLabel: { display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 6 },
  filterInput: {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 14, fontFamily: "'Outfit', sans-serif",
    color: '#0f172a', outline: 'none', boxSizing: 'border-box',
  },
  filterActions: { display: 'flex', gap: 8 },
  applyBtn: {
    background: '#1a56db', color: 'white',
    border: 'none', padding: '9px 20px', borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  clearAllBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#fee2e2', color: '#ef4444',
    border: 'none', padding: '9px 16px', borderRadius: 8,
    fontSize: 14, fontWeight: 500, cursor: 'pointer',
  },
  sortRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 16, flexWrap: 'wrap',
  },
  sortLabel: { fontSize: 13, color: '#64748b', fontWeight: 500 },
  sortButtons: { display: 'flex', gap: 6 },
  sortBtn: {
    padding: '6px 14px', borderRadius: 100,
    border: '1.5px solid #e2e8f0', background: 'white',
    fontSize: 13, fontWeight: 500, color: '#475569',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  sortBtnActive: { background: '#1a56db', color: 'white', borderColor: '#1a56db' },
  categories: {
    display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28,
  },
  catBtn: {
    padding: '7px 14px', borderRadius: 100,
    border: '1.5px solid #e2e8f0', background: 'white',
    fontSize: 13, fontWeight: 500, color: '#475569',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  catBtnActive: { background: '#1a56db', color: 'white', borderColor: '#1a56db' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 20,
  },
  loading: {
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center', padding: '80px 0',
  },
  spinner: {
    width: 36, height: 36, border: '3px solid #e2e8f0',
    borderTopColor: '#1a56db', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  empty: {
    textAlign: 'center', padding: '80px 20px',
    color: '#94a3b8', display: 'flex',
    flexDirection: 'column', alignItems: 'center',
  },
  clearFiltersBtn: {
    marginTop: 16, padding: '9px 20px',
    background: '#1a56db', color: 'white',
    border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
};

export default Videos;
