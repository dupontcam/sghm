import React from 'react';
import './FeedbackModal.css';

interface FeedbackModalProps {
  isOpen: boolean;
  tipo: 'success' | 'error';
  mensagem: string;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, tipo, mensagem, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className={`feedback-modal-content feedback-${tipo}`} onClick={(e) => e.stopPropagation()}>
        <div className="feedback-modal-header">
          <div className={`feedback-icon feedback-icon-${tipo}`}>
            {tipo === 'success' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
          </div>
          <h3>{tipo === 'success' ? 'Sucesso!' : 'Erro'}</h3>
        </div>
        <div className="feedback-modal-body">
          <p>{mensagem}</p>
        </div>
        <div className="feedback-modal-footer">
          <button className={`btn btn-${tipo}`} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
