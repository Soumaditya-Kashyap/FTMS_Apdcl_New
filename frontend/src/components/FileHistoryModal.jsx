import React, { useState, useEffect } from 'react'
import './FileHistoryModal.css'

const FileHistoryModal = ({ isOpen, onClose, fileId, fileName }) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && fileId) {
      fetchFileLogs()
    }
  }, [isOpen, fileId])

  const fetchFileLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`http://localhost:5001/api/files/${fileId}/logs`)
      if (!response.ok) {
        throw new Error('Failed to fetch file history')
      }
      const data = await response.json()
      setLogs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const getActionIcon = (status) => {
    switch (status) {
      case 'Created':
        return '📝'
      case 'Moving':
        return '📤'
      case 'Received':
        return '📥'
      case 'Closed':
        return '🔒'
      default:
        return '📋'
    }
  }

  const getActionDescription = (log) => {
    switch (log.status) {
      case 'Created':
        return `File was created by ${log.updated_by_name || 'Unknown'}`
      case 'Moving':
        return `File was moved to ${log.moved_to || 'Unknown location'} by ${log.updated_by_name || 'Unknown'}`
      case 'Received':
        return `File was received at ${log.received_at || 'Unknown location'} by ${log.updated_by_name || 'Unknown'}`
      case 'Closed':
        return `File was closed by ${log.updated_by_name || 'Unknown'}`
      default:
        return `Action performed by ${log.updated_by_name || 'Unknown'}`
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="file-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>File History</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="file-info">
            <h3>File ID: {fileId}</h3>
            {fileName && <p>File Name: {fileName}</p>}
          </div>

          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading file history...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
              <button onClick={fetchFileLogs} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="history-timeline">
              {logs.length === 0 ? (
                <p className="no-history">No history found for this file.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={log.log_id} className="timeline-item">
                    <div className="timeline-marker">
                      <span className="action-icon">{getActionIcon(log.status)}</span>
                    </div>
                    <div className="timeline-content">
                      <div className="action-header">
                        <span className={`status-badge status-${log.status.toLowerCase()}`}>
                          {log.status}
                        </span>
                        <span className="action-time">
                          {formatDateTime(log.update_time)}
                        </span>
                      </div>
                      <div className="action-description">
                        {getActionDescription(log)}
                      </div>
                      {log.moved_to && log.status === 'Moving' && (
                        <div className="action-details">
                          <strong>Moved to:</strong> {log.moved_to}
                        </div>
                      )}
                      {log.received_at && log.status === 'Received' && (
                        <div className="action-details">
                          <strong>Received at:</strong> {log.received_at}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileHistoryModal
