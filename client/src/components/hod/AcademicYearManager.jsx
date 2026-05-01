import { useState } from 'react'
import { showAlert } from '../common/Alert.jsx'
import './AcademicYearManager.css'

export default function AcademicYearManager({ academicYear, setAcademicYear }) {
  const [isEditing, setIsEditing] = useState(false)
  const [year, setYear] = useState(academicYear?.year || '2nd')
  const [semester, setSemester] = useState(academicYear?.semester || '4th')
  const [loading, setLoading] = useState(false)

  const years = ['1st', '2nd', '3rd', '4th']
  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']

  const handleSave = async () => {
    setLoading(true)
    try {
      await setAcademicYear({ year, semester })
      setIsEditing(false)
      showAlert('Academic year saved successfully!', 'success')
    } catch (err) {
      console.error(err)
      showAlert('Failed to save academic year', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setYear(academicYear?.year || '2nd')
    setSemester(academicYear?.semester || '4th')
    setIsEditing(false)
  }

  return (
    <div className="academic-year-manager">
      <h3>Academic Year Settings</h3>
      
      {!isEditing ? (
        <div className="current-settings">
          <div className="setting-item">
            <span className="label">Current Year:</span>
            <span className="value">{academicYear?.year || 'Not set'}</span>
          </div>
          <div className="setting-item">
            <span className="label">Current Semester:</span>
            <span className="value">{academicYear?.semester || 'Not set'}</span>
          </div>
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Settings
          </button>
        </div>
      ) : (
        <div className="edit-form">
          <div className="form-group">
            <label>Year:</label>
            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              disabled={loading}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Semester:</label>
            <select 
              value={semester} 
              onChange={(e) => setSemester(e.target.value)}
              disabled={loading}
            >
              {semesters.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button className="cancel-btn" onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
