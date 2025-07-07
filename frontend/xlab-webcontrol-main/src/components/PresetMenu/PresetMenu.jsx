import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './PresetMenu.module.css';

const MODAL_TYPES = {
  CREATE: 'create',
  EDIT: 'edit',
  DELETE_CONFIRM: 'delete_confirm'
};

const DEFAULT_PRESET_CONFIG = {
  name: '',
  weather: 'sunny',
  timeOfDay: 'morning',
  temperature: 22,
  humidity: 50,
  windSpeed: 5,
  lighting: 'natural',
  ambientSound: 'nature',
  visibility: 'clear'
};

const FORM_FIELDS = {
  weather: {
    type: 'select',
    label: 'Weather',
    options: [
      { value: 'sunny', label: 'Sunny' },
      { value: 'cloudy', label: 'Cloudy' },
      { value: 'rainy', label: 'Rainy' },
      { value: 'snowy', label: 'Snowy' },
      { value: 'foggy', label: 'Foggy' },
      { value: 'stormy', label: 'Stormy' }
    ]
  },
  timeOfDay: {
    type: 'select',
    label: 'Time of Day',
    options: [
      { value: 'dawn', label: 'Dawn' },
      { value: 'morning', label: 'Morning' },
      { value: 'afternoon', label: 'Afternoon' },
      { value: 'evening', label: 'Evening' },
      { value: 'night', label: 'Night' },
      { value: 'midnight', label: 'Midnight' }
    ]
  },
  temperature: {
    type: 'range',
    label: 'Temperature',
    min: -10,
    max: 45,
    unit: '°C'
  },
  humidity: {
    type: 'range',
    label: 'Humidity',
    min: 0,
    max: 100,
    unit: '%'
  },
  windSpeed: {
    type: 'range',
    label: 'Wind Speed',
    min: 0,
    max: 50,
    unit: 'km/h'
  },
  lighting: {
    type: 'select',
    label: 'Lighting',
    options: [
      { value: 'natural', label: 'Natural' },
      { value: 'warm', label: 'Warm' },
      { value: 'cool', label: 'Cool' },
      { value: 'bright', label: 'Bright' },
      { value: 'dim', label: 'Dim' },
      { value: 'vibrant', label: 'Vibrant' },
      { value: 'soft', label: 'Soft' },
      { value: 'dramatic', label: 'Dramatic' }
    ]
  },
  ambientSound: {
    type: 'select',
    label: 'Ambient Sound',
    options: [
      { value: 'nature', label: 'Nature' },
      { value: 'ocean', label: 'Ocean Waves' },
      { value: 'forest', label: 'Forest' },
      { value: 'rain', label: 'Rain' },
      { value: 'urban', label: 'Urban' },
      { value: 'wind', label: 'Wind' },
      { value: 'silence', label: 'Silence' }
    ]
  },
  visibility: {
    type: 'select',
    label: 'Visibility',
    options: [
      { value: 'crystal', label: 'Crystal Clear' },
      { value: 'clear', label: 'Clear' },
      { value: 'hazy', label: 'Hazy' },
      { value: 'misty', label: 'Misty' },
      { value: 'low', label: 'Low Visibility' }
    ]
  }
};

