import { useEffect, useState, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import * as apiService from './api.js'
import LoginPage from './components/auth/LoginPage.jsx'
import WelcomePage from './components/common/WelcomePage.jsx'
import UserManual from './components/common/UserManual.jsx'
import Dashboard from './components/Dashboard.jsx'
import Alert, { setAlertCallback } from './components/common/Alert.jsx'
import { buildEmptySchedule, cleanSchedule } from './utils/scheduleUtils.js'
import './App.css'

function App() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [schedule, setSchedule] = useState(() => buildEmptySchedule())
  const [attendance, setAttendance] = useState({})
  const [academicYear, setAcademicYear] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [alert, setAlert] = useState({ message: '', type: 'info' })

  useEffect(() => {
    setAlertCallback((message, type = 'info') => setAlert({ message, type }))
  }, [])

  const hideAlert = useCallback(() => setAlert({ message: '', type: 'info' }), [])

  // Check if system is initialized on first load
  useEffect(() => {
    const checkSystem = async () => {
      try {
        await apiService.wakeUpServer() // wake server early
        await apiService.checkStatus()
        // System initialized — check for existing session
        const savedUser = localStorage.getItem('user')
        const savedToken = localStorage.getItem('token')
        if (savedUser && savedToken) {
          setCurrentUser(JSON.parse(savedUser))
        }
      } catch {
        // Do nothing
      } finally {
        setLoading(false)
      }
    }
    checkSystem()
  }, [])

  // Navigate to dashboard if user is logged in
  useEffect(() => {
    if (currentUser && !loading) {
      navigate('/dashboard')
    }
  }, [currentUser, loading, navigate])

  const loadData = useCallback(async () => {
    try {
      const [teachersData, studentsData, scheduleData, attendanceData, acadYear, subjectsData] =
        await Promise.all([
          apiService.getTeachers(),
          apiService.getStudents(),
          apiService.getSchedule(),
          apiService.getAttendance(),
          apiService.getAcademicYear().catch(() => null),
          apiService.getSubjects()
        ])
      console.log('Loaded subjects data:', subjectsData)
      setTeachers(teachersData)
      setStudents(studentsData)
      // Clean schedule to remove any orphaned teacher/subject references
      const cleanedSchedule = cleanSchedule(scheduleData || buildEmptySchedule(), teachersData, subjectsData)
      setSchedule(cleanedSchedule)
      setAttendance(attendanceData || {})
      setAcademicYear(acadYear)
      setSubjects(subjectsData || [])
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }, [])

  useEffect(() => {
    if (currentUser) loadData()
  }, [currentUser, loadData])

  const handleLogin = (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setCurrentUser(user)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
    navigate('/login')
  }

  const handleWelcomeLogin = async () => {
    try {
      const { initialized } = await apiService.checkStatus()
      if (!initialized) {
        navigate('/setup')
      } else {
        navigate('/login')
      }
    } catch {
      navigate('/login')
    }
  }

  // Teacher operations
  const addTeacher = async (name, subject, password) => {
    const t = await apiService.addTeacher(name, subject, password)
    setTeachers(prev => [...prev, t])
  }
  const removeTeacher = async (id) => {
    await apiService.deleteTeacher(id)
    setTeachers(prev => prev.filter(x => x.id !== id))
  }
  const updateTeacher = async (id, name, subject) => {
    const t = await apiService.updateTeacher(id, name, subject)
    setTeachers(prev => prev.map(x => x.id === id ? t : x))
  }

  // Student operations
  const addStudent = async (roll, name, dob) => {
    const s = await apiService.addStudent(roll, name, dob)
    setStudents(prev => [...prev, s].sort((a, b) => Number(a.roll) - Number(b.roll)))
  }
  const removeStudent = async (roll) => {
    await apiService.deleteStudent(roll)
    setStudents(prev => prev.filter(s => String(s.roll) !== String(roll)))
  }

  // Attendance
  const markAttendance = async (day, time, rollsPresent) => {
    await apiService.markAttendance(day, time, rollsPresent)
    const updated = await apiService.getAttendance()
    setAttendance(updated)
  }

  // Schedule
  const updateSchedule = async (newSchedule) => {
    await apiService.updateSchedule(newSchedule)
    setSchedule(newSchedule)
  }

  // Academic year
  const updateAcademicYear = async ({ year, semester }) => {
    await apiService.updateAcademicYear({ year, semester })
    setAcademicYear({ year, semester })
  }

  // Subject operations
  const addSubject = async (name) => {
    const s = await apiService.addSubject(name)
    setSubjects(prev => [...prev, s])
  }
  const deleteSubject = async (id) => {
    await apiService.deleteSubject(id)
    setSubjects(prev => prev.filter(s => s.id !== id))
  }

  // ── Render ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Starting up...</p>
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage onLoginClick={handleWelcomeLogin} onManualClick={() => navigate('/manual')} />} />
        <Route path="/login" element={<LoginPage mode="login" onLogin={handleLogin} />} />
        <Route path="/setup" element={<LoginPage mode="setup" onSetupComplete={handleLogin} />} />
        <Route path="/manual" element={<UserManual onBack={() => navigate('/')} />} />
        <Route path="/dashboard" element={
          currentUser ? (
            <Dashboard
              user={currentUser}
              onLogout={handleLogout}
              teachers={teachers}
              setTeachers={setTeachers}
              academicYear={academicYear}
              onHODNameChange={(name) => setCurrentUser(prev => ({ ...prev, name }))}
              schedule={schedule}
              setSchedule={updateSchedule}
              attendance={attendance}
              markAttendance={markAttendance}
              students={students}
              addTeacher={addTeacher}
              removeTeacher={removeTeacher}
              updateTeacher={updateTeacher}
              addStudent={addStudent}
              removeStudent={removeStudent}
              subjects={subjects}
              addSubject={addSubject}
              deleteSubject={deleteSubject}
              setAcademicYear={updateAcademicYear}
            />
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Alert message={alert.message} type={alert.type} onClose={hideAlert} />
    </>
  )
}

export default App
