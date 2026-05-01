import { useEffect, useCallback } from 'react'
import './Alert.css'

let alertCallback = null

export default function Alert({ message, type = 'info', onClose, duration = 3000 }) {
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [message, duration, handleClose])

  if (!message) return null

  return (
    <div className={`alert-container alert-${type}`}>
      <div className="alert-icon-wrapper">
        {type === 'success' && <span className="alert-icon">✓</span>}
        {type === 'error' && <span className="alert-icon">✕</span>}
        {type === 'warning' && <span className="alert-icon">⚠</span>}
        {type === 'info' && <span className="alert-icon">ℹ</span>}
      </div>
      <span className="alert-text">{message}</span>
      <button className="alert-close-btn" onClick={handleClose}>×</button>
    </div>
  )
}

// Global function to show alerts from anywhere in the app
export function showAlert(message, type = 'info') {
  if (alertCallback) {
    alertCallback(message, type)
  }
}

// Set up the global alert callback (called from App.jsx)
export function setAlertCallback(callback) {
  alertCallback = callback
}

