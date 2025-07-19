import React, { useState, useEffect, useMemo } from 'react'
import './FileTable.css'

const FileTable = ({ files, loading, onAction, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const filesPerPage = 10
  
  // Filter and paginate files based on search term, status filter, and pagination
  const { filteredFiles, paginatedFiles, totalPages } = useMemo(() => {
    let filtered = files
    
    // Apply status filter first
    switch (activeFilter) {
      case 'open':
        filtered = files.filter(file => file.status !== 'Closed')
        break
      case 'moving':
        filtered = files.filter(file => file.status === 'Moving')
        break
      case 'closed':
        filtered = files.filter(file => file.status === 'Closed')
        break
      case 'all':
      default:
        filtered = files
        break
    }
    
    // Then apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(file => 
        file.file_id.toLowerCase().includes(searchLower) ||
        file.file_name.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort by latest updated (updated_time descending)
    filtered = filtered.sort((a, b) => new Date(b.updated_time) - new Date(a.updated_time))
    
    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / filesPerPage)
    const startIndex = (currentPage - 1) * filesPerPage
    const endIndex = startIndex + filesPerPage
    const paginatedFiles = filtered.slice(startIndex, endIndex)
    
    return { filteredFiles: filtered, paginatedFiles, totalPages }
  }, [files, searchTerm, activeFilter, currentPage, filesPerPage])
  
  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeFilter])
  
  // Get counts for each filter
  const getFilterCounts = useMemo(() => {
    const allCount = files.length
    const openCount = files.filter(file => file.status !== 'Closed').length
    const movingCount = files.filter(file => file.status === 'Moving').length
    const closedCount = files.filter(file => file.status === 'Closed').length
    
    return { allCount, openCount, movingCount, closedCount }
  }, [files])
  
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
      {/* Filter Buttons */}
      <div className="filter-buttons-container">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Files
          <span className="filter-count">{getFilterCounts.allCount}</span>
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'open' ? 'active' : ''}`}
          onClick={() => setActiveFilter('open')}
        >
          Open Files
          <span className="filter-count">{getFilterCounts.openCount}</span>
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'moving' ? 'active' : ''}`}
          onClick={() => setActiveFilter('moving')}
        >
          Moving Files
          <span className="filter-count">{getFilterCounts.movingCount}</span>
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'closed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('closed')}
        >
          Closed Files
          <span className="filter-count">{getFilterCounts.closedCount}</span>
        </button>
      </div>
      
      <div className="table-header">
        <h2>Files ({filteredFiles.length}{searchTerm ? ` of ${files.length}` : ''})</h2>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // Show first page, last page, current page, and pages around current
              const showPage = page === 1 || page === totalPages || 
                              Math.abs(page - currentPage) <= 1
              
              if (!showPage && page === 2 && currentPage > 4) {
                return <span key={page} className="pagination-dots">...</span>
              }
              if (!showPage && page === totalPages - 1 && currentPage < totalPages - 3) {
                return <span key={page} className="pagination-dots">...</span>
              }
              if (!showPage) return null
              
              return (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            })}
            
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        )}
        
        <div className="table-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by File ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <button className="btn btn-secondary" onClick={onRefresh}>
            Refresh
          </button>
        </div>
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
              {paginatedFiles.map((file) => (
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
