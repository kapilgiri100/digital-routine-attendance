import Header from './common/Header.jsx'
import HODDashboard from './hod/HODDashboard.jsx'
import TeacherDashboard from './teacher/TeacherDashboard.jsx'
import StudentDashboard from './student/StudentDashboard.jsx'

export default function Dashboard({ user, onLogout, teachers, setTeachers, academicYear, onHODNameChange, schedule, setSchedule, attendance, markAttendance, students, addTeacher, removeTeacher, updateTeacher, addStudent, removeStudent, subjects, addSubject, deleteSubject, setAcademicYear }) {
    return (
        <div className="app-container">
            <Header
                user={user}
                onLogout={onLogout}
                teachers={teachers}
                setTeachers={setTeachers}
                academicYear={academicYear}
                onHODNameChange={onHODNameChange}
            />
            <main className="main-content">
                {user.type === 'student' && (
                    <StudentDashboard
                        schedule={schedule}
                        attendance={attendance}
                        user={user}
                        teachers={teachers}
                        subjects={subjects}
                    />
                )}
                {user.type === 'teacher' && (
                    <TeacherDashboard
                        schedule={schedule}
                        attendance={attendance}
                        teachers={teachers}
                        students={students}
                        markAttendance={markAttendance}
                        user={user}
                        subjects={subjects}
                    />
                )}
                {user.type === 'hod' && (
                    <HODDashboard
                        schedule={schedule}
                        setSchedule={setSchedule}
                        teachers={teachers}
                        students={students}
                        addTeacher={addTeacher}
                        removeTeacher={removeTeacher}
                        updateTeacher={updateTeacher}
                        addStudent={addStudent}
                        removeStudent={removeStudent}
                        subjects={subjects}
                        addSubject={addSubject}
                        deleteSubject={deleteSubject}
                        attendance={attendance}
                        academicYear={academicYear}
                        setAcademicYear={setAcademicYear}
                        user={user}
                    />
                )}
            </main>
        </div>
    )
}