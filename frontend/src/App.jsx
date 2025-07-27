import React, { useState, useEffect } from 'react'
import FileTable from './components/FileTable'
import CreateFileModal from './components/CreateFileModal'
import ActionModal from './components/ActionModal'
import Login from './components/Login'
import Signup from './components/Signup'
import UserProfile from './components/UserProfile'
import './App.css'

function App() {
  const [files, setFiles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [actionModal, setActionModal] = useState({ isOpen: false, file: null, action: null })
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [actionType, setActionType] = useState('')
  const [error, setError] = useState('')

  const API_BASE_URL = 'http://localhost:5001/api'

  // Fetch files from backend
  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/files`)
      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }
      const data = await response.json()
      setFiles(data)
      setError('')
    } catch (err) {
      console.error('Error fetching files:', err)
      setError('Failed to load files. Please check if the server is running.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`)
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  // Auto-refresh files every 2 minutes
  useEffect(() => {
    // Check if user is already logged in with session validation
    const checkUserSession = () => {
      const userSession = localStorage.getItem('userSession')
      const savedUser = localStorage.getItem('user')
      
      if (userSession) {
        try {
          const sessionData = JSON.parse(userSession)
          const now = new Date()
          const expiresAt = new Date(sessionData.expiresAt)
          
          if (now < expiresAt) {
            // Session is still valid
            setUser(sessionData.user)
            return
          } else {
            // Session expired, clear storage
            localStorage.removeItem('userSession')
            localStorage.removeItem('user')
          }
        } catch (err) {
          console.error('Error parsing user session:', err)
          localStorage.removeItem('userSession')
        }
      } else if (savedUser) {
        // Fallback to old user storage (for backward compatibility)
        try {
          setUser(JSON.parse(savedUser))
        } catch (err) {
          console.error('Error parsing saved user:', err)
          localStorage.removeItem('user')
        }
      }
    }
    
    checkUserSession()
  }, [])

  useEffect(() => {
    if (user) {
      fetchFiles()
      fetchUsers()
      
      // Set up auto-refresh every 2 minutes
      const interval = setInterval(() => {
        fetchFiles()
      }, 120000) // 2 minutes
      
      return () => clearInterval(interval)
    }
  }, [user])

  const handleCreateFile = async (fileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fileData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create file')
      }
      
      await fetchFiles() // Refresh the list
      setCreateModalOpen(false)
      setError('')
    } catch (err) {
      console.error('Error creating file:', err)
      // Re-throw the error so the modal can handle it
      throw err
    }
  }

  const handleFileAction = async (actionData) => {
    try {
      let endpoint = ''
      let method = 'PUT'
      
      switch (actionType) {
        case 'move':
          endpoint = `${API_BASE_URL}/files/${selectedFile.file_id}/move`
          break
        case 'receive':
          endpoint = `${API_BASE_URL}/files/${selectedFile.file_id}/receive`
          break
        case 'close':
          endpoint = `${API_BASE_URL}/files/${selectedFile.file_id}/close`
          break
        default:
          throw new Error('Invalid action type')
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${actionType} file`)
      }
      
      await fetchFiles() // Refresh the list
      setActionModal({ isOpen: false, file: null, action: null })
      setSelectedFile(null)
      setActionType('')
      setError('')
    } catch (err) {
      console.error(`Error ${actionType} file:`, err)
      setError(err.message)
    }
  }

  const openActionModal = (file, action) => {
    setSelectedFile(file)
    setActionType(action)
    setActionModal({ isOpen: true, file, action })
  }

  const closeActionModal = () => {
    setActionModal({ isOpen: false, file: null, action: null })
  }

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userSession')
    setUser(null)
    setProfileModalOpen(false)
    setFiles([])
    setUsers([])
  }

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login')
  }

  // Show authentication if user is not logged in
  if (!user) {
    return (
      <div className="App">
        {authMode === 'login' ? (
          <Login onLogin={handleLogin} onSwitchToSignup={switchAuthMode} />
        ) : (
          <Signup onSwitchToLogin={switchAuthMode} />
        )}
      </div>
    )
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>APDCL File Tracking & Management System</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setCreateModalOpen(true)}
          >
            Create File
          </button>
          <button 
            className="user-profile-btn"
            onClick={() => setProfileModalOpen(true)}
            title="Click to view profile"
          >
            <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
            <div className="user-profile-text">
              <span className="user-profile-name">{user.name}</span>
              <span className="user-profile-role">APDCL User</span>
            </div>
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <main className="app-main">
        <FileTable 
          files={files}
          loading={loading}
          onAction={openActionModal}
          onRefresh={fetchFiles}
        />
      </main>

      {createModalOpen && (
        <CreateFileModal
          onSubmit={handleCreateFile}
          onClose={() => setCreateModalOpen(false)}
        />
      )}

      {actionModal.isOpen && (
        <ActionModal
          file={actionModal.file}
          actionType={actionModal.action}
          onSubmit={handleFileAction}
          onClose={closeActionModal}
        />
      )}

      <UserProfile 
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  )
}

export default App
