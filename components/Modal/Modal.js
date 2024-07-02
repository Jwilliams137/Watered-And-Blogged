import React from 'react';
import Login from '../Login/Login';
import styles from './Modal.module.css'; // Adjust path as per your project structure

const Modal = ({ isOpen, onClose }) => {
  const handleLoginSuccess = () => {
    onClose(); // Close the modal after successful login
  };

  return (
    <>
      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Please Log In</h2>
            <Login onSuccess={handleLoginSuccess} /> {/* Pass onSuccess prop to Login component */}
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;

