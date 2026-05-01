import { useState } from 'react'
import PasswordChange from './PasswordChange.jsx'
import { showAlert } from './Alert.jsx'
import './Header.css'

export default function Header({ user, onLogout, teachers, setTeachers, academicYear, onHODNameChange }) {
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showNameChange, setShowNameChange] = useState(false)
  const [newHODName, setNewHODName] = useState(user?.name || '')

  // Guard against null/undefined user
  if (!user) {
    return null
  }

  const handleNameChange = () => {
    if (!newHODName.trim()) {
      showAlert('Please enter a valid name', 'error')
      return
    }
    try {
      // API call to update HOD name (add endpoint if needed or use teachers update since HOD is user)
      showAlert('HOD name updated successfully!', 'success')
      setShowNameChange(false)
      if (onHODNameChange) {
        onHODNameChange(newHODName.trim())
      }
      const updatedUser = { ...user, name: newHODName.trim() }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (err) {
      showAlert('Failed to update HOD name', 'error')
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="header-top">
            <div className="header-titles">
              <h1>Graduate School of Engineering</h1>
              <h2>Department of Computer Engineering</h2>
            </div>
            <div className="header-actions">
              {user.type === 'hod' && (
                <button
                  onClick={() => {
                    setNewHODName(user.name)
                    setShowNameChange(true)
                  }}
                  className="name-change-btn"
                >
                  Profile
                </button>
              )}
              {(user.type === 'hod' || user.type === 'teacher') && (
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="password-change-btn"
                >
                  Password
                </button>
              )}
              <button onClick={onLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
          <div className="header-bottom">
            <div className="semester-info">
              Year: {academicYear?.year || 'Not set'} | Semester: {academicYear?.semester || 'Not set'}
            </div>
            Role: {user.type.toUpperCase()}
          </div>
        </div>
      </header>

      {showPasswordChange && (
        <PasswordChange
          user={user}
          onClose={() => setShowPasswordChange(false)}
        />
      )}

      {showNameChange && (
        <div className="modal-overlay">
          <div className="modal-content name-change-modal">
            <h3>Change HOD Name</h3>
            <div className="form-group">
              <label>Enter new name:</label>
              <input
                type="text"
                value={newHODName}
                onChange={(e) => setNewHODName(e.target.value)}
                placeholder="Enter HOD name"
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowNameChange(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleNameChange}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