const generateMockPresets = (count = 20) => {
  const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'foggy'];
  const timeOptions = ['morning', 'afternoon', 'evening', 'night'];
  const lightingOptions = ['warm', 'cool', 'bright', 'dim', 'natural', 'vibrant', 'soft', 'focus', 'ambient'];
  const soundOptions = ['nature', 'urban', 'ocean', 'forest', 'rain', 'silence'];
  const visibilityOptions = ['clear', 'hazy', 'misty'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Preset ${i + 1}`,
    config: {
      weather: weatherOptions[i % weatherOptions.length],
      timeOfDay: timeOptions[i % timeOptions.length],
      temperature: 18 + (i % 15),
      humidity: 30 + (i % 40),
      windSpeed: i % 10,
      lighting: lightingOptions[i % lightingOptions.length],
      ambientSound: soundOptions[i % soundOptions.length],
      visibility: visibilityOptions[i % visibilityOptions.length]
    }
  }));
};

const sortPresetsByFavorites = (presets, favorites) => [
  ...presets.filter(p => favorites.includes(p.id)),
  ...presets.filter(p => !favorites.includes(p.id))
];

const usePresetState = (initialPresets = []) => {
  const [presets, setPresets] = useState(initialPresets);
  
  const addPreset = useCallback((preset) => {
    setPresets(prev => [...prev, preset]);
  }, []);
  
  const updatePreset = useCallback((updatedPreset) => {
    setPresets(prev => prev.map(p => 
      p.id === updatedPreset.id ? updatedPreset : p
    ));
  }, []);
  
  const deletePreset = useCallback((presetId) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
  }, []);
  
  return { presets, addPreset, updatePreset, deletePreset };
};

const useModalState = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [editingPreset, setEditingPreset] = useState(null);
  
  const openModal = useCallback((type, preset = null) => {
    setActiveModal(type);
    setEditingPreset(preset);
  }, []);
  
  const closeModal = useCallback(() => {
    setActiveModal(null);
    setEditingPreset(null);
  }, []);
  
  return { activeModal, editingPreset, openModal, closeModal };
};

const useFormState = (initialConfig = DEFAULT_PRESET_CONFIG) => {
  const [formData, setFormData] = useState(initialConfig);
  
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const resetForm = useCallback(() => {
    setFormData(initialConfig);
  }, [initialConfig]);
  
  const populateForm = useCallback((data) => {
    setFormData(data);
  }, []);
  
  return { formData, updateField, resetForm, populateForm };
};

const FormField = ({ field, value, onChange, fieldConfig }) => {
  const { type, label, options, min, max, unit } = fieldConfig;
  
  switch (type) {
    case 'select':
      return (
        <div className={styles.formGroup}>
          <label>{label}</label>
          <select
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className={styles.select}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    case 'range':
      return (
        <div className={styles.formGroup}>
          <label>{label}: {value}{unit}</label>
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(field, parseInt(e.target.value))}
            className={styles.slider}
          />
        </div>
      );
    default:
      return null;
  }
};

const PresetCard = ({ preset, isActive, isFavorite, onSelect, onEdit, onToggleFavorite }) => (
  <div
    className={`${styles.presetCard} ${isActive ? styles.presetCardActive : ''}`}
    onClick={() => onSelect(preset)}
    onDoubleClick={() => onEdit(preset)}
    tabIndex={0}
  >
    <div 
      className={styles.starIcon}
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite(preset.id);
      }}
    >
      {isFavorite ? '⭐' : '☆'}
    </div>
    <div className={styles.presetName}>{preset.name}</div>
    <div 
      className={styles.editIcon}
      onClick={(e) => {
        e.stopPropagation();
        onEdit(preset);
      }}
      title="Edit preset"
    >
      ✏️
    </div>
  </div>
);

const CreatePresetCard = ({ onCreate }) => (
  <div
    className={`${styles.presetCard} ${styles.createCard}`}
    onClick={onCreate}
    tabIndex={0}
  >
    <div className={styles.createIcon}>+</div>
    <div className={styles.presetName}>Create New</div>
  </div>
);

const PresetForm = ({ formData, onFieldChange, onSubmit, onCancel, onDelete, isEditing }) => {
  const isFormValid = formData.name.trim() !== '';
  
  return (
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <h3>{isEditing ? 'Edit Environment Preset' : 'Create New Environment Preset'}</h3>
        <button className={styles.closeButton} onClick={onCancel}>×</button>
      </div>
      
      <div className={styles.modalContent}>
        <div className={styles.formGroup}>
          <label>Preset Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            placeholder="Enter preset name"
            className={styles.input}
          />
        </div>

        <div className={styles.formRow}>
          <FormField
            field="weather"
            value={formData.weather}
            onChange={onFieldChange}
            fieldConfig={FORM_FIELDS.weather}
          />
          <FormField
            field="timeOfDay"
            value={formData.timeOfDay}
            onChange={onFieldChange}
            fieldConfig={FORM_FIELDS.timeOfDay}
          />
        </div>

        <div className={styles.formRow}>
          <FormField
            field="temperature"
            value={formData.temperature}
            onChange={onFieldChange}
            fieldConfig={FORM_FIELDS.temperature}
          />
          <FormField
            field="humidity"
            value={formData.humidity}
            onChange={onFieldChange}
            fieldConfig={FORM_FIELDS.humidity}
          />
        </div>

        <div className={styles.formRow}>
          <FormField
            field="windSpeed"
            value={formData.windSpeed}
            onChange={onFieldChange}
            fieldConfig={FORM_FIELDS.windSpeed}
          />
          <FormField
            field="lighting"
            value={formData.lighting}
            onChange={onFieldChange}
            fieldConfig={FORM_FIELDS.lighting}
          />
        </div>

        <div className={styles.formRow}>
          <FormField
            field="ambientSound"
            value={formData.ambientSound}
            onChange={onFieldChange}
            fieldConfig={FORM_FIELDS.ambientSound}
          />
          <FormField
            field="visibility"
            value={formData.visibility}
            onChange={onFieldChange}
            fieldConfig={FORM_FIELDS.visibility}
          />
        </div>
      </div>

      <div className={styles.modalFooter}>
        <div className={styles.modalFooterLeft}>
          {isEditing && onDelete && (
            <button className={styles.deleteButton} onClick={onDelete}>
              Delete Preset
            </button>
          )}
        </div>
        <div className={styles.modalFooterRight}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button 
            className={styles.saveButton}
            onClick={onSubmit}
            disabled={!isFormValid}
          >
            {isEditing ? 'Update Preset' : 'Save Preset'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ presetName, onConfirm, onCancel }) => (
  <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
    <div className={styles.confirmHeader}>
      <h3>Delete Preset</h3>
    </div>
    <div className={styles.confirmContent}>
      <p>Are you sure you want to delete "{presetName}"?</p>
      <p className={styles.confirmWarning}>This action cannot be undone.</p>
    </div>
    <div className={styles.confirmFooter}>
      <button className={styles.cancelButton} onClick={onCancel}>
        Cancel
      </button>
      <button className={styles.confirmDeleteButton} onClick={onConfirm}>
        Delete
      </button>
    </div>
  </div>
);

const Presets = ({
  onPresetSelect,
  onPresetDelete,
  selectedPresets = [],
  favoritePresets = [],
  onFavoriteToggle,
  initialPresets = null
}) => {
  const mockPresets = useMemo(() => generateMockPresets(20), []);
  const [localPresets, setLocalPresets] = useState(initialPresets || mockPresets);
  const [activePresetId, setActivePresetId] = useState(null);
  const [localFavorites, setLocalFavorites] = useState(favoritePresets);
  const { activeModal, editingPreset, openModal, closeModal } = useModalState();
  const { formData, updateField, resetForm, populateForm } = useFormState();

  useEffect(() => {
    if (initialPresets) {
      setLocalPresets(initialPresets);
    }
  }, [initialPresets]);

  useEffect(() => {
    setLocalFavorites(favoritePresets);
  }, [favoritePresets]);

  const sortedPresets = useMemo(() => 
    sortPresetsByFavorites(localPresets, localFavorites),
    [localPresets, localFavorites]
  );

  const handlePresetSelect = useCallback((preset) => {
    const newActiveId = activePresetId === preset.id ? null : preset.id;
    setActivePresetId(newActiveId);
    onPresetSelect?.(preset, newActiveId === preset.id);
  }, [activePresetId, onPresetSelect]);

  const handleToggleFavorite = useCallback((presetId) => {
    const newFavorites = localFavorites.includes(presetId)
      ? localFavorites.filter(id => id !== presetId)
      : [...localFavorites, presetId];
    
    setLocalFavorites(newFavorites);
    onFavoriteToggle?.(presetId);
  }, [localFavorites, onFavoriteToggle]);

  const handleApplyPreset = useCallback(() => {
    const selectedPresetConfig = localPresets.find(p => p.id === activePresetId)?.config;
    if (selectedPresetConfig) {
      console.log('Applying preset:', selectedPresetConfig);
    }
  }, [activePresetId, localPresets]);

  const handleEditPreset = useCallback((preset) => {
    populateForm({ name: preset.name, ...preset.config });
    openModal(MODAL_TYPES.EDIT, preset);
  }, [populateForm, openModal]);

  const handleCreatePreset = useCallback(() => {
    resetForm();
    openModal(MODAL_TYPES.CREATE);
  }, [resetForm, openModal]);

  const handleFormSubmit = useCallback(() => {
    if (!formData.name.trim()) return;

    if (activeModal === MODAL_TYPES.EDIT && editingPreset) {
      const updatedPreset = {
        ...editingPreset,
        name: formData.name,
        config: { ...formData }
      };
      
      setLocalPresets(prev => prev.map(p => 
        p.id === updatedPreset.id ? updatedPreset : p
      ));
      
      onPresetSelect?.(updatedPreset, true);
    } else if (activeModal === MODAL_TYPES.CREATE) {
      const newPreset = {
        id: Date.now(),
        name: formData.name,
        config: { ...formData }
      };
      
      setLocalPresets(prev => [...prev, newPreset]);
      onPresetSelect?.(newPreset, true);
    }

    resetForm();
    closeModal();
  }, [formData, activeModal, editingPreset, onPresetSelect, resetForm, closeModal]);

  const handleDeletePreset = useCallback(() => {
    if (!editingPreset) {
      closeModal();
      return;
    }

    // Call parent callback first
    onPresetDelete?.(editingPreset.id);
    
    // Then update local state
    setLocalPresets(prev => prev.filter(p => p.id !== editingPreset.id));
    
    // Update favorites if needed
    if (localFavorites.includes(editingPreset.id)) {
      const newFavorites = localFavorites.filter(id => id !== editingPreset.id);
      setLocalFavorites(newFavorites);
      onFavoriteToggle?.(editingPreset.id);
    }
    
    // Clear active preset if it's the one being deleted
    if (activePresetId === editingPreset.id) {
      setActivePresetId(null);
    }
    
    closeModal();
  }, [editingPreset, activePresetId, localFavorites, onPresetDelete, onFavoriteToggle, closeModal]);

  const handleModalClose = useCallback(() => {
    resetForm();
    closeModal();
  }, [resetForm, closeModal]);

  const selectedPresetObj = localPresets.find(p => p.id === activePresetId);

  return (
    <div className={styles.presetsContainer}>
      <div className={styles.presetsHeader}>
        <div className={styles.presetsActions}>
          <button
            className={`${styles.actionButton} ${styles.applyButton}`}
            onClick={handleApplyPreset}
            disabled={!activePresetId}
          >
            Apply
          </button>
        </div>
      </div>

      <div className={styles.scrollContainer}>
        <div className={styles.presetsGrid}>
          {sortedPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isActive={activePresetId === preset.id}
              isFavorite={localFavorites.includes(preset.id)}
              onSelect={handlePresetSelect}
              onEdit={handleEditPreset}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
          <CreatePresetCard onCreate={handleCreatePreset} />
        </div>
      </div>

      {selectedPresetObj && (
        <div className={styles.selectedInfo}>
          <p>{selectedPresetObj.name} selected</p>
        </div>
      )}

      {(activeModal === MODAL_TYPES.CREATE || activeModal === MODAL_TYPES.EDIT) && (
        <div className={styles.modalOverlay} onClick={handleModalClose}>
          <PresetForm
            formData={formData}
            onFieldChange={updateField}
            onSubmit={handleFormSubmit}
            onCancel={handleModalClose}
            onDelete={() => openModal(MODAL_TYPES.DELETE_CONFIRM)}
            isEditing={activeModal === MODAL_TYPES.EDIT}
          />
        </div>
      )}

      {activeModal === MODAL_TYPES.DELETE_CONFIRM && (
        <div className={styles.modalOverlay} onClick={handleModalClose}>
          <DeleteConfirmationModal
            presetName={editingPreset?.name}
            onConfirm={handleDeletePreset}
            onCancel={handleModalClose}
          />
        </div>
      )}
    </div>
  );
};

export default Presets;