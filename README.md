# APDCL File Tracking & Management System (FTMS)

## 📋 Project Overview

The **APDCL File Tracking & Management System (FTMS)** is a comprehensive web-based application designed for Assam Power Distribution Company Limited (APDCL) to efficiently track and manage file movements across different departments and offices. This system provides real-time visibility into file status, location tracking, and complete audit trails for all file-related activities.

### Key Features
- **File Creation & Management**: Create new files with unique identifiers and track their lifecycle
- **Real-time Status Tracking**: Monitor file status (Created, Moving, Received, Closed)
- **Location Tracking**: Track file movements between different offices and departments
- **User Authentication**: Secure login/signup system with APDCL ID validation
- **Audit Trail**: Complete history log of all file actions and movements
- **User Management**: Profile management and role-based access
- **Auto-refresh**: Real-time updates every 2 minutes for live tracking

## 🏗️ System Architecture

The application follows a **client-server architecture** with clear separation between frontend and backend:

```
┌─────────────────┐    HTTP/REST API    ┌──────────────────┐    MySQL    ┌──────────────┐
│   React Frontend │ ◄─────────────────► │ Express Backend  │ ◄─────────► │   Database   │
│   (Port 5173)    │                     │  (Port 5001)     │             │              │
└─────────────────┘                     └──────────────────┘             └──────────────┘
```

## 🛠️ Technology Stack

### Backend Technologies
- **Runtime**: Node.js
- **Framework**: Express.js v5.1.0
- **Database**: MySQL v2.18.1
- **Environment Management**: dotenv v17.2.0
- **Cross-Origin Resource Sharing**: CORS v2.8.5
- **Architecture**: RESTful API

### Frontend Technologies
- **Framework**: React v19.1.0
- **Build Tool**: Vite v7.0.4
- **Styling**: CSS3 with custom stylesheets
- **HTTP Client**: Fetch API
- **State Management**: React Hooks (useState, useEffect)
- **Development Tools**: ESLint for code quality

### Database Schema
- **Primary Tables**: `files`, `file_log`, `users`
- **Relationships**: Foreign key constraints for data integrity
- **Indexing**: Optimized queries with proper indexing

## 📁 Project Structure

```
APDCL_Intern/
├── backend/                    # Node.js Express Server
│   ├── database/
│   │   └── schema.sql         # Database schema and sample data
│   ├── .env                   # Environment variables (DB config)
│   ├── .gitignore            # Git ignore rules
│   ├── server.js             # Main server file with all API routes
│   ├── dbTest.js             # Database connection testing
│   ├── package.json          # Backend dependencies
│   └── package-lock.json     # Dependency lock file
│
├── frontend/                  # React Application
│   ├── src/
│   │   ├── components/       # React Components
│   │   │   ├── Login.jsx            # User login component
│   │   │   ├── Signup.jsx           # User registration component
│   │   │   ├── UserProfile.jsx      # User profile management
│   │   │   ├── FileTable.jsx        # Main file listing table
│   │   │   ├── CreateFileModal.jsx  # File creation modal
│   │   │   ├── ActionModal.jsx      # File action modal (move/receive/close)
│   │   │   ├── FileHistoryModal.jsx # File history viewer
│   │   │   └── *.css               # Component-specific styles
│   │   ├── App.jsx           # Main application component
│   │   ├── App.css           # Global application styles
│   │   ├── main.jsx          # React application entry point
│   │   └── index.css         # Global CSS styles
│   ├── public/               # Static assets
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite configuration
│   ├── package.json         # Frontend dependencies
│   └── eslint.config.js     # ESLint configuration
│
└── README.md                 # This documentation file
```

## 🔧 Backend Implementation Details

### Server Configuration (`server.js`)
The backend server is built with Express.js and provides a comprehensive REST API:

#### Database Connection
- Uses MySQL with connection pooling
- Environment-based configuration for security
- Automatic reconnection handling
- Connection validation on startup

#### API Endpoints

**File Management APIs:**
- `GET /api/files` - Retrieve all files with user details
- `POST /api/files` - Create new file with validation
- `PUT /api/files/:fileId/move` - Move file to different location
- `PUT /api/files/:fileId/receive` - Mark file as received
- `PUT /api/files/:fileId/close` - Close/complete file processing
- `GET /api/files/:fileId/logs` - Get complete file history

**User Management APIs:**
- `GET /api/users` - Get all system users
- `GET /api/auth/profile/:userId` - Get user profile details

