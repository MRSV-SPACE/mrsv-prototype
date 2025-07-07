import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import SunIcon from '../Dial/icons/Sun.svg';
import CloudyIcon from '../Dial/icons/Cloudy.svg';
import RainyIcon from '../Dial/icons/Rainy.svg';
import RainyThunderIcon from '../Dial/icons/RainyThunder.svg';
import SnowyIcon from '../Dial/icons/Snowy.svg';
import styles from './WeatherDial.module.css';
import Dial from '../Dial';

const WEATHER_TYPES = [
  { 
    id: 'sunny', 
    icon: SunIcon, 
    label: 'Sunny', 
    color: 'yellow',
    intensityLabel: 'UV Index'
  },
  { 
    id: 'rainy', 
    icon: RainyIcon, 
    label: 'Rainy', 
    color: 'blue',
    intensityLabel: 'Rainfall'
  },
  { 
    id: 'cloudy', 
    icon: CloudyIcon, 
    label: 'Cloudy', 
    color: 'gray',
    intensityLabel: 'Cloud Cover'
  },
  { 
    id: 'thunderstorm',
    icon: RainyThunderIcon, 
    label: 'Thunderstorm', 
    color: 'purple',
    intensityLabel: 'Storm Intensity'
  },
  { 
    id: 'snowy', 
    icon: SnowyIcon, 
    label: 'Snowy', 
    color: 'blue',
    intensityLabel: 'Snowfall'
  },
];

const MAX_ITEMS_PER_COLUMN = 3;

const WeatherDial = () => {
  const [selectedWeather, setSelectedWeather] = useState('sunny');
  const [intensity, setIntensity] = useState(10);

  const selectedWeatherData = useMemo(
    () => WEATHER_TYPES.find(w => w.id === selectedWeather) || WEATHER_TYPES[0],
    [selectedWeather]
  );

  const weatherColumns = useMemo(() => {
    const columns = [];
    for (let i = 0; i < WEATHER_TYPES.length; i += MAX_ITEMS_PER_COLUMN) {
      columns.push(WEATHER_TYPES.slice(i, i + MAX_ITEMS_PER_COLUMN));
    }
    return columns;
  }, []);

  return (
    <div className={styles.weatherTheme}>
      <div className={styles.maxWidthWrapper}>
        <div className={styles.weatherLayout}>
          {/* Weather buttons section */}
          <div className={styles.weatherButtonsContainer}>
            {weatherColumns.map((column, columnIndex) => (
              <div key={`column-${columnIndex}`} className={styles.weatherColumn}>
                {column.map((weather) => (
                  <button
                    key={weather.id}
                    onClick={() => setSelectedWeather(weather.id)}
                    className={`${styles.weatherButton} ${
                      selectedWeather === weather.id ? styles.weatherButtonActive : ''
                    } ${styles[weather.color]}`}
                    title={weather.label}
                    aria-label={`Select ${weather.label} weather`}
                  >
                    <div className={styles.weatherButtonIcon}>
                      <img src={weather.icon} alt="" aria-hidden="true" />
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Dial section */}
          <div className={styles.dialContainer}>
            <Dial
              value={intensity}
              onChange={setIntensity}
              min={0}
              max={100}
              icon={selectedWeatherData.icon}
            />
            
            <div className={styles.weatherInfo}>
              <div className={styles.weatherType}>
                {selectedWeatherData.label}
              </div>
              <div className={styles.weatherIntensity}>
                {selectedWeatherData.intensityLabel}: {intensity}%
              </div>
            </div>
          </div>
        </div>

        <div className={styles.weatherInstructions}>
          Click a weather type button, then drag the dial to adjust intensity
        </div>
      </div>
    </div>
  );
};

export default WeatherDial;