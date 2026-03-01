import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen, size = 'medium', text = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        <div className={`spinner spinner-${size}`}></div>
        <p className="spinner-text">{text}</p>
      </div>
    );
  }

  return (
    <div className="spinner-container">
      <div className={`spinner spinner-${size}`}></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
