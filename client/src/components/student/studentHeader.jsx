export default function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-top">
          <div>
         <center>   <h1>Graduate School of Engineering</h1>
            <h2>Department of Computer Engineering</h2></center>
          </div>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
        <div className="header-bottom">
          <div className="semester-info">Year: 2nd | Semester: 4th</div>
          <div className="role-info">Role: {user.type.toUpperCase()}</div>
        </div>
      </div>
    </header>
  )
}
