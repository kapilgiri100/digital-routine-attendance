import DashboardCard from '../common/DashboardCard.jsx'
import ScheduleViewer from '../common/ScheduleViewer.jsx'
import TeacherManager from './TeacherManager.jsx'
import StudentManager from './StudentManager.jsx'
import SubjectManager from './SubjectManager.jsx'
import ScheduleBuilder from './ScheduleBuilder.jsx'
import AttendanceOverview from './AttendanceOverview.jsx'
import AcademicYearManager from './AcademicYearManager.jsx'

export default function HODDashboard(props) {
  const { schedule, teachers } = props

  return (
    <div className="hod-grid">
      <DashboardCard>
        <AcademicYearManager 
          academicYear={props.academicYear} 
          setAcademicYear={props.setAcademicYear} 
        />
      </DashboardCard>
      
      <DashboardCard>
        <SubjectManager 
          subjects={props.subjects}
          addSubject={props.addSubject}
          deleteSubject={props.deleteSubject}
          user={props.user}
        />
      </DashboardCard>
      
      <DashboardCard>
        <TeacherManager 
          teachers={props.teachers} 
          addTeacher={props.addTeacher} 
          removeTeacher={props.removeTeacher}
          updateTeacher={props.updateTeacher}
        />
      </DashboardCard>
      
      <DashboardCard>
        <StudentManager 
          students={props.students} 
          addStudent={props.addStudent} 
          removeStudent={props.removeStudent} 
        />
      </DashboardCard>
      
      <DashboardCard>
        <ScheduleBuilder 
          schedule={schedule} 
          setSchedule={props.setSchedule} 
          teachers={teachers}
          subjects={props.subjects}
        />
      </DashboardCard>
      
      <DashboardCard>
        <ScheduleViewer 
          schedule={schedule} 
          user={props.user}
          teachers={teachers}
          title="Complete Class Schedule"
        />
      </DashboardCard>
      
      <DashboardCard>
        <AttendanceOverview 
          attendance={props.attendance} 
          students={props.students}
          schedule={schedule}
          teachers={teachers}
          subjects={props.subjects}
        />
      </DashboardCard>
    </div>
  )
}

