import { useState, useEffect } from 'react'
import { days } from '../../utils/scheduleUtils.js'
import { showAlert } from '../common/Alert.jsx'
import { getCurrentNepalDate, formatNepalDateTime, getNepalDayOfWeek } from '../../utils/dateUtils.js'
import './TakeAttendance.css'

export default function TakeAttendance({ schedule, students, markAttendance, user, attendance }) {
  const [selectedSubject, setSelectedSubject] = useState('')
  const [date, setDate] = useState(getCurrentNepalDate())
  const [selectedTime, setSelectedTime] = useState('')
  const [presentRolls, setPresentRolls] = useState({})
  const [loading, setLoading] = useState(false)
  const [existingAttendance, setExistingAttendance] = useState(null)

  const dayName = getNepalDayOfWeek(date)

  // Get teacher's own schedule slots for selected subject
  const teacherSlots = schedule[dayName] || {}
  const mySubjectSlots = Object.entries(teacherSlots)
    .filter(([_, cell]) => cell.teacherId === user.id && cell.subject === selectedSubject)
    .map(([time, cell]) => ({ time, ...cell }))

  const breakSlotsToday = Object.entries(teacherSlots)
    .filter(([_, cell]) => cell?.type === 'break')
    .map(([time]) => time)

  // Load existing attendance when date/time changes
  useEffect(() => {
    if (date && selectedTime) {
      const existing = attendance[dayName]?.[selectedTime]
      if (existing) {
        setExistingAttendance(existing)
        // Load present rolls from existing data
        const loadedPresent = {}
        students.forEach(st => {
          loadedPresent[st.roll] = existing.data[st.roll] || false
        })
        setPresentRolls(loadedPresent)
      } else {
        setExistingAttendance(null)
        // Reset to all absent
        const resetPresent = {}
        students.forEach(st => {
          resetPresent[st.roll] = false
        })
        setPresentRolls(resetPresent)
      }
    }
  }, [date, selectedTime, students, attendance, dayName])

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject)
    setSelectedTime('')
    setPresentRolls({})
  }

  const toggleStudent = (roll) => {
    setPresentRolls(prev => ({
      ...prev,
      [roll]: !prev[roll]
    }))
  }

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedTime || !date) {
      showAlert('Please select subject, date and time', 'error')
      return
    }

    setLoading(true)
    try {
      const presentRollsArray = Object.keys(presentRolls).filter(roll => presentRolls[roll] === true)
      await markAttendance(dayName, selectedTime, presentRollsArray)
      showAlert(`Attendance saved for ${selectedSubject} at ${selectedTime} (${existingAttendance ? 'Updated' : 'New'})`, 'success')
    } catch (err) {
      showAlert('Failed to save attendance', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Get unique teacher's subjects from schedule
  const teacherSubjects = new Set()
  Object.values(schedule).forEach(daySlots => {
    Object.values(daySlots).forEach(slot => {
      if (slot.teacherId === user.id) {
        teacherSubjects.add(slot.subject)
      }
    })
  })
  const subjectList = Array.from(teacherSubjects)

  return (
    <div className="take-attendance">
      <h3>📝 Take Attendance</h3>

      {students.length === 0 && (
        <div className="no-students">
          <p>No students added yet. HOD must add students first.</p>
        </div>
      )}

      {students.length > 0 && (
        <>
          <div className="attendance-form">
            <div className="form-group">
              <label>Select Subject *</label>
              <select
                value={selectedSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                disabled={loading}
              >
                <option value="">Choose your subject</option>
                {subjectList.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {selectedSubject && (
              <>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Time Slot *</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Choose time slot</option>
                    {mySubjectSlots.map(slot => (
                      <option key={slot.time} value={slot.time}>
                        {slot.time} ({dayName})
                      </option>
                    ))}
                  </select>
                  {mySubjectSlots.length === 0 && (
                    <p className="no-slots">No classes scheduled for {selectedSubject} on {dayName}</p>
                  )}
                </div>
                {breakSlotsToday.length > 0 && (
                  <div className="form-group break-list">
                    <label>Break Slots on {dayName}:</label>
                    <div className="break-times">
                      {breakSlotsToday.map(time => (
                        <span key={time} className="break-label">{time}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedTime && (
              <div className="attendance-status">
                {existingAttendance ? (
                  <p className="edit-mode">
                    ✏️ Edit mode - Last updated: {formatNepalDateTime(existingAttendance.timestamp)}
                  </p>
                ) : (
                  <p className="new-mode">➕ New attendance entry</p>
                )}
              </div>
            )}
          </div>

          {selectedTime && students.length > 0 && (
            <div className="students-section">
              <div className="students-header">
                <h4>Students ({Object.keys(presentRolls).length}/{students.length})</h4>
                <span className="present-count">
                  Present: {Object.values(presentRolls).filter(Boolean).length}
                </span>
              </div>
              <div className="roll-grid">
                {students.map(student => (
                  <label key={student.roll} className={`roll-chip ${presentRolls[student.roll] ? 'present' : 'absent'}`}>
                    <input
                      type="checkbox"
                      checked={presentRolls[student.roll] || false}
                      onChange={() => toggleStudent(student.roll)}
                      disabled={loading}
                    />
                    <span>{student.roll}</span>
                    <span>{student.name}</span>
                  </label>
                ))}
              </div>
              <div className="submit-section">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? 'Saving...' : (existingAttendance ? 'Update Attendance' : 'Submit Attendance')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
