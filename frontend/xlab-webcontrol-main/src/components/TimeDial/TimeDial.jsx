import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { throttle } from 'lodash';
import PropTypes from 'prop-types';
import styles from './TimeDial.module.css';
import Night from './icons/Night.svg';
import Sun from './icons/Sun.svg';
import Sunset from './icons/Sunset.svg';
import Sunrise from './icons/Sunrise.svg';

const TimeDial = ({ initialTime = { hours: 6, minutes: 45 }, onTimeChange }) => {
  const [time, setTime] = useState(initialTime);
  const [isDragging, setIsDragging] = useState(false);
  const clockRef = useRef(null);

  // Constants
  const MINUTES_IN_DAY = 1440;
  const DEGREES_PER_MINUTE = 360 / MINUTES_IN_DAY;
  const HAND_LENGTH = 110;
  const INTERACTION_RADIUS = 30;

  // Convert angle to time (snapped to 5-minute intervals)
  const angleToTime = useCallback((angle) => {
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const totalMinutes = Math.round((normalizedAngle / 360) * MINUTES_IN_DAY);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = Math.round((totalMinutes % 60) / 5) * 5;
    
    return { hours, minutes };
  }, []);

  // Get angle from center to pointer position
  const getAngleFromCenter = useCallback((clientX, clientY) => {
    if (!clockRef.current) return 0;
    
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    return (angle + 360) % 360;
  }, []);

  // Check if pointer is near minute hand tip
  const isNearMinuteHand = useCallback((clientX, clientY) => {
    if (!clockRef.current) return false;
    
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const minuteAngle = (time.hours * 60 + time.minutes) * DEGREES_PER_MINUTE;
    const handX = centerX + Math.sin((minuteAngle * Math.PI) / 180) * HAND_LENGTH;
    const handY = centerY - Math.cos((minuteAngle * Math.PI) / 180) * HAND_LENGTH;
    
    const distance = Math.sqrt((clientX - handX) ** 2 + (clientY - handY) ** 2);
    return distance <= INTERACTION_RADIUS;
  }, [time.hours, time.minutes]);

  // Time period calculation
  const timePeriod = useMemo(() => {
    const { hours } = time;
    if (hours >= 6 && hours < 12) return 'morning';
    if (hours >= 12 && hours < 18) return 'afternoon';
    if (hours >= 18 && hours < 21) return 'evening';
    return 'night';
  }, [time]);

  // Derived values
  const { totalMinutes, minuteAngle, hourAngle, progressPercent } = useMemo(() => {
    const totalMinutes = time.hours * 60 + time.minutes;
    return {
      totalMinutes,
      minuteAngle: totalMinutes * DEGREES_PER_MINUTE,
      hourAngle: (time.hours % 12) * 30 + (time.minutes * 0.5),
      progressPercent: (totalMinutes / MINUTES_IN_DAY) * 100
    };
  }, [time]);

  // Event handlers
  const handleStart = useCallback((clientX, clientY) => {
    if (isNearMinuteHand(clientX, clientY)) {
      setIsDragging(true);
      const angle = getAngleFromCenter(clientX, clientY);
      const newTime = angleToTime(angle);
      setTime(newTime);
      onTimeChange?.(newTime);
    }
  }, [isNearMinuteHand, getAngleFromCenter, angleToTime, onTimeChange]);

// Define throttled fetch function
const throttledUpdateTime = useMemo(() => throttle((newTime) => {
  fetch('http://localhost:5000/api/update-time', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTime),
  }).then(res => {
    if (!res.ok) {
      console.error("Failed to update time:", res.statusText);
    }
  }).catch(err => {
    console.error("Network error when updating time:", err);
  });
}, 1000), []);  // throttles to once per 1000ms

// Define throttled fetch function
const throttledUpdateTimeDirect = useMemo(() => throttle((newTime) => {
  fetch('http://localhost:30010/remote/preset/MyRemote/property/Time of Day', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
    propertyValue: newTime.hours,
    generateTransaction: true
  }),

  }).then(res => {
    if (!res.ok) {
      console.error("Failed to update time:", res.statusText);
    }
  }).catch(err => {
    console.error("Network error when updating time:", err);
  });
}, 500), []);  // throttles to once per 1000ms



  const handleMove = useCallback((clientX, clientY) => {
    if (!isDragging) return;
    
    const angle = getAngleFromCenter(clientX, clientY);
    const newTime = angleToTime(angle);
    
    if (newTime.hours !== time.hours || newTime.minutes !== time.minutes) {
      setTime(newTime);
      onTimeChange?.(newTime);
      throttledUpdateTime(newTime);
    }
  }, [isDragging, time, getAngleFromCenter, angleToTime, onTimeChange]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const handleMouseMove = useCallback((e) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  // Touch event handlers
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touch && handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touch && handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  // Event listener setup
  useEffect(() => {
    if (!isDragging) return;

    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    return cleanup;
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  // Format time display
  const formattedTime = useMemo(() => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
  }, [time]);

  // Hour markers
  const hourMarkers = useMemo(() => (
    Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 30) - 90;
      const radius = 65;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      
      return (
        <div
          key={i}
          className={styles.hourMarker}
          style={{
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
          }}
        />
      );
    })
  ), []);

  return (
    <div className={styles.timeDialContainer}>
      <div 
        ref={clockRef}
        className={styles.clockFace}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Gradient progress ring */}
        <div className={styles.progressRing}>
          <svg className={styles.progressSvg} viewBox="0 0 200 200">
            <defs>
              <linearGradient id="timeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="25%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#dc2626" />
                <stop offset="75%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="url(#timeGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 85}`}
              strokeDashoffset={`${2 * Math.PI * 85 * (1 - progressPercent / 100)}`}
              transform="rotate(-90 100 100)"
            />
          </svg>
        </div>

        {/* Time period indicators */}
        <div className={`${styles.timePeriodIndicator} ${styles.morningIndicator}`}>
          <img src={Sun} alt="Morning" width={16} />
        </div>
        <div className={`${styles.timePeriodIndicator} ${styles.afternoonIndicator}`}>
          <img src={Sunset} alt="Sunset" width={16} />
        </div>
        <div className={`${styles.timePeriodIndicator} ${styles.eveningIndicator}`}>
          <img src={Night} alt="Night" width={16} />
        </div>
        <div className={`${styles.timePeriodIndicator} ${styles.nightIndicator}`}>
          <img src={Sunrise} alt="Sunrise" width={16} />
        </div>

        <div className={styles.clockInner}>
          {/* Hour markers */}
          {hourMarkers}

          {/* Clock hands */}
          <div className={styles.clockHands}>
            <div
              className={styles.hourHand}
              style={{ 
                '--rotation': `${hourAngle}deg`
              }}
            />
            <div
              className={`${styles.minuteHand} ${isDragging ? styles.dragging : ''}`}
              style={{ 
                '--rotation': `${minuteAngle}deg`
              }}
            />
            <div className={styles.centerDot} />
          </div>
                </div>
                </div>
            <div className={styles.timeDisplay}>
              <div className={styles.digitalTime}>{formattedTime}</div>
          </div>
        </div>
      );
    };

TimeDial.propTypes = {
  initialTime: PropTypes.shape({
    hours: PropTypes.number,
    minutes: PropTypes.number
  }),
  onTimeChange: PropTypes.func
};

export default TimeDial;