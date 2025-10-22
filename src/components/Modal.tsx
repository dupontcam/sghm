import React from 'react';
import './Modal.css';

// Aqui definimos as "props" que o Modal aceita
interface ModalProps {
  isOpen: boolean; // <-- A propriedade que estava faltando
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  
  // Se isOpen for falso, o modal não renderiza nada
  if (!isOpen) {
    return null;
  }

  return (
    // O "overlay" (fundo)
    <div className="modal-overlay" onClick={onClose}>
      
      {/* O "content" (caixa branca), parando a propagação do clique */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;

