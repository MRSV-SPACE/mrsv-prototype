import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Dial.module.css';

const DIAL_CONFIG = {
  RADII: {
    OUTER_RING: 0.46,
    TRACK: 0.375,
    INNER_FILL: 0.29,
    INDICATOR: 0.033,
  },
  STROKE_WIDTHS: {
    OUTER_RING: 0.083,
    TRACK: 0.033,
    HIT_AREA: 0.083,
  },
  RESPONSIVE: {
    TABLET_PORTRAIT_BREAKPOINT: 800,
    TABLET_LANDSCAPE_BREAKPOINT: 1300,
    DESKTOP_BREAKPOINT: 1024,
    MIN_HEIGHT_TABLET: 1300,
  },
  INTERACTION: {
    TOLERANCE: 0.04,
    MIN_BUFFER: 0.02,
  },
  ANIMATION_DURATION: '0.15s',
};

const Dial = ({
  value = 10,
  onChange,
  icon,
  label = "",
  min = 0,
  max = 100,
  size = 240,
  className = "",
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [responsiveSize, setResponsiveSize] = useState(size);
  const dialRef = useRef(null);

  const currentValue = onChange ? value : internalValue;
  const setValue = onChange || setInternalValue;

  // Computed values
  const center = responsiveSize / 2;
  const trackRadius = responsiveSize * DIAL_CONFIG.RADII.TRACK;
  const circumference = 2 * Math.PI * trackRadius;
  const progress = (currentValue - min) / (max - min);
  const strokeDashoffset = circumference - progress * circumference;

  // Indicator position
  const indicatorAngle = progress * 360 + 180;
  const indicatorAngleRad = (indicatorAngle - 90) * (Math.PI / 180);
  const indicatorX = center + trackRadius * Math.cos(indicatorAngleRad);
  const indicatorY = center + trackRadius * Math.sin(indicatorAngleRad);

  const calculateAngle = useCallback((clientX, clientY) => {
    if (!dialRef.current) return null;

    const { left, top, width, height } = dialRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    let angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    return (angle - 90 + 360) % 360;
  }, []);

  const isPointInTrackArea = useCallback((clientX, clientY) => {
    if (!dialRef.current) return false;

    const { left, top, width, height } = dialRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distance = Math.sqrt((clientX - centerX) ** 2 + (clientY - centerY) ** 2);

    const tolerance = responsiveSize * DIAL_CONFIG.INTERACTION.TOLERANCE;
    const minBuffer = responsiveSize * DIAL_CONFIG.INTERACTION.MIN_BUFFER;
    const innerRadius = responsiveSize * DIAL_CONFIG.RADII.INNER_FILL;
    
    const minRadius = Math.max(trackRadius - tolerance, innerRadius + minBuffer);
    const maxRadius = trackRadius + tolerance;

    return distance >= minRadius && distance <= maxRadius;
  }, [responsiveSize, trackRadius]);

  const updateValueFromAngle = useCallback((angle) => {
    if (angle === null) return;

    const normalizedAngle = (angle + 360) % 360;
    const angleProgress = normalizedAngle / 360;
    const newValue = Math.max(min, Math.min(max, min + angleProgress * (max - min)));
    setValue(Math.round(newValue));
  }, [min, max, setValue]);

  const handleMove = useCallback((clientX, clientY) => {
    if (!isDragging) return;
    updateValueFromAngle(calculateAngle(clientX, clientY));
  }, [isDragging, calculateAngle, updateValueFromAngle]);

  const handleStart = useCallback((e) => {
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;

    if (!clientX || !clientY || !isPointInTrackArea(clientX, clientY)) return;

    e.preventDefault();
    setIsDragging(true);
    updateValueFromAngle(calculateAngle(clientX, clientY));
  }, [isPointInTrackArea, calculateAngle, updateValueFromAngle]);

  const handleEnd = useCallback(() => setIsDragging(false), []);

  // Global event handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      e.preventDefault();
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  // Responsive sizing
  useEffect(() => {
    const getResponsiveSize = () => {
      if (typeof window === 'undefined') return size;

      const { innerWidth: vw, innerHeight: vh } = window;
      const { 
        TABLET_PORTRAIT_BREAKPOINT, 
        TABLET_LANDSCAPE_BREAKPOINT, 
        DESKTOP_BREAKPOINT,
        MIN_HEIGHT_TABLET 
      } = DIAL_CONFIG.RESPONSIVE;

      // Desktop
      if (vw >= DESKTOP_BREAKPOINT && vh < MIN_HEIGHT_TABLET) return size;
      
      // Tablet portrait
      if (vw <= TABLET_PORTRAIT_BREAKPOINT && vh >= MIN_HEIGHT_TABLET) {
        return Math.min(size * 1.2, vw * 0.6, 300);
      }
      if (vw <= DESKTOP_BREAKPOINT && vh >= MIN_HEIGHT_TABLET) {
        return Math.min(size * 1.3, vw * 0.5, 320);
      }
      
      // Tablet landscape
      if (vw >= TABLET_LANDSCAPE_BREAKPOINT && vh <= TABLET_PORTRAIT_BREAKPOINT) {
        return Math.min(size * 1.1, vh * 0.6, 280);
      }
      if (vw >= TABLET_LANDSCAPE_BREAKPOINT && vh <= DESKTOP_BREAKPOINT) {
        return Math.min(size * 1.2, vh * 0.5, 300);
      }

      // Mobile
      return Math.min(size * 0.8, vw * 0.7, 200);
    };

    const handleResize = () => setResponsiveSize(getResponsiveSize());
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);

  const getSizeClass = () => {
    if (responsiveSize <= 200) return styles.sizeSmall;
    if (responsiveSize <= 280) return styles.sizeMedium;
    return styles.sizeLarge;
  };

  const sharedStyles = {
    transition: `all ${DIAL_CONFIG.ANIMATION_DURATION} ease-in-out`,
    pointerEvents: 'none',
  };

  return (
    <div className={`${styles.dialComponent} ${className}`} role="slider" aria-label={label}>
      <svg
        width={responsiveSize}
        height={responsiveSize}
        viewBox={`0 0 ${responsiveSize} ${responsiveSize}`}
        ref={dialRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className={styles.dialSvg}
        style={{ cursor: 'default' }}
      >
        {/* Outer ring */}
        <circle
          cx={center}
          cy={center}
          r={responsiveSize * DIAL_CONFIG.RADII.OUTER_RING}
          fill="none"
          stroke="#666"
          strokeWidth={responsiveSize * DIAL_CONFIG.STROKE_WIDTHS.OUTER_RING}
        />
        
        {/* Track ring */}
        <circle
          cx={center}
          cy={center}
          r={trackRadius}
          fill="none"
          stroke="#888"
          strokeWidth="2"
        />
        
        {/* Inner fill */}
        <circle
          cx={center}
          cy={center}
          r={responsiveSize * DIAL_CONFIG.RADII.INNER_FILL}
          fill="#f0f0f0"
        />

        {/* Invisible hit area */}
        <circle
          cx={center}
          cy={center}
          r={trackRadius}
          fill="none"
          stroke="transparent"
          strokeWidth={responsiveSize * DIAL_CONFIG.STROKE_WIDTHS.HIT_AREA}
          style={{ cursor: 'pointer' }}
          pointerEvents="stroke"
        />

        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={trackRadius}
          fill="none"
          stroke="#333"
          strokeWidth={responsiveSize * DIAL_CONFIG.STROKE_WIDTHS.TRACK}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(90 ${center} ${center})`}
          style={sharedStyles}
        />

        {/* Icon */}
        {icon && (
          <image
            href={icon}
            x={center - responsiveSize * 0.08}
            y={center - responsiveSize * 0.12}
            width={responsiveSize * 0.16}
            height={responsiveSize * 0.16}
            className={styles.dialIcon}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Indicator dot */}
        <circle
          cx={indicatorX}
          cy={indicatorY}
          r={responsiveSize * DIAL_CONFIG.RADII.INDICATOR}
          fill="#333"
          style={{
            ...sharedStyles,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        />
      </svg>

      {/* Value display */}
      <div
        className={styles.dialTextContainer}
        style={{ width: responsiveSize, height: responsiveSize, pointerEvents: 'none' }}
      >
        <div className={styles.dialTextWrapper}>
          <div className={styles.dialIconSpacer} style={{ height: responsiveSize * 0.2 }} />
          <div
            className={`${styles.dialPercentageText} ${getSizeClass()}`}
            style={{ fontSize: responsiveSize * 0.06, minWidth: responsiveSize * 0.2 }}
          >
            {currentValue}%
          </div>
        </div>
      </div>
    </div>
  );
};

Dial.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  icon: PropTypes.string,
  label: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.number,
  className: PropTypes.string,
};

export default Dial;