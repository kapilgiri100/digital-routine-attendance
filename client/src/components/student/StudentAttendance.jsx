import { useState } from 'react'
import { formatNepalDateTime, getNepalDateFromTimestamp, getCurrentNepalDate } from '../../utils/dateUtils.js'
import './StudentAttendance.css'

export default function StudentAttendance({ attendance, schedule, user, subjects = [] }) {
  const [subject, setSubject] = useState('')
  const [showDetails, setShowDetails] = useState(false)



  /* ----------  2.  build subject-wise attendance for the logged-in student  ---------- */
  const subjectAttendance = {}
  if (subject) {
    // Loop ATTENDANCE records first, then match with schedule for subject
    Object.entries(attendance).forEach(([dayName, daySlots]) => {
      if (dayName === 'Sunday') return

      Object.entries(daySlots || {}).forEach(([timeSlot, attRecord]) => {
        if (attRecord && attRecord.data) {
          // Check if this time slot has our subject in schedule
          const cell = schedule[dayName]?.[timeSlot]
          if (cell && cell.subject === subject) {
            const present = attRecord.data[user.roll] === true || attRecord.data[user.roll] === 'true'

            // Use timestamp for date in Nepal time zone
            const dateKey = attRecord.timestamp ? getNepalDateFromTimestamp(attRecord.timestamp) : getCurrentNepalDate()

            subjectAttendance[dateKey] = present
          }
        }
      })
    })
  }

  const totalClasses = Object.keys(subjectAttendance).length
  const totalPresent = Object.values(subjectAttendance).filter(Boolean).length
  const percentage = totalClasses ? Math.round((totalPresent / totalClasses) * 100) : 0

  /* ----------  3.  render  ---------- */
  return (
    <div className="student-attendance">
      <h3>My Attendance</h3>

      {/* subject selector */}
      <div className="filter">
        <label>
          Select Subject
          <select
            value={subject}
            onChange={e => {
              setSubject(e.target.value)
              setShowDetails(false)
            }}
          >
            <option value="">-- Choose Subject --</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.name}>{sub.name}</option>
            ))}
          </select>
        </label>
      </div>

      {/* summary */}
      {subject && (
        <div className="attendance-summary">
          <h4>{subject}</h4>
          <p>Total Classes: <b>{totalClasses}</b></p>
          <p>Present Days: <b>{totalPresent}</b></p>
          <p>Attendance: <b>{percentage}%</b></p>

          <button onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      )}

      {/* details */}
      {showDetails && (
        <div className="attendance-details">
          {Object.keys(subjectAttendance)
            .sort()
            .reverse()
            .map(date => (
              <div
                key={date}
                className={`slot-chip ${subjectAttendance[date] ? 'present' : 'absent'
                  }`}
              >
                {date} — {subjectAttendance[date] ? 'Present' : 'Absent'}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
