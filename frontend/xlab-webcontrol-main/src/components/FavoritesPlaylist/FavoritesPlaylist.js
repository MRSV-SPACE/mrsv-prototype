import React, { useState, useEffect, useCallback } from 'react';
import styles from './FavoritesPlaylist.module.css';

const FavoritesPlaylist = ({ currentExperience, onClose, showModalDirectly = false }) => {
  // Constants
  const AVAILABLE_ICONS = [
    '📁', '⭐', '🎵', '🎶', '🎤', '🎧', '🎸', '🎹', '🥁', '🎺',
    '🎻', '🎷', '🎺', '🎪', '🎭', '🎨', '🎬', '📺', '📻', '💿',
    '💽', '💾', '💻', '📱', '⚡', '🔥', '❤️', '💙', '💚', '💜',
    '🖤', '🤍', '🧡', '💛', '🌟', '✨', '💫', '⭐', '🌙', '☀️'
  ];

  // State
  const [showPlaylistModal, setShowPlaylistModal] = useState(showModalDirectly);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [showIconMenu, setShowIconMenu] = useState(null);
  const [creatingNewPlaylist, setCreatingNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistIcon, setNewPlaylistIcon] = useState('📁');
  const [pendingChanges, setPendingChanges] = useState({});
  const [playlists, setPlaylists] = useState(() => initializePlaylists());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState({});

  // Memoized current experience
  const experience = currentExperience || {
    id: 1,
    title: "Current Experience",
    artist: "Artist Name"
  };

  // Initialize playlists from localStorage
  function initializePlaylists() {
    try {
      const savedPlaylists = localStorage.getItem('favoritesPlaylists');
      if (savedPlaylists) {
        return JSON.parse(savedPlaylists);
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
    
    return [
      { id: 'favorites', name: 'Favorites', icon: '⭐', experiences: [], isDefault: true },
      { id: 'playlist1', name: 'Playlist 1', icon: '📁', experiences: [], isDefault: false },
      { id: 'playlist2', name: 'Playlist 2', icon: '📁', experiences: [], isDefault: false },
      { id: 'playlist3', name: 'Playlist 3', icon: '📁', experiences: [], isDefault: false },
      { id: 'playlist4', name: 'Playlist 4', icon: '📁', experiences: [], isDefault: false },
      { id: 'playlist5', name: 'Playlist 5', icon: '📁', experiences: [], isDefault: false }
    ];
  }

  // Save playlists to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('favoritesPlaylists', JSON.stringify(playlists));
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  }, [playlists]);

  // Effect for recently updated animation
  useEffect(() => {
    if (Object.keys(recentlyUpdated).length > 0) {
      const timer = setTimeout(() => {
        setRecentlyUpdated({});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [recentlyUpdated]);

  // Handlers
  const handleStarClick = useCallback(() => {
    setShowPlaylistModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowPlaylistModal(false);
    setEditingPlaylist(null);
    setShowIconMenu(null);
    setCreatingNewPlaylist(false);
    setNewPlaylistName('');
    setNewPlaylistIcon('📁');
    setPendingChanges({});
    setShowDeleteConfirmation(null);
    
    if (onClose) onClose();
  }, [onClose]);

  const toggleExperienceInPlaylist = useCallback((playlistId) => {
    setPendingChanges(prev => ({
      ...prev,
      [playlistId]: !isInPlaylist(playlistId)
    }));
  }, [experience.id, playlists]);

  const confirmPlaylistChange = useCallback((playlistId) => {
    const shouldAdd = pendingChanges[playlistId];
    
    if (shouldAdd !== undefined) {
      setPlaylists(prev => prev.map(playlist => {
        if (playlist.id === playlistId) {
          const isCurrentlyInPlaylist = playlist.experiences.some(exp => exp.id === experience.id);
          
          if (shouldAdd && !isCurrentlyInPlaylist) {
            setRecentlyUpdated(prev => ({ ...prev, [playlistId]: 'added' }));
            return {
              ...playlist,
              experiences: [...playlist.experiences, experience]
            };
          } else if (!shouldAdd && isCurrentlyInPlaylist) {
            setRecentlyUpdated(prev => ({ ...prev, [playlistId]: 'removed' }));
            return {
              ...playlist,
              experiences: playlist.experiences.filter(exp => exp.id !== experience.id)
            };
          }
        }
        return playlist;
      }));
      
      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[playlistId];
        return newPending;
      });
    }
  }, [pendingChanges, experience]);

  const isInPlaylist = useCallback((playlistId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist?.experiences.some(exp => exp.id === experience.id) || false;
  }, [playlists, experience.id]);

  const hasPendingChange = useCallback((playlistId) => {
    return pendingChanges[playlistId] !== undefined;
  }, [pendingChanges]);

  const handleNameEdit = useCallback((playlistId, currentName) => {
    setEditingPlaylist(playlistId);
    setEditingName(currentName);
  }, []);

  const saveNameEdit = useCallback(() => {
    if (editingName.trim()) {
      const nameExists = playlists.some(
        playlist => playlist.name.toLowerCase() === editingName.trim().toLowerCase() && 
                   playlist.id !== editingPlaylist
      );
      
      if (nameExists) {
        alert('A playlist with this name already exists');
        return;
      }
      
      setPlaylists(prev => prev.map(playlist => 
        playlist.id === editingPlaylist 
          ? { ...playlist, name: editingName.trim() }
          : playlist
      ));
    }
    setEditingPlaylist(null);
    setEditingName('');
  }, [editingName, editingPlaylist, playlists]);

  const cancelNameEdit = useCallback(() => {
    setEditingPlaylist(null);
    setEditingName('');
  }, []);

  const handleIconSelect = useCallback((playlistId, icon) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, icon }
        : playlist
    ));
    setShowIconMenu(null);
  }, []);

  const handleNewPlaylistClick = useCallback(() => {
    setCreatingNewPlaylist(true);
    setNewPlaylistName('');
    setNewPlaylistIcon('📁');
    setShowIconMenu(null);
  }, []);

  const createNewPlaylist = useCallback(() => {
    if (newPlaylistName.trim()) {
      const nameExists = playlists.some(
        playlist => playlist.name.toLowerCase() === newPlaylistName.trim().toLowerCase()
      );
      
      if (nameExists) {
        alert('A playlist with this name already exists');
        return;
      }
      
      const newPlaylist = {
        id: `playlist_${Date.now()}`,
        name: newPlaylistName.trim(),
        icon: newPlaylistIcon,
        experiences: [],
        isDefault: false
      };
      
      setPlaylists(prev => [...prev, newPlaylist]);
      setCreatingNewPlaylist(false);
      setNewPlaylistName('');
      setNewPlaylistIcon('📁');
      setShowIconMenu(null);
    }
  }, [newPlaylistName, newPlaylistIcon, playlists]);

  const cancelNewPlaylist = useCallback(() => {
    setCreatingNewPlaylist(false);
    setNewPlaylistName('');
    setNewPlaylistIcon('📁');
    setShowIconMenu(null);
  }, []);

  const handleNewPlaylistIconSelect = useCallback((icon) => {
    setNewPlaylistIcon(icon);
    setShowIconMenu(null);
  }, []);

  const deletePlaylist = useCallback((playlistId) => {
    if (playlists.find(p => p.id === playlistId)?.isDefault) {
      alert('Default playlists cannot be deleted');
      return;
    }
    setShowDeleteConfirmation(playlistId);
  }, [playlists]);

  const confirmDeletePlaylist = useCallback(() => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== showDeleteConfirmation));
    setShowDeleteConfirmation(null);
  }, [showDeleteConfirmation]);

  const cancelDeletePlaylist = useCallback(() => {
    setShowDeleteConfirmation(null);
  }, []);

  // Render helpers
  const renderIconMenu = (isNewPlaylist = false, playlistId = null) => {
    const currentIcon = isNewPlaylist ? newPlaylistIcon : 
      playlists.find(p => p.id === playlistId)?.icon;
    
    return (
      <div className={styles.iconMenu}>
        <div className={styles.iconGrid}>
          {AVAILABLE_ICONS.map((icon, index) => (
            <button
              key={index}
              className={`${styles.iconOption} ${
                currentIcon === icon ? styles.selectedIcon : ''
              }`}
              onClick={() => isNewPlaylist 
                ? handleNewPlaylistIconSelect(icon) 
                : handleIconSelect(playlistId, icon)
              }
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderDeleteConfirmation = () => (
    <div className={styles.confirmationOverlay}>
      <div className={styles.confirmationModal} onClick={(e) => e.stopPropagation()}>
        <h3>Delete Playlist</h3>
        <p>Are you sure you want to delete this playlist?</p>
        <div className={styles.confirmationButtons}>
          <button 
            onClick={confirmDeletePlaylist}
            className={styles.confirmButton}
          >
            Delete
          </button>
          <button 
            onClick={cancelDeletePlaylist}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderNewPlaylistForm = () => (
    <div className={styles.newPlaylistForm}>
      <div className={styles.newPlaylistInputContainer}>
        <div 
          className={styles.playlistIcon}
          onClick={(e) => {
            e.stopPropagation();
            setShowIconMenu(showIconMenu === 'new' ? null : 'new');
          }}
        >
          <span>{newPlaylistIcon}</span>
        </div>
        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          placeholder="Playlist name"
          className={styles.newPlaylistInput}
          autoFocus
          onKeyPress={(e) => e.key === 'Enter' && createNewPlaylist()}
          onKeyDown={(e) => e.key === 'Escape' && cancelNewPlaylist()}
        />
      </div>
      <div className={styles.newPlaylistActions}>
        <button 
          onClick={createNewPlaylist}
          className={styles.createButton}
          disabled={!newPlaylistName.trim()}
        >
          Create
        </button>
        <button 
          onClick={cancelNewPlaylist}
          className={styles.cancelButton}
        >
          Cancel
        </button>
      </div>
      
      {showIconMenu === 'new' && renderIconMenu(true)}
    </div>
  );

  const renderPlaylistItem = (playlist) => (
    <div key={playlist.id} className={styles.playlistItemContainer}>
      <button
        onClick={() => toggleExperienceInPlaylist(playlist.id)}
        className={`${styles.playlistItem} ${
          isInPlaylist(playlist.id) ? styles.selected : ''
        } ${hasPendingChange(playlist.id) ? styles.pending : ''} ${
          recentlyUpdated[playlist.id] ? styles[recentlyUpdated[playlist.id]] : ''
        }`}
      >
        <div 
          className={styles.playlistIcon}
          onClick={(e) => {
            e.stopPropagation();
            setShowIconMenu(showIconMenu === playlist.id ? null : playlist.id);
          }}
        >
          <span>{playlist.icon}</span>
        </div>
        
        {editingPlaylist === playlist.id ? (
          <input
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={saveNameEdit}
            onKeyPress={(e) => e.key === 'Enter' && saveNameEdit()}
            onKeyDown={(e) => e.key === 'Escape' && cancelNameEdit()}
            className={styles.nameInput}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span 
            className={styles.playlistName}
            onDoubleClick={() => !playlist.isDefault && handleNameEdit(playlist.id, playlist.name)}
          >
            {playlist.name}
            {isInPlaylist(playlist.id) && (
              <span className={styles.itemCount}>
                ({playlist.experiences.length} item{playlist.experiences.length !== 1 ? 's' : ''})
              </span>
            )}
          </span>
        )}
        
        {hasPendingChange(playlist.id) ? (
          <div 
            className={styles.pendingCheckmark}
            onClick={(e) => {
              e.stopPropagation();
              confirmPlaylistChange(playlist.id);
            }}
            title="Click to confirm"
          >
            ✓
          </div>
        ) : (
          isInPlaylist(playlist.id) && (
            <div className={styles.checkmark}>✓</div>
          )
        )}
        
        {!playlist.isDefault && (
          <button
            className={styles.deleteButton}
            onClick={(e) => {
              e.stopPropagation();
              deletePlaylist(playlist.id);
            }}
            title="Delete playlist"
          >
            ×
          </button>
        )}
      </button>

      {showIconMenu === playlist.id && renderIconMenu(false, playlist.id)}
    </div>
  );

  const renderModal = () => (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.playlistModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add to Playlist</h2>
          <button 
            onClick={closeModal}
            className={styles.closeButton}
          >
            ×
          </button>
        </div>

        <div className={styles.modalContent}>
          {creatingNewPlaylist ? renderNewPlaylistForm() : (
            <button 
              onClick={handleNewPlaylistClick}
              className={styles.newPlaylistButton}
            >
              <div className={styles.playlistIcon}>
                <span>+</span>
              </div>
              <span className={styles.playlistName}>New playlist</span>
            </button>
          )}

          <div className={styles.playlistList}>
            {playlists.map(renderPlaylistItem)}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <p className={styles.helpText}>
            Double-click playlist names to edit • Click icons to change them
          </p>
        </div>
      </div>
      
      {showDeleteConfirmation && renderDeleteConfirmation()}
    </div>
  );

  // Main render
  if (showModalDirectly) {
    return renderModal();
  }

  return (
    <div className={styles.favoritesContainer}>
      <button 
        onClick={handleStarClick}
        className={`${styles.starButton} ${isInPlaylist('favorites') ? styles.active : ''}`}
        title="Add to Favorites"
      >
        <span className={styles.starIcon}>
          {isInPlaylist('favorites') ? '⭐' : '☆'}
        </span>
      </button>

      {showPlaylistModal && renderModal()}
    </div>
  );
};

export default FavoritesPlaylist;