import React, { useState, useEffect } from 'react'
import './UserProfile.css'

const UserProfile = ({ isOpen, onClose, user, onLogout }) => {
  const [profileData, setProfileData] = useState(user)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      fetchFullProfile()
    }
  }, [isOpen, user])

  const fetchFullProfile = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5001/api/auth/profile/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen || !user) return null

  return (
    <div className="modal-overlay">
      <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <div className="header-content">
            <h2>User Profile</h2>
            <p className="profile-subtitle">Account Information</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="profile-body">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading profile...</p>
            </div>
          ) : (
            <>
              <div className="profile-avatar">
                <div className="avatar-circle">
                  {profileData?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="user-name">{profileData?.name || 'Unknown User'}</h3>
                <p className="user-id">ID: {profileData?.apdcl_id}</p>
              </div>
              
              <div className="profile-info">
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-icon">🆔</div>
                    <div className="info-content">
                      <label>APDCL ID</label>
                      <span className="info-value">{profileData?.apdcl_id || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">👤</div>
                    <div className="info-content">
                      <label>Full Name</label>
                      <span className="info-value">{profileData?.name || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">📧</div>
                    <div className="info-content">
                      <label>Email Address</label>
                      <span className="info-value">{profileData?.email || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">📱</div>
                    <div className="info-content">
                      <label>Phone Number</label>
                      <span className="info-value">{profileData?.phone || 'Not provided'}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">🏢</div>
                    <div className="info-content">
                      <label>Department</label>
                      <span className="info-value">{profileData?.department || 'Not specified'}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">📅</div>
                    <div className="info-content">
                      <label>Account Created</label>
                      <span className="info-value">{formatDate(profileData?.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="profile-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-danger" onClick={onLogout}>
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
