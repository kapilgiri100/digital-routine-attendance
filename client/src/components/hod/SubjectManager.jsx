import { useState } from 'react'
import { showAlert } from '../common/Alert.jsx'
import './SubjectManager.css'

export default function SubjectManager({ subjects, addSubject, deleteSubject }) {
  const [newSubject, setNewSubject] = useState('')
  const [loading, setLoading] = useState(false)

  // Debug: log subjects
  console.log('SubjectManager subjects:', subjects)

  const handleAdd = async () => {
    if (!newSubject.trim()) {
      showAlert('Please enter a subject name', 'error')
      return
    }
    setLoading(true)
    try {
      await addSubject(newSubject.trim())
      setNewSubject('')
      showAlert('Subject added successfully!', 'success')
    } catch (err) {
      console.error(err)
      showAlert(err.message || 'Failed to add subject', 'error')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="subject-manager">
      <h3>Subjects ({subjects.length})</h3>
      {console.log('Rendering SubjectManager with subjects:', subjects)}
      <div className="form-row">
        <input
          placeholder="Enter subject name"
          value={newSubject}
          onChange={e => setNewSubject(e.target.value)}
          disabled={loading}
        />
        <button onClick={handleAdd} disabled={loading}>
          {loading ? '...' : 'Add'}
        </button>
      </div>
      <ul className="item-list">
        {subjects.length === 0 ? (
          <li className="empty-message">No subjects added yet</li>
        ) : (
          subjects.map(subject => (
            <li key={subject.id} className="subject-item">
              <span>{subject.name}</span>
              <button
                className="delete-btn"
                onClick={() => {
                  if (confirm(`Delete ${subject.name}?`)) {
                    deleteSubject(subject.id)
                  }
                }}
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

