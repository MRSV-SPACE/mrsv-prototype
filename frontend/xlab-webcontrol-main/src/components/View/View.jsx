import React, { useState } from 'react';
import './View.css';

const CameraController = ({ onCameraMove }) => {
  const [activeDirection, setActiveDirection] = useState(null);

  const handleDirectionPress = (direction) => {
    setActiveDirection(direction);
    if (onCameraMove) {
      onCameraMove(direction);
    }
  };

  const handleDirectionRelease = () => {
    setActiveDirection(null);
  };

  return (
    <div className="camera-controller">
      <div className="dpad-container">
        {/* Up Button */}
        <button
          className={`dpad-button dpad-up ${activeDirection === 'up' ? 'active' : ''}`}
          onMouseDown={() => handleDirectionPress('up')}
          onMouseUp={handleDirectionRelease}
          onMouseLeave={handleDirectionRelease}
          onTouchStart={() => handleDirectionPress('up')}
          onTouchEnd={handleDirectionRelease}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 4L12 20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Left Button */}
        <button
          className={`dpad-button dpad-left ${activeDirection === 'left' ? 'active' : ''}`}
          onMouseDown={() => handleDirectionPress('left')}
          onMouseUp={handleDirectionRelease}
          onMouseLeave={handleDirectionRelease}
          onTouchStart={() => handleDirectionPress('left')}
          onTouchEnd={handleDirectionRelease}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12H4M4 12L10 18M4 12L10 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Right Button */}
        <button
          className={`dpad-button dpad-right ${activeDirection === 'right' ? 'active' : ''}`}
          onMouseDown={() => handleDirectionPress('right')}
          onMouseUp={handleDirectionRelease}
          onMouseLeave={handleDirectionRelease}
          onTouchStart={() => handleDirectionPress('right')}
          onTouchEnd={handleDirectionRelease}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Down Button */}
        <button
          className={`dpad-button dpad-down ${activeDirection === 'down' ? 'active' : ''}`}
          onMouseDown={() => handleDirectionPress('down')}
          onMouseUp={handleDirectionRelease}
          onMouseLeave={handleDirectionRelease}
          onTouchStart={() => handleDirectionPress('down')}
          onTouchEnd={handleDirectionRelease}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 20L12 4M12 20L18 14M12 20L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Center area */}
        <div className="dpad-center"></div>
      </div>
      
      <div className="camera-info">
        <h3>Camera Controls</h3>
        <p>Use the D-pad to control camera movement</p>
        {activeDirection && (
          <div className="active-direction">
            Moving: <span className="direction-text">{activeDirection.toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default CameraController;
