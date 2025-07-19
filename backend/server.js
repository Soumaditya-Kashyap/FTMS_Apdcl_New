require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    process.exit(1);
  }
  console.log('Connected to database successfully.');
});

// Helper function to log actions
const logAction = (fileId, status, updatedBy, movedTo = null, receivedAt = null) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO file_log (file_id, status, updated_by, update_time, moved_to, received_at)
      VALUES (?, ?, ?, NOW(), ?, ?)
    `;
    db.query(query, [fileId, status, updatedBy, movedTo, receivedAt], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// API Routes

// Get all files
app.get('/api/files', (req, res) => {
  const query = `
    SELECT f.id, f.file_id, f.file_name, f.created_by, f.created_time, f.status, 
           f.updated_by, f.updated_time, f.moved_to, f.received_at, 
           u.name as updated_by_name, u.apdcl_id as updated_by_apdcl_id
    FROM files f
    LEFT JOIN users u ON f.updated_by = u.id
    ORDER BY f.updated_time DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching files:', err);
      return res.status(500).json({ error: 'Failed to fetch files' });
    }
    res.json(results);
  });
});

// Get file logs for a specific file
app.get('/api/files/:fileId/logs', (req, res) => {
  const { fileId } = req.params;
  const query = `
    SELECT fl.log_id, fl.file_id, fl.status, fl.updated_by, fl.update_time, 
           fl.moved_to, fl.received_at, u.name as updated_by_name
    FROM file_log fl
    LEFT JOIN users u ON fl.updated_by = u.id
    WHERE fl.file_id = ? 
    ORDER BY fl.update_time DESC
  `;
  
  db.query(query, [fileId], (err, results) => {
    if (err) {
      console.error('Error fetching file logs:', err);
      return res.status(500).json({ error: 'Failed to fetch file logs' });
    }
    res.json(results);
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  const query = `
    SELECT id, apdcl_id, name, email, department
    FROM users 
    ORDER BY name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(results);
  });
});

// Create a new file
app.post('/api/files', async (req, res) => {
  const { file_id, file_name, created_by, created_time, created_by_id } = req.body;
  
  if (!file_id || !file_name || !created_by || !created_time || !created_by_id) {
    return res.status(400).json({ error: 'file_id, file_name, created_by, created_time, and created_by_id are required' });
  }

  try {
    // Insert into files table
    const fileQuery = `
      INSERT INTO files (file_id, file_name, created_by, created_time, status, updated_by, updated_time)
      VALUES (?, ?, ?, ?, 'Created', ?, NOW())
    `;
    
    db.query(fileQuery, [file_id, file_name, created_by, created_time, created_by_id], async (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'File ID already exists' });
        }
        console.error('Error creating file:', err);
        return res.status(500).json({ error: 'Failed to create file' });
      }

      try {
        // Log the creation action
        await logAction(file_id, 'Created', created_by_id, null, null);
        res.status(201).json({ message: 'File created successfully', file_id });
      } catch (logErr) {
        console.error('Error logging file creation:', logErr);
        res.status(201).json({ message: 'File created but logging failed', file_id });
      }
    });
  } catch (error) {
    console.error('Error in file creation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Move a file
app.put('/api/files/:fileId/move', async (req, res) => {
  const { fileId } = req.params;
  const { moved_to, updated_by_id } = req.body;
  
  if (!moved_to || !updated_by_id) {
    return res.status(400).json({ error: 'moved_to and updated_by_id are required' });
  }

  try {
    // Update files table - set moved_to and clear received_at
    const updateQuery = `
      UPDATE files 
      SET status = 'Moving', moved_to = ?, updated_by = ?, updated_time = NOW(), received_at = NULL
      WHERE file_id = ?
    `;
    
    db.query(updateQuery, [moved_to, updated_by_id, fileId], async (err, result) => {
      if (err) {
        console.error('Error moving file:', err);
        return res.status(500).json({ error: 'Failed to move file' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

      try {
        // Log the move action
        await logAction(fileId, 'Moving', updated_by_id, moved_to, null);
        res.json({ message: 'File moved successfully' });
      } catch (logErr) {
        console.error('Error logging file move:', logErr);
        res.json({ message: 'File moved but logging failed' });
      }
    });
  } catch (error) {
    console.error('Error in file move:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Receive a file
app.put('/api/files/:fileId/receive', async (req, res) => {
  const { fileId } = req.params;
  const { received_at, updated_by_id } = req.body;
  
  if (!received_at || !updated_by_id) {
    return res.status(400).json({ error: 'received_at and updated_by_id are required' });
  }

  try {
    // Update files table - set received_at and clear moved_to
    const updateQuery = `
      UPDATE files 
      SET status = 'Received', received_at = ?, updated_by = ?, updated_time = NOW(), moved_to = NULL
      WHERE file_id = ?
    `;
    
    db.query(updateQuery, [received_at, updated_by_id, fileId], async (err, result) => {
      if (err) {
        console.error('Error receiving file:', err);
        return res.status(500).json({ error: 'Failed to receive file' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

      try {
        // Log the receive action
        await logAction(fileId, 'Received', updated_by_id, null, received_at);
        res.json({ message: 'File received successfully' });
      } catch (logErr) {
        console.error('Error logging file receive:', logErr);
        res.json({ message: 'File received but logging failed' });
      }
    });
  } catch (error) {
    console.error('Error in file receive:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Close a file
app.put('/api/files/:fileId/close', async (req, res) => {
  const { fileId } = req.params;
  const { updated_by_id } = req.body;
  
  if (!updated_by_id) {
    return res.status(400).json({ error: 'updated_by_id is required' });
  }

  try {
    // Update files table
    const updateQuery = `
      UPDATE files 
      SET status = 'Closed', updated_by = ?, updated_time = NOW()
      WHERE file_id = ?
    `;
    
    db.query(updateQuery, [updated_by_id, fileId], async (err, result) => {
      if (err) {
        console.error('Error closing file:', err);
        return res.status(500).json({ error: 'Failed to close file' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

      try {
        // Log the close action
        await logAction(fileId, 'Closed', updated_by_id, null, null);
        res.json({ message: 'File closed successfully' });
      } catch (logErr) {
        console.error('Error logging file close:', logErr);
        res.json({ message: 'File closed but logging failed' });
      }
    });
  } catch (error) {
    console.error('Error in file close:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
