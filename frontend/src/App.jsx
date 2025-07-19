import { useState, useEffect } from 'react'
import FileTable from './components/FileTable'
import CreateFileModal from './components/CreateFileModal'
import ActionModal from './components/ActionModal'
import './App.css'

function App() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
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

  // Auto-refresh files every 5 seconds
  useEffect(() => {
    fetchFiles()
    const interval = setInterval(fetchFiles, 5000)
    return () => clearInterval(interval)
  }, [])

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
      setShowCreateModal(false)
      setError('')
    } catch (err) {
      console.error('Error creating file:', err)
      setError(err.message)
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
      setShowActionModal(false)
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
    setShowActionModal(true)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>File Tracking & Management System</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create New File
        </button>
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

      {showCreateModal && (
        <CreateFileModal
          onSubmit={handleCreateFile}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showActionModal && (
        <ActionModal
          file={selectedFile}
          actionType={actionType}
          onSubmit={handleFileAction}
          onClose={() => {
            setShowActionModal(false)
            setSelectedFile(null)
            setActionType('')
          }}
        />
      )}
    </div>
  )
}

export default App
