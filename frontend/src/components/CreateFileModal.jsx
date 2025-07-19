import React, { useState, useEffect } from 'react'
import './Modal.css'

const CreateFileModal = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    file_id: '',
    file_name: '',
    created_by: '',
    created_time: '',
    created_by_id: ''
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
    
    // If user is selected, also set the created_by name
    if (name === 'created_by_id') {
      const selectedUser = users.find(user => user.id.toString() === value)
      if (selectedUser) {
        setFormData(prev => ({
          ...prev,
          created_by: selectedUser.name
        }))
      }
    }
    
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
    
    if (!formData.file_id.trim()) {
      newErrors.file_id = 'File ID is required'
    } else if (!/^[A-Z]-\d{4}$/.test(formData.file_id)) {
      newErrors.file_id = 'File ID must be in format: F-2024'
    }
    
    if (!formData.file_name.trim()) {
      newErrors.file_name = 'File name is required'
    }
    
    if (!formData.created_by.trim()) {
      newErrors.created_by = 'Created by is required'
    }
    
    if (!formData.created_time.trim()) {
      newErrors.created_time = 'Created time is required'
    }
    
    if (!formData.created_by_id) {
      newErrors.created_by_id = 'Please select a user'
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
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New File</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="file_id">File ID *</label>
            <input
              type="text"
              id="file_id"
              name="file_id"
              value={formData.file_id}
              onChange={handleChange}
              placeholder="e.g., F-2024"
              className={errors.file_id ? 'error' : ''}
            />
            {errors.file_id && <span className="error-text">{errors.file_id}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="file_name">File Name *</label>
            <input
              type="text"
              id="file_name"
              name="file_name"
              value={formData.file_name}
              onChange={handleChange}
              placeholder="Enter file name"
              className={errors.file_name ? 'error' : ''}
            />
            {errors.file_name && <span className="error-text">{errors.file_name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="created_by">Created By *</label>
            <input
              type="text"
              id="created_by"
              name="created_by"
              value={formData.created_by}
              onChange={handleChange}
              placeholder="Enter creator name"
              className={errors.created_by ? 'error' : ''}
            />
            {errors.created_by && <span className="error-text">{errors.created_by}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="created_time">Created Time *</label>
            <input
              type="datetime-local"
              id="created_time"
              name="created_time"
              value={formData.created_time}
              onChange={handleChange}
              className={errors.created_time ? 'error' : ''}
            />
            {errors.created_time && <span className="error-text">{errors.created_time}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="created_by_id">Updated By (Action Performer) *</label>
            <select
              id="created_by_id"
              name="created_by_id"
              value={formData.created_by_id}
              onChange={handleChange}
              className={errors.created_by_id ? 'error' : ''}
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.apdcl_id}) - {user.department}
                </option>
              ))}
            </select>
            {errors.created_by_id && <span className="error-text">{errors.created_by_id}</span>}
          </div>
          
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
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateFileModal
