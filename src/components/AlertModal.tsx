import React from 'react';
import './FeedbackModal.css'; // Reutilizando o mesmo CSS do modal de confirmação

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isHtml?: boolean; // Nova prop opcional para indicar se a mensagem contém HTML
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, title, message, isHtml = false }) => {
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
          {isHtml ? (
            <p dangerouslySetInnerHTML={{ __html: message }} />
          ) : (
            <p>{message}</p>
          )}
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
