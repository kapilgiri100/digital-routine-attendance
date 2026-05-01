import DashboardCard from '../common/DashboardCard.jsx'
import ScheduleViewer from '../common/ScheduleViewer.jsx'
import StudentAttendance from './StudentAttendance.jsx'
import './student.css'

export default function StudentDashboard({ schedule, attendance, user, teachers, subjects = [] }) {
  return (
    <div className="student-grid">
      <DashboardCard>
        <ScheduleViewer 
          schedule={schedule} 
          user={user}
          teachers={teachers}  
          title="Weekly Class Schedule"
        />
      </DashboardCard>
      <DashboardCard>
        <StudentAttendance attendance={attendance} schedule={schedule} user={user} subjects={subjects} />
      </DashboardCard>
    </div>
  )
}