import React from 'react';
import Login from '../Login/Login';
import styles from './Modal.module.css'; 

const Modal = ({ isOpen, onClose }) => {
  const handleLoginSuccess = () => {
    onClose(); 
  };

  return (
    <>
      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Please Log In</h2>
            <Login onSuccess={handleLoginSuccess} /> 
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;

