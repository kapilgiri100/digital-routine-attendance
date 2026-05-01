import { useState } from 'react'
import { showAlert } from '../common/Alert.jsx'
import './StudentManager.css'

export default function StudentManager({ students, addStudent, removeStudent }) {
  const [roll, setRoll] = useState('')
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!roll || !name || !dob) {
      showAlert('Please fill all fields', 'error')
      return
    }
    setLoading(true)
    try {
      await addStudent(roll, name, dob)
      setRoll('')
      setName('')
      setDob('')
      showAlert('Student added successfully!', 'success')
    } catch (err) {
      console.error(err)
      showAlert(err.message || 'Failed to add student', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (rollNum) => {
    if (!confirm('Are you sure you want to remove this student?')) return
    setLoading(true)
    try {
      await removeStudent(rollNum)
      showAlert('Student removed successfully!', 'success')
    } catch (err) {
      console.error(err)
      showAlert('Failed to remove student', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="student-manager">
      <h3>Students</h3>
      <div className="form-row">
        <input 
          type="number" 
          placeholder="Roll" 
          value={roll} 
          onChange={e => setRoll(e.target.value)} 
          disabled={loading}
        />
        <input 
          placeholder="Name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          disabled={loading}
        />
        <input 
          type="date" 
          value={dob} 
          onChange={e => setDob(e.target.value)} 
          disabled={loading}
        />
        <button onClick={handleAdd} disabled={loading}>
          {loading ? '...' : 'Add'}
        </button>
      </div>
      <ul className="item-list">
        {students.length === 0 ? (
          <li className="empty-message">No students added yet</li>
        ) : (
          students.map(s => (
            <li key={s.roll}>
              <span>Roll {s.roll} – {s.name} – DOB {s.dob}</span>
              <button onClick={() => handleRemove(s.roll)} disabled={loading}>Remove</button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

