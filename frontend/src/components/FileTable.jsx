import React from 'react'
import './FileTable.css'

const FileTable = ({ files, loading, onAction, onRefresh }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Created':
        return 'status-created'
      case 'Moving':
        return 'status-moving'
      case 'Received':
        return 'status-received'
      case 'Closed':
        return 'status-closed'
      default:
        return 'status-default'
    }
  }

  const getAvailableActions = (file) => {
    const actions = []
    switch (file.status) {
      case 'Created':
        actions.push('move', 'close')
        break
      case 'Moving':
        actions.push('receive') // Remove 'close' for Moving status
        break
      case 'Received':
        actions.push('move', 'close')
        break
      case 'Closed':
        // No actions available for closed files
        break
      default:
        break
    }
    return actions
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading files...</p>
      </div>
    )
  }

  return (
    <div className="file-table-container">
      <div className="table-header">
        <h2>Files ({files.length})</h2>
        <button className="btn btn-secondary" onClick={onRefresh}>
          Refresh
        </button>
      </div>
      
      {files.length === 0 ? (
        <div className="empty-state">
          <p>No files found. Create your first file to get started.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="file-table">
            <thead>
              <tr>
                <th>File ID</th>
                <th>File Name</th>
                <th>Created By</th>
                <th>Created Time</th>
                <th>Status</th>
                <th>Updated By</th>
                <th>Updated Time</th>
                <th>Moved To</th>
                <th>Received At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="file-id">{file.file_id}</td>
                  <td className="file-name" title={file.file_name}>{file.file_name}</td>
                  <td title={file.created_by}>{file.created_by}</td>
                  <td title={formatDateTime(file.created_time)}>{formatDateTime(file.created_time)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(file.status)}`}>
                      {file.status}
                    </span>
                  </td>
                  <td>
                    {file.updated_by_name ? (
                      <div className="user-info">
                        <div className="user-name">{file.updated_by_name}</div>
                        <div className="user-id">{file.updated_by_apdcl_id}</div>
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td title={formatDateTime(file.updated_time)}>{formatDateTime(file.updated_time)}</td>
                  <td title={file.moved_to || 'N/A'}>{file.moved_to || 'N/A'}</td>
                  <td title={file.received_at || 'N/A'}>{file.received_at || 'N/A'}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      {getAvailableActions(file).map((action) => (
                        <button
                          key={action}
                          className={`btn btn-sm btn-${action}`}
                          onClick={() => onAction(file, action)}
                          title={`${action.charAt(0).toUpperCase() + action.slice(1)} file`}
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default FileTable
