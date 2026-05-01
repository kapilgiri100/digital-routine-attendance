export default function DashboardCard({ children, className = '' }) {
  return <div className={`dashboard-card ${className}`}>{children}</div>
}