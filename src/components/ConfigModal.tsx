import React, { useState, useEffect } from 'react';
import './ConfigModal.css';
import { X } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  initialApiKey?: string;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onSave, initialApiKey = '' }) => {
  const [apiKey, setApiKey] = useState(initialApiKey);

  useEffect(() => {
    setApiKey(initialApiKey);
  }, [initialApiKey, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(apiKey.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>API Configuration</h2>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="apiKey">Gemini API Key</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              required
              className="modal-input"
            />
            <p className="help-text">
              Your key is saved in session storage and will be cleared when you close the tab.
              Get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn">Save Key</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigModal;
