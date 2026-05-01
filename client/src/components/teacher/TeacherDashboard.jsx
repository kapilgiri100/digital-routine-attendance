import DashboardCard from '../common/DashboardCard.jsx'
import TakeAttendance from './TakeAttendance.jsx'
import ViewAttendance from './ViewAttendance.jsx'
import { days, parseTime12 } from '../../utils/scheduleUtils.js'
import { getCurrentNepalDate, getNepalDayOfWeek } from '../../utils/dateUtils.js'
import './teacher.css'

export default function TeacherDashboard({
  schedule,
  attendance,
  students,
  markAttendance,
  user,
  teachers
}) {
  // Calculate summary stats (dynamic)
  const todayDate = getCurrentNepalDate()
  const todayName = getNepalDayOfWeek(todayDate)

  const myClassesToday = Object.values(schedule[todayName] || {})
    .filter(slot => slot.teacherId === user.id).length

  const myClassesTotal = Object.values(schedule).reduce(
    (acc, day) => acc + Object.values(day).filter(slot => slot.teacherId === user.id).length,
    0
  )

  const getTeacherName = (teacherId) => {
    if (!teachers || teacherId === undefined || teacherId === null) return ''
    const teacher = teachers.find(t => String(t.id) === String(teacherId))
    return teacher ? teacher.name : ''
  }

  const isMyClass = (day, time) => {
    return String(schedule[day]?.[time]?.teacherId) === String(user.id)
  }

  // Get all unique slot labels and sort by time order (earlier first) - FIX
  const allSlotLabels = Array.from(new Set(
    Object.values(schedule || {}).flatMap(daySlots =>
      Object.keys(daySlots || {})
    )
  )).map(label => {
    // Parse start time from label like "9:00 AM - 10:45 AM" -> minutes
    const timeMatch = label.match(/(\d+:\d+ [AP]M)/);
    if (timeMatch) {
      return { label, time: parseTime12(timeMatch[1]) };
    }
    return { label, time: 0 };
  }).sort((a, b) => a.time - b.time).map(item => item.label)

  return (
    <div className="teacher-grid">
      <DashboardCard>
        <div className="teacher-schedule-card">
          <div className="schedule-header">
            <h3>My Teaching Schedule</h3>
            <div className="schedule-summary">
              <span className="summary-item">
                <strong>Today:</strong> {myClassesToday} classes
              </span>
              <span className="summary-item">
                <strong>Week:</strong> {myClassesTotal} classes
              </span>
            </div>
          </div>

          <div className="schedule-legend">
            <div className="legend-item">
              <div className="legend-color my-class"></div>
              <span>Your Classes</span>
            </div>
            <div className="legend-item">
              <div className="legend-color other-class"></div>
              <span>Other Classes</span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Day / Time</th>
                  {allSlotLabels.map(slotLabel => (
                    <th key={slotLabel}>{slotLabel}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.filter(day => day !== 'Sunday').map(day => (
                  <tr key={day}>
                    <td className="day-cell">{day}</td>
                    {allSlotLabels.map(time => {
                      const cell = schedule[day]?.[time]
                      const isBreak = cell?.type === 'break'
                      const myClass = !isBreak && isMyClass(day, time)
                      const hasClass = cell && !isBreak && cell.subject && cell.teacherId

                      return (
                        <td key={time}>
                          <div className={`schedule-cell ${hasClass ? 'has-class' : 'empty'} ${myClass ? 'my-class' : ''} ${isBreak ? 'break' : ''}`}>
                            {isBreak ? (
                              <span className="break-label">Break</span>
                            ) : cell && cell.subject ? (
                              <>
                                <div className="subject-name">{cell.subject}</div>
                                <div className="teacher-name">{getTeacherName(cell.teacherId)}</div>
                              </>
                            ) : (
                              <span className="break-label">-</span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard>
        <TakeAttendance
          schedule={schedule}
          attendance={attendance}
          students={students}
          markAttendance={markAttendance}
          user={user}
        />
      </DashboardCard>

      <DashboardCard>
        <ViewAttendance
          attendance={attendance}
          students={students}
          schedule={schedule}
          user={user}
        />
      </DashboardCard>
    </div>
  )
}

