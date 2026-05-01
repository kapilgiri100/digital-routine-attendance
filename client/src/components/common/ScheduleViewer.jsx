import { days, parseTime12 } from "../../utils/scheduleUtils.js"
import './ScheduleViewer.css'

export default function ScheduleViewer({ schedule, user, teachers, title = "Class Schedule" }) {
  const currentTeacherId = user?.type === 'teacher' ? user.id : null

  const isMyClass = (day, time) => {
    if (!currentTeacherId) return false
    return schedule[day]?.[time]?.teacherId === currentTeacherId
  }

  const getTeacherName = (teacherId) => {
    if (!teachers || teacherId === undefined || teacherId === null) return ''
    const teacher = teachers.find(t => String(t.id) === String(teacherId))
    return teacher ? teacher.name : ''
  }

  // Get all unique slot labels and sort by time order (earlier first)
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
    <div className="schedule-viewer">
      <h3>{title}</h3>
      {allSlotLabels.length === 0 && (
        <p className="no-slots">No schedule slots available. Generate slots in Schedule Builder first.</p>
      )}
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
            {days.filter(day => day !== 'Sunday').map(day => {
              const daySlots = Object.keys(schedule[day] || {})
              return (
                <tr key={day}>
                  <td className="day-cell">{day}</td>
                  {allSlotLabels.map(slotLabel => {
                    const cell = schedule[day]?.[slotLabel]
                    const isBreak = cell && cell.type === 'break'
                    const myClass = isMyClass(day, slotLabel)
                    const hasClass = cell && !isBreak && cell.subject && cell.teacherId

                    return (
                      <td key={slotLabel}>
                        <div className={`schedule-cell ${hasClass ? 'has-class' : 'empty'} ${myClass ? 'my-class' : ''} ${isBreak ? 'break' : ''}`}>
                          {isBreak ? (
                            <div className="break-name">Break</div>
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
              )
            })}
          </tbody>
        </table>
      </div>

      {user?.type === 'teacher' && (
        <div className="schedule-legend">
          <div className="legend-item">
            <div className="legend-color my-class"></div>
            <span>Your Classes (Green)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color other-class"></div>
            <span>Other Classes</span>
          </div>
        </div>
      )}
    </div>
  )
}

