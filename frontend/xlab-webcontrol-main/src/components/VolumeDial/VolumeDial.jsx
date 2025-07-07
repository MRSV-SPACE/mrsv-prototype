import React, { useState } from 'react';
import Dial from '../Dial/Dial'; 
import { VolumeIcon } from '../Dial/icons';  

function VolumeDial({ initialValue = 10, onVolumeChange, ...props }) {
  const [volume, setVolume] = useState(initialValue);
  
  const handleChange = (newValue) => {
    setVolume(newValue);
    if (onVolumeChange) {
      onVolumeChange(newValue);
    }
  };

  return (
    <Dial
      value={volume}
      onChange={handleChange}
      icon={VolumeIcon}
      label="Volume"
      {...props}
    />
  );
}

export default VolumeDial;