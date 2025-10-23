import React from 'react';
import './FeedbackModal.css'; // Reutilizando o mesmo CSS do modal de confirmação

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-modal-header">
          <h2>{title}</h2>
          <button className="feedback-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="feedback-modal-body">
          <p>{message}</p>
        </div>
        <div className="feedback-modal-footer" style={{ justifyContent: 'flex-end' }}>
          {/* Apenas um botão de "OK" */}
          <button className="btn btn-primary" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
