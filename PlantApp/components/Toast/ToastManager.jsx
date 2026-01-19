import React, { useState } from 'react';
import Toast from './Toast';

let showToastRef = null;

const ToastManager = () => {
  const [toast, setToast] = useState(null);

  const showToast = ({ message, type, duration }) => {
    setToast({ text1: message, type, duration });
  };

  showToastRef = showToast;

  const hideToast = () => {
    setToast(null);
  };

  return toast ? (
    <Toast
      text1={toast.text1}
      type={toast.type}
      duration={toast.duration}
      onHide={hideToast}
    />
  ) : null;
};

ToastManager.show = ({ message, type = 'info', duration = 3000 }) => {
  if (showToastRef) {
    showToastRef({ message, type, duration });
  }
};

export default ToastManager;