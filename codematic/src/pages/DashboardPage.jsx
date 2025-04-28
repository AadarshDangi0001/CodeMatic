import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const goToChatbot = () => {
    navigate('/chatbot')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Welcome, {currentUser?.email}</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Dashboard</h3>
          <p>This is your main dashboard. From here you can access all the features of the application.</p>
          <button onClick={goToChatbot} className="primary-button">Go to Chatbot</button>
        </div>

        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {[1, 2, 3].map((item) => (
              <div key={item} className="activity-item">
                <p>Activity {item}</p>
                <p className="activity-description">Sample activity description</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}