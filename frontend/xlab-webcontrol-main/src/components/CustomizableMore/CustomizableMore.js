import React, { useState } from 'react';
import styles from './CustomizableMore.module.css';

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

function CustomizableMore() {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customButtons, setCustomButtons] = useState([
    null, null, null, null, // Initialize with 4 empty slots matching the design
  ]);
  const [showActionMenu, setShowActionMenu] = useState(null); // Track which button is being customized

  const handleButtonClick = (index) => {
    if (customButtons[index]) {
      // If button has an action assigned, execute it
      handleActionClick(customButtons[index]);
    } else {
      // If button is empty, show customization menu
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
    // Here you would implement the actual action logic
    switch(action.id) {
      case 'network':
        console.log('Opening network settings...');
        break;
      case 'display':
        console.log('Opening display settings...');
        break;
      case 'audio':
        console.log('Opening audio settings...');
        break;
      default:
        console.log(`Action ${action.name} not implemented yet`);
    }
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

  const renderCustomButton = (button, index) => (
    <div key={index} className={styles.customButtonContainer}>
      <div
        className={`${styles.customButton} ${button ? styles.hasAction : styles.empty}`}
        onClick={() => handleButtonClick(index)}
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
  );

  const renderActionMenu = (buttonIndex) => (
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
              onClick={() => handleActionSelect(action, buttonIndex)}
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
  );

  return (
    <div className={styles.customizableMore}>
      <div className={styles.header}>
        <button
          className={styles.customizeToggle}
          onClick={toggleCustomizeMode}
        >
          {isCustomizing ? 'Done' : 'Customize'}
        </button>
      </div>

      <div className={styles.customButtonGrid}>
        {customButtons.map((button, index) => renderCustomButton(button, index))}
      </div>

      {!isCustomizing && (
        <p className={styles.helpText}>
          Click "Customize" to add your favorite quick actions
        </p>
      )}

      {isCustomizing && (
        <p className={styles.helpText}>
          Click empty buttons to add actions, or click × to remove them
        </p>
      )}

      {showActionMenu !== null && renderActionMenu(showActionMenu)}
    </div>
  );
}

export default CustomizableMore;