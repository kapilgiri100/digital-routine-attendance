import { useState, useMemo } from 'react'
import './AttendanceOverview.css'

export default function AttendanceOverview({ attendance, students, schedule, teachers, subjects = [] }) {
  const [selectedSubject, setSelectedSubject] = useState('')

  const isBreakView = selectedSubject === '__break__'

  // Get all days/time slots where selected subject was taught and has attendance data
  const attendanceSlots = useMemo(() => {
    if (!selectedSubject) return []

    const slots = []

    // Loop schedule for subject locations
    Object.entries(schedule).forEach(([dayName, daySchedule]) => {
      Object.entries(daySchedule || {}).forEach(([timeSlot, cell]) => {
        if (isBreakView) {
          if (cell?.type === 'break') {
            slots.push({ dayName, timeSlot })
          }
        } else if (cell.subject === selectedSubject && attendance[dayName]?.[timeSlot]) {
          slots.push({ dayName, timeSlot })
        }
      })
    })

    return slots
  }, [selectedSubject, schedule, attendance, isBreakView])

  // Build attendance data for each student
  const attendanceData = useMemo(() => {
    if (!selectedSubject || !students) return []

    return students.map(student => {
      let presentCount = 0

      attendanceSlots.forEach(({ dayName, timeSlot }) => {
        const attRecord = attendance[dayName]?.[timeSlot]
        const isPresent = attRecord?.data?.[student.roll] === true
        if (isPresent) presentCount++
      })

      const totalClasses = attendanceSlots.length
      const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0

      return {
        roll: student.roll,
        name: student.name,
        present: presentCount,
        total: totalClasses,
        percentage: percentage
      }
    }).sort((a, b) => a.roll - b.roll)
  }, [selectedSubject, students, attendance, attendanceSlots])

  // Calculate summary
  const summary = useMemo(() => {
    if (!attendanceData.length) return { totalClasses: 0, avgAttendance: 0 }

    const totalClasses = attendanceSlots.length
    const totalPresent = attendanceData.reduce((sum, s) => sum + s.present, 0)
    const totalPossible = attendanceData.length * totalClasses
    const avgAttendance = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0

    return { totalClasses, avgAttendance }
  }, [attendanceData, attendanceSlots])

  return (
    <div className="attendance-overview">
      <h3>Attendance Overview</h3>

      {/* Subject Selection */}
      <div className="subject-selector">
        <label>
          Select Subject:
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="subject-select"
          >
            <option value="">Select subject</option>
            <option value="__break__">Breaks</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.name}>{sub.name}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Summary Stats */}
      {selectedSubject && (
        <div className="attendance-summary">
          <div className="summary-stat">
            <span className="stat-label">Total {isBreakView ? 'Breaks' : 'Classes'}</span>
            <span className="stat-value">{summary.totalClasses}</span>
          </div>
          {!isBreakView && (
            <div className="summary-stat">
              <span className="stat-label">Avg. Attendance</span>
              <span className="stat-value">{summary.avgAttendance}%</span>
            </div>
          )}
          {isBreakView && (
            <div className="summary-note">
              Break slots do not have attendance records.
            </div>
          )}
        </div>
      )}

      {/* Attendance Table - Tabular Format */}
      {selectedSubject && attendanceSlots.length > 0 && !isBreakView && (
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Roll No.</th>
                <th>Name</th>
                <th>Present</th>
                <th>Total Classes</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map(student => (
                <tr key={student.roll}>
                  <td className="roll-cell">{student.roll}</td>
                  <td className="name-cell">{student.name}</td>
                  <td className="present-cell">{student.present}</td>
                  <td className="total-cell">{student.total}</td>
                  <td className={`percent-cell ${student.percentage >= 75 ? 'good' : 'low'}`}>
                    {student.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSubject && isBreakView && attendanceSlots.length > 0 && (
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {attendanceSlots.map(slot => (
                <tr key={`${slot.dayName}-${slot.timeSlot}`}>
                  <td>{slot.dayName}</td>
                  <td>{slot.timeSlot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSubject && !isBreakView && attendanceSlots.length === 0 && (
        <p className="no-data">No attendance records found for this subject.</p>
      )}

      {selectedSubject && isBreakView && attendanceSlots.length === 0 && (
        <p className="no-data">No break slots found in the schedule.</p>
      )}

      {!selectedSubject && (
        <p className="instruction">Please select a subject to view the attendance.</p>
      )}
    </div>
  )
}
