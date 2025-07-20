import React, { useState, useEffect } from 'react'
import './Modal.css'

const ActionModal = ({ file, actionType, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    updated_by_id: '',
    moved_to: '',
    received_at: ''
  })
  const [users, setUsers] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/users')
        if (response.ok) {
          const userData = await response.json()
          setUsers(userData)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.updated_by_id) {
      newErrors.updated_by_id = 'Please select a user'
    }
    
    if (actionType === 'move' && !formData.moved_to.trim()) {
      newErrors.moved_to = 'Destination is required'
    }
    
    if (actionType === 'receive' && !formData.received_at.trim()) {
      newErrors.received_at = 'Received location is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    try {
      const submitData = { updated_by_id: formData.updated_by_id }
      
      if (actionType === 'move') {
        submitData.moved_to = formData.moved_to
      } else if (actionType === 'receive') {
        submitData.received_at = formData.received_at
      }
      
      await onSubmit(submitData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getModalTitle = () => {
    switch (actionType) {
      case 'move':
        return 'Move File'
      case 'receive':
        return 'Receive File'
      case 'close':
        return 'Close File'
      default:
        return 'File Action'
    }
  }

  const getActionDescription = () => {
    switch (actionType) {
      case 'move':
        return `Move file "${file?.file_name}" to a new location`
      case 'receive':
        return `Mark file "${file?.file_name}" as received`
      case 'close':
        return `Close file "${file?.file_name}"`
      default:
        return 'Perform action on file'
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{getModalTitle()}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="action-description">{getActionDescription()}</p>
          <div className="file-info">
            <strong>File ID:</strong> {file?.file_id}<br/>
            <strong>Current Status:</strong> {file?.status}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="updated_by_id">Updated By *</label>
            <select
              id="updated_by_id"
              name="updated_by_id"
              value={formData.updated_by_id}
              onChange={handleChange}
              className={errors.updated_by_id ? 'error' : ''}
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.apdcl_id}) - {user.department}
                </option>
              ))}
            </select>
            {errors.updated_by_id && <span className="error-text">{errors.updated_by_id}</span>}
          </div>
          
          {actionType === 'move' && (
            <div className="form-group">
              <label htmlFor="moved_to">Move To *</label>
              <input
                type="text"
                id="moved_to"
                name="moved_to"
                value={formData.moved_to}
                onChange={handleChange}
                placeholder="Enter destination location"
                className={errors.moved_to ? 'error' : ''}
              />
              {errors.moved_to && <span className="error-text">{errors.moved_to}</span>}
            </div>
          )}
          
          {actionType === 'receive' && (
            <div className="form-group">
              <label htmlFor="received_at">Received At *</label>
              <input
                type="text"
                id="received_at"
                name="received_at"
                value={formData.received_at}
                onChange={handleChange}
                placeholder="Enter received location"
                className={errors.received_at ? 'error' : ''}
              />
              {errors.received_at && <span className="error-text">{errors.received_at}</span>}
            </div>
          )}
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn btn-${actionType}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}ing...` : getModalTitle()}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ActionModal
