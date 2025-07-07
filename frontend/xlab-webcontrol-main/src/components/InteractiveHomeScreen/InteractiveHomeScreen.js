import React, { useState } from 'react';
import styles from './InteractiveHomeScreen.module.css';
import {
    MoreIcon,
    FavoriteIcon,
    PresetsIcon,
    SettingsIcon,
    TimeIcon,
    ViewIcon,
    VolumeIcon,
    WeatherIcon
} from './homepage-icons';
import VolumeDial from '../VolumeDial/VolumeDial'; 
import WeatherDial from '../WeatherDial/WeatherDial';  
import TimeDial from '../TimeDial/TimeDial';
import CameraController from '../View/View';
import Presets from '../PresetMenu/PresetMenu';
import FavoritesPlaylist from '../FavoritesPlaylist/FavoritesPlaylist';

function InteractiveHomeScreen() {
  const [currentView, setCurrentView] = useState('home');
  const [showMoreButtons, setShowMoreButtons] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customButtons, setCustomButtons] = useState([null, null, null, null]);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes()
  });
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
  const [selectedPresets, setSelectedPresets] = useState([]);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const AVAILABLE_ACTIONS = [
    { id: 'network', name: 'Network', icon: '📶' },
    { id: 'display', name: 'Display', icon: '🖥️' },
    { id: 'audio', name: 'Audio', icon: '🔊' },
    { id: 'system', name: 'System', icon: '⚙️' },
    { id: 'help', name: 'Help', icon: '❓' },
    { id: 'about', name: 'About', icon: 'ℹ️' },
    { id: 'feedback', name: 'Feedback', icon: '📝' },
    { id: 'backup', name: 'Backup', icon: '💾' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' },
    { id: 'updates', name: 'Updates', icon: '🔄' },
  ];

  const handleBackClick = () => setCurrentView('home');
  const handleFavoritesClick = () => setShowFavoritesModal(true);
  const handleVolumeChange = (newVolume) => setVolume(newVolume);
  const handleTimeChange = (newTime) => setCurrentTime(newTime);

  const handleCameraMove = (direction) => {
    setCameraPosition(prev => {
      const step = 10;
      switch(direction) {
        case 'up': return { ...prev, y: prev.y - step };
        case 'down': return { ...prev, y: prev.y + step };
        case 'left': return { ...prev, x: prev.x - step };
        case 'right': return { ...prev, x: prev.x + step };
        default: return prev;
      }
    });
  };

  const handlePresetSelect = (preset, isSelected) => {
    setSelectedPresets(prev => {
      if (isSelected) {
        return [...prev, preset.id];
      } else {
        return prev.filter(id => id !== preset.id);
      }
    });
    
    if (isSelected && preset.config.volume !== undefined) {
      setVolume(preset.config.volume);
    }
  };

  const handlePresetDelete = (presetId) => {
    setSelectedPresets(prev => prev.filter(id => id !== presetId));
  };

  const handleMoreClick = () => {
    setShowMoreButtons(!showMoreButtons);
    setIsCustomizing(false);
    setShowActionMenu(null);
  };

  const handleCustomButtonClick = (index) => {
    if (customButtons[index]) {
      handleActionClick(customButtons[index]);
    } else {
      setShowActionMenu(index);
    }
  };

  const handleActionSelect = (action, buttonIndex) => {
    const newButtons = [...customButtons];
    newButtons[buttonIndex] = action;
    setCustomButtons(newButtons);
    setShowActionMenu(null);
  };

  const handleActionClick = (action) => {
    console.log(`Executing action: ${action.name}`);
    // Action implementation would go here
  };

  const handleRemoveButton = (index) => {
    const newButtons = [...customButtons];
    newButtons[index] = null;
    setCustomButtons(newButtons);
  };

  const toggleCustomizeMode = () => {
    setIsCustomizing(!isCustomizing);
    setShowActionMenu(null);
  };

  const renderHomeView = () => (
    <div className={styles.homeView}>
      <header className={styles.homeHeader}>
        <h1>Web Controller</h1>
        <p>Select an option below</p>
      </header>
     
      <div className={styles.iconGrid}>
        <div className={styles.iconItem} onClick={() => setCurrentView('time')}>
          <img src={TimeIcon} alt="Time" className={styles.icon} />
          <span>Time</span>
        </div>
        <div className={styles.iconItem} onClick={() => setCurrentView('weather')}>
          <img src={WeatherIcon} alt="Weather" className={styles.icon} />
          <span>Weather</span>
        </div>
        <div className={styles.iconItem} onClick={() => setCurrentView('volume')}>
          <img src={VolumeIcon} alt="Volume" className={styles.icon} />
          <span>Volume</span>
        </div>
        <div className={styles.iconItem} onClick={() => setCurrentView('presets')}>
          <img src={PresetsIcon} alt="Presets" className={styles.icon} />
          <span>Presets</span>
        </div>
        <div className={styles.iconItem} onClick={() => setCurrentView('view')}>
          <img src={ViewIcon} alt="View" className={styles.icon} />
          <span>View</span>
        </div>
        <div className={styles.iconItem} onClick={handleFavoritesClick}>
          <img src={FavoriteIcon} alt="Favorites" className={styles.icon} />
          <span>Favorites</span>
        </div>
        <div className={styles.iconItem} onClick={() => setCurrentView('settings')}>
          <img src={SettingsIcon} alt="Settings" className={styles.icon} />
          <span>Settings</span>
        </div>
        <div className={styles.iconItem} onClick={handleMoreClick}>
          <img src={MoreIcon} alt="More" className={styles.icon} />
          <span>More</span>
        </div>
      </div>

      {showMoreButtons && (
        <div className={styles.moreSection}>
          <div className={styles.moreSectionHeader}>
            <h3>Quick Actions</h3>
            <button className={styles.customizeToggle} onClick={toggleCustomizeMode}>
              {isCustomizing ? 'Done' : 'Customize'}
            </button>
          </div>
          
          <div className={styles.customButtonGrid}>
            {customButtons.map((button, index) => (
              <div key={index} className={styles.customButtonContainer}>
                <div
                  className={`${styles.customButton} ${button ? styles.hasAction : styles.empty}`}
                  onClick={() => handleCustomButtonClick(index)}
                >
                  {button ? (
                    <div className={styles.buttonContent}>
                      <span className={styles.buttonIcon}>{button.icon}</span>
                      <span className={styles.buttonText}>{button.name}</span>
                    </div>
                  ) : (
                    <div className={styles.emptyContent}>
                      <span className={styles.plusIcon}>+</span>
                    </div>
                  )}
                </div>
                
                {isCustomizing && button && (
                  <button
                    className={styles.removeButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveButton(index);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className={styles.helpText}>
            {isCustomizing 
              ? "Click empty buttons to add actions, or click × to remove them"
              : "Click 'Customize' to add your favorite quick actions"
            }
          </p>
        </div>
      )}

      {showActionMenu !== null && (
        <div className={styles.actionMenuOverlay}>
          <div className={styles.actionMenu}>
            <h3>Select Action</h3>
            <div className={styles.actionGrid}>
              {AVAILABLE_ACTIONS.filter(action => 
                !customButtons.some(btn => btn && btn.id === action.id)
              ).map(action => (
                <button
                  key={action.id}
                  className={styles.actionOption}
                  onClick={() => handleActionSelect(action, showActionMenu)}
                >
                  <span className={styles.actionIcon}>{action.icon}</span>
                  <span className={styles.actionName}>{action.name}</span>
                </button>
              ))}
            </div>
            <button
              className={styles.cancelButton}
              onClick={() => setShowActionMenu(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showFavoritesModal && (
        <FavoritesPlaylist 
          currentExperience={{
            id: Date.now(),
            title: "Ambient Forest Sounds",
            artist: "Nature Sounds"
          }}
          onClose={() => setShowFavoritesModal(false)}
          showModalDirectly={true}
        />
      )}
    </div>
  );

  const renderDetailView = (title, content) => (
    <div className={styles.detailView}>
      <div className={styles.detailHeader}>
        <button onClick={handleBackClick} className={styles.backButton}>
          ←
        </button>
        <h2>{title}</h2>
      </div>
      <div className={styles.detailContent}>
        {content}
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch(currentView) {
      case 'time':
        return renderDetailView(
          'Time Control',
          <TimeDial 
            initialTime={currentTime}
            onTimeChange={handleTimeChange}
          />
        );
      case 'weather':
        return renderDetailView('Weather Control', <WeatherDial />);
      case 'volume':
        return renderDetailView(
          'Volume Control',
          <VolumeDial 
            initialValue={volume}
            onVolumeChange={handleVolumeChange}
          />
        );
      case 'presets':
        return renderDetailView(
          'Presets', 
          <Presets 
            onPresetSelect={handlePresetSelect}
            onPresetDelete={handlePresetDelete}
            selectedPresets={selectedPresets}
          />
        );
      case 'view':
        return renderDetailView(
          'Camera View Control', 
          <div>
            <CameraController onCameraMove={handleCameraMove} />
          </div>
        );
      case 'settings':
        return renderDetailView(
          'Settings', 
          <div>
            <h3 className={styles.sectionHeading}>System Settings</h3>
            <div className={styles.settingsOptions}>
              <button className={styles.settingBtn}>Network Settings</button>
              <button className={styles.settingBtn}>Display Settings</button>
              <button className={styles.settingBtn}>Audio Settings</button>
              <button className={styles.settingBtn}>System Info</button>
            </div>
          </div>
        );
      default:
        return renderHomeView();
    }
  };

  return (
    <div className={styles.interactiveHomeScreen}>
      {renderCurrentView()}
    </div>
  );
}

export default InteractiveHomeScreen;