**Authentication APIs:**
- `POST /api/auth/signup` - User registration with validation
- `POST /api/auth/login` - User authentication
- Input validation (APDCL ID format, email validation, password strength)

**System APIs:**
- `GET /api/health` - Health check endpoint for monitoring

#### Key Features:
- **Action Logging**: Every file action is logged in `file_log` table
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Data Validation**: Input validation for all endpoints
- **Security**: CORS enabled, environment-based configuration
- **Database Transactions**: Ensures data consistency

### Database Schema (`database/schema.sql`)

#### Tables Structure:

**1. `files` Table (Main File Records)**
```sql
- id (Primary Key, Auto Increment)
- file_id (Unique identifier, VARCHAR(50))
- file_name (File description, VARCHAR(255))
- created_by (Creator name, VARCHAR(100))
- created_time (Creation timestamp)
- status (ENUM: 'Created', 'Moving', 'Received', 'Closed')
- updated_by (Last updater, VARCHAR(100))
- updated_time (Last update timestamp)
- moved_to (Current location, VARCHAR(255))
- received_at (Received location, VARCHAR(255))
```

**2. `file_log` Table (Action History)**
```sql
- log_id (Primary Key, Auto Increment)
- file_id (Foreign Key to files table)
- status (Action type)
- updated_by (User who performed action)
- update_time (Action timestamp)
- moved_to (Destination if moved)
- received_at (Location if received)
- action_details (Additional details, TEXT)
```

**3. `users` Table (User Management)**
```sql
- id (Primary Key, Auto Increment)
- apdcl_id (Unique APDCL employee ID, 8 characters)
- name (Full name)
- email (Email address, unique)
- phone (Contact number)
- password (Encrypted password)
- department (User department)
- created_at (Registration timestamp)
```

## 🎨 Frontend Implementation Details

### Main Application (`App.jsx`)
The React application serves as a Single Page Application (SPA) with the following architecture:

#### State Management:
- **files**: Array of all files from backend
- **users**: List of system users
- **user**: Current logged-in user data
- **loading**: Loading states for better UX
- **modals**: Modal visibility states
- **error**: Error message handling

#### Key Functionalities:

**1. Authentication Flow:**
- Session management with localStorage
- Session expiration handling (automatic logout)
- Login/Signup mode switching
- User profile management

**2. File Operations:**
- Real-time file listing with auto-refresh (2-minute intervals)
- File creation with validation
- File status updates (Move, Receive, Close)
- Complete file history tracking

**3. API Integration:**
- RESTful API communication using Fetch API
- Error handling and user feedback
- Loading states for better user experience
- Automatic data refresh

### Component Architecture

#### Core Components:

**1. `Login.jsx` & `Signup.jsx`**
- User authentication forms
- Input validation (APDCL ID format, email, password strength)
- Error handling and user feedback
- Session management

**2. `FileTable.jsx`**
- Main data display component
- Sortable and filterable file listing
- Action buttons for file operations
- Status indicators with color coding
- Responsive design for different screen sizes

**3. `CreateFileModal.jsx`**
- File creation form with validation
- User selection dropdown
- Date/time handling
- Form submission with error handling

**4. `ActionModal.jsx`**
- Dynamic modal for file actions (Move, Receive, Close)
- Context-aware form fields
- Location selection for moves
- User assignment for actions

**5. `UserProfile.jsx`**
- User information display
- Profile management
- Logout functionality
- Session information

**6. `FileHistoryModal.jsx`**
- Complete file audit trail
- Chronological action history
- User details for each action
- Timestamp formatting

### Styling Architecture
- **Modular CSS**: Each component has its own CSS file
- **Responsive Design**: Mobile-friendly layouts
- **Consistent Theme**: APDCL branding colors and typography
- **Interactive Elements**: Hover effects, transitions, and animations
- **Accessibility**: Proper contrast ratios and keyboard navigation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- Git

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd APDCL_Intern
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file with database configuration:
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=apdcl_ftms
DB_PORT=3306
PORT=5001
```

Set up the database:
```bash
# Create database and tables using schema.sql
mysql -u your_username -p < database/schema.sql

# Test database connection
npm run testdb
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

#### 4. Running the Application

**Start Backend Server:**
```bash
cd backend
npm start
# Server runs on http://localhost:5001
```

**Start Frontend Development Server:**
```bash
cd frontend
npm run dev
# Application runs on http://localhost:5173
```

