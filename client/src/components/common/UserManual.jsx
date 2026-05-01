import './UserManual.css'

export default function UserManual({ onBack }) {
    return (
        <div className="user-manual">
            <nav className="manual-nav">
                <div className="nav-left">
                    <div className="logo">
                        <span className="logo-text">Group A</span>
                    </div>
                </div>
                <div className="nav-right">
                    <button className="back-btn" onClick={onBack}>← Back to Home</button>
                </div>
            </nav>

            <main className="manual-content">
                <div className="manual-header">
                    <h1>User Manual</h1>
                    <p className="subtitle">Digital Attendance Management System</p>
                </div>

                <div className="manual-sections">
                    <section className="manual-section">
                        <h2> About the Project</h2>
                        <p>
                            The Digital Attendance Management System is a comprehensive web application designed to streamline
                            attendance tracking for educational institutions. This system was developed as a college project
                            by Group A from Mid-West University, Surkhet, Nepal.
                        </p>
                        <p>
                            The application provides an efficient way to manage student attendance, generate reports,
                            and maintain academic records digitally, replacing traditional paper-based attendance systems.
                        </p>
                    </section>

                    <section className="manual-section">
                        <h2> Key Features</h2>
                        <ul>
                            <li><strong>Student Management:</strong> Add, update, and manage student records</li>
                            <li><strong>Teacher Management:</strong> Manage teacher profiles and subject assignments</li>
                            <li><strong>Attendance Tracking:</strong> Mark and record student attendance</li>
                            <li><strong>Schedule Management:</strong> Create and manage class timetables</li>
                            <li><strong>Report Generation:</strong> Generate attendance reports and analytics</li>
                            <li><strong>User Authentication:</strong> Secure login system for different user roles</li>
                        </ul>
                    </section>

                    <section className="manual-section">
                        <h2> User Roles</h2>
                        <div className="roles-grid">
                            <div className="role-card">
                                <h3>Student</h3>
                                <p>Students can view their attendance records and class schedules.</p>
                                <ul>
                                    <li>Login with roll number and date of birth</li>
                                    <li>View personal attendance percentage</li>
                                    <li>Check class timetable</li>
                                </ul>
                            </div>
                            <div className="role-card">
                                <h3>Teacher</h3>
                                <p>Teachers can mark attendance and manage their classes.</p>
                                <ul>
                                    <li>Login with username and password</li>
                                    <li>Mark student attendance</li>
                                    <li>View class schedules</li>
                                    <li>Generate attendance reports</li>
                                </ul>
                            </div>
                            <div className="role-card">
                                <h3>HOD (Head of Department)</h3>
                                <p>Administrators have full system access and management capabilities.</p>
                                <ul>
                                    <li>Manage students and teachers</li>
                                    <li>Create and modify schedules</li>
                                    <li>Configure academic years</li>
                                    <li>Access all system reports</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="manual-section">
                        <h2> Getting Started</h2>
                        <h3>System Setup</h3>
                        <ol>
                            <li>Access the application URL in your web browser</li>
                            <li>If this is the first time, you'll see the system setup page</li>
                            <li>Create the HOD (Head of Department) account</li>
                            <li>Use the HOD credentials to log in and configure the system</li>
                        </ol>

                        <h3>Initial Configuration</h3>
                        <ol>
                            <li><strong>Add Academic Year:</strong> Set up the current academic year</li>
                            <li><strong>Add Subjects:</strong> Create subject records</li>
                            <li><strong>Add Teachers:</strong> Register teachers and assign subjects</li>
                            <li><strong>Add Students:</strong> Register students with their details</li>
                            <li><strong>Create Schedule:</strong> Build the class timetable</li>
                        </ol>
                    </section>

                    <section className="manual-section">
                        <h2> How to Use the System</h2>

                        <h3>For Students:</h3>
                        <ol>
                            <li>Click "Login" on the home page</li>
                            <li>Select "Student" as user type</li>
                            <li>Enter your roll number</li>
                            <li>Enter your date of birth (YYYY-MM-DD format)</li>
                            <li>Click "Login" to access your dashboard</li>
                            <li>View your attendance records and class schedule</li>
                        </ol>

                        <h3>For Teachers:</h3>
                        <ol>
                            <li>Click "Login" on the home page</li>
                            <li>Select "Teacher" as user type</li>
                            <li>Enter your username</li>
                            <li>Enter your password</li>
                            <li>If logging in for the first time, you'll be prompted to set a password</li>
                            <li>Access your dashboard to mark attendance and view reports</li>
                        </ol>

                        <h3>For HOD:</h3>
                        <ol>
                            <li>Click "Login" on the home page</li>
                            <li>Select "HOD" as user type</li>
                            <li>Enter your username and password</li>
                            <li>Access full administrative features</li>
                        </ol>
                    </section>

                    <section className="manual-section">
                        <h2> System Requirements</h2>
                        <div className="requirements">
                            <div className="req-section">
                                <h4>Browser Compatibility:</h4>
                                <ul>
                                    <li>Google Chrome (recommended)</li>
                                    <li>Mozilla Firefox</li>
                                    <li>Microsoft Edge</li>
                                    <li>Safari</li>
                                </ul>
                            </div>
                            <div className="req-section">
                                <h4>Minimum Requirements:</h4>
                                <ul>
                                    <li>Stable internet connection</li>
                                    <li>JavaScript enabled</li>
                                    <li>Modern web browser</li>
                                    <li>Screen resolution: 1024x768 or higher</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="manual-section">
                        <h2>📞 Support & Contact</h2>
                        <p>
                            For technical support or questions about the system, please contact:
                        </p>
                        <div className="contact-details">
                            <p><strong>Email:</strong> groupaproject100@gmail.com</p>
                            <p><strong>Developed by:</strong> Group A, Mid-West University Surkhet, Nepal</p>
                            <p><strong>Project:</strong> College Project 2025</p>
                        </div>
                    </section>

                    <section className="manual-section">
                        <h2> Frequently Asked Questions</h2>
                        <div className="faq">
                            <div className="faq-item">
                                <h4>Q: I forgot my password. What should I do?</h4>
                                <p>A: Contact your HOD or system administrator to reset your password.</p>
                            </div>
                            <div className="faq-item">
                                <h4>Q: How do I mark attendance for absent students?</h4>
                                <p>A: Teachers can mark students as absent by selecting "Absent" in the attendance interface.</p>
                            </div>
                            <div className="faq-item">
                                <h4>Q: Can I view attendance reports?</h4>
                                <p>A: Yes, teachers and HOD can generate and view detailed attendance reports.</p>
                            </div>
                            <div className="faq-item">
                                <h4>Q: How do I update student information?</h4>
                                <p>A: Only HOD can update student and teacher information through the management panels.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}