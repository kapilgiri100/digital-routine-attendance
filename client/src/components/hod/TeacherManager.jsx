import { useState } from 'react'
import { showAlert } from '../common/Alert.jsx'
import './TeacherManager.css'

export default function TeacherManager({ teachers, addTeacher, removeTeacher, updateTeacher }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) {
      showAlert('Please enter teacher name', 'error')
      return
    }
    setLoading(true)
    try {
      await addTeacher(name.trim(), '', name.trim().toLowerCase().replace(/\s+/g, ''))
      setName('')
      showAlert('Teacher added! Login with teacher name as password (first-time setup)', 'success')
    } catch (err) {
      console.error(err)
      showAlert('Failed to add teacher', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id) => {
    if (!confirm('Are you sure you want to remove this teacher?')) return
    setLoading(true)
    try {
      await removeTeacher(id)
      showAlert('Teacher removed successfully!', 'success')
    } catch (err) {
      console.error(err)
      showAlert('Failed to remove teacher', 'error')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (teacher) => {
    const newName = prompt('Enter new teacher name:', teacher.name)
    if (newName && newName.trim() !== teacher.name) {
      updateTeacher(teacher.id, newName.trim(), '')
        .then(() => showAlert('Teacher name updated!', 'success'))
        .catch(err => {
          console.error(err)
          showAlert('Failed to update teacher', 'error')
        })
    }
  }

  return (
    <div className="teacher-manager">
      <h3>Teachers</h3>
      <div className="form-row">
        <input
          placeholder="Teacher name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
        />
        <button onClick={handleAdd} disabled={loading}>
          {loading ? '...' : '+ Add Teacher'}
        </button>
      </div>
      <ul className="item-list">
        {teachers.length === 0 ? (
          <li className="empty-message">No teachers added yet</li>
        ) : (
          teachers.map(t => (
            <li key={t.id} className="teacher-item">
              <span className="teacher-info">{t.name}</span>
              <div className="teacher-actions">
                <button
                  onClick={() => startEditing(t)}
                  disabled={loading}
                  className="btn-edit"
                >
                  Edit Name
                </button>
                <button
                  onClick={() => handleRemove(t.id)}
                  disabled={loading}
                  className="btn-remove"
                >
                  Remove
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