### Default Access
- **Frontend URL**: http://localhost:5173
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

## 📊 System Workflow

### File Lifecycle Management

```
1. CREATE FILE
   ├── User creates new file with unique ID
   ├── File status set to "Created"
   └── Action logged in file_log table

2. MOVE FILE
   ├── User initiates file movement
   ├── Destination office/department specified
   ├── Status changed to "Moving"
   └── Movement logged with destination

3. RECEIVE FILE
   ├── Receiving office confirms receipt
   ├── Status changed to "Received"
   ├── Received location recorded
   └── Receipt logged with timestamp

4. CLOSE FILE
   ├── File processing completed
   ├── Status changed to "Closed"
   └── Closure logged with final details
```

### User Authentication Flow

```
1. SIGNUP
   ├── User provides APDCL ID, name, email, password
   ├── System validates input format
   ├── Checks for existing users
   └── Creates new user account

2. LOGIN
   ├── User enters APDCL ID and password
   ├── System validates credentials
   ├── Creates user session
   └── Redirects to main application

3. SESSION MANAGEMENT
   ├── Session stored in localStorage
   ├── Auto-expiration after inactivity
   ├── Session validation on page refresh
   └── Secure logout functionality
```

## 🔒 Security Features

### Authentication & Authorization
- **APDCL ID Validation**: 8-character format enforcement
- **Password Security**: Minimum 6-character requirement
- **Email Validation**: Proper email format checking
- **Session Management**: Automatic session expiration
- **Input Sanitization**: SQL injection prevention

### Data Protection
- **Environment Variables**: Sensitive data in .env files
- **CORS Configuration**: Cross-origin request handling
- **Error Handling**: No sensitive data in error messages
- **Database Security**: Prepared statements for queries

## 📈 Performance Optimizations

### Backend Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Error Caching**: Reduced redundant error processing
- **Query Optimization**: Efficient JOIN operations

### Frontend Optimizations
- **Auto-refresh**: Smart 2-minute interval updates
- **Component Optimization**: Efficient re-rendering
- **State Management**: Optimized state updates
- **Loading States**: Better user experience during API calls

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run testdb  # Test database connection
```

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Health check
curl http://localhost:5001/api/health

# Get all files
curl http://localhost:5001/api/files

# Create new file
curl -X POST http://localhost:5001/api/files \
  -H "Content-Type: application/json" \
  -d '{"file_id":"F-TEST","file_name":"Test File","created_by":"Test User","created_time":"2024-01-01 10:00:00","created_by_id":"1"}'
```

## 🚀 Deployment Considerations

### Production Setup
1. **Environment Configuration**: Update .env for production database
2. **Build Frontend**: `npm run build` in frontend directory
3. **Process Management**: Use PM2 or similar for backend process management
4. **Reverse Proxy**: Configure Nginx for production serving
5. **SSL Certificate**: Enable HTTPS for secure communication
6. **Database Backup**: Regular backup strategy for MySQL database

### Monitoring
- **Health Endpoint**: `/api/health` for uptime monitoring
- **Error Logging**: Console logging for debugging
- **Performance Metrics**: Database query performance monitoring

## 🤝 Contributing

### Development Guidelines
1. Follow existing code structure and naming conventions
2. Add proper error handling for new features
3. Update database schema if needed
4. Test all API endpoints before committing
5. Maintain responsive design principles

### Code Standards
- **Backend**: Use consistent error handling and logging
- **Frontend**: Follow React best practices and hooks patterns
- **Database**: Maintain referential integrity and proper indexing
- **Documentation**: Update README for any new features

## 📞 Support & Maintenance

### Common Issues & Solutions

**Database Connection Issues:**
- Check MySQL server status
- Verify .env configuration
- Ensure database exists and schema is loaded

**Frontend API Connection Issues:**
- Verify backend server is running on port 5001
- Check CORS configuration
- Validate API endpoint URLs

**Authentication Problems:**
- Clear localStorage and retry login
- Check APDCL ID format (8 characters)
- Verify user exists in database

### Maintenance Tasks
- Regular database backups
- Log file rotation
- Security updates for dependencies
- Performance monitoring and optimization

---

## 📝 Version Information

- **Current Version**: 1.0.0
- **Last Updated**: July 2024
- **Compatibility**: Node.js 14+, React 19+, MySQL 5.7+

---

**Developed for APDCL (Assam Power Distribution Company Limited)**  
*Efficient File Tracking & Management System*
