# Task Manager

A full-stack task management application built with **Spring Boot** backend and **React** frontend. Features a clean REST API, comprehensive test coverage, and modern UI with Material Design.

## ✨ Features

- **Complete CRUD Operations** - Create, read, update, and delete tasks
- **Task Status Tracking** - Manage tasks across TODO, IN_PROGRESS, and DONE statuses
- **Due Date Support** - Set and track task deadlines
- **Validation** - Client and server-side validation for data integrity
- **Error Handling** - User-friendly error messages and recovery
- **Responsive Design** - Works across desktop and mobile browsers
- **Comprehensive Testing** - 44 backend tests + 74 frontend tests (118 total)

## 🏗️ Architecture

```
task-manager/
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/...       # Java source code
│   ├── src/test/java/...       # Unit & integration tests
│   ├── pom.xml                 # Maven dependencies
│   └── Dockerfile              # Container image
├── frontend/                   # React + TypeScript + Vite
│   ├── src/                    # React components & tests
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.ts          # Vite build configuration
│   └── vitest.config.ts        # Test runner configuration
├── server.js                   # Vite dev server proxy helper
└── package.json                # Monorepo configuration
```

## 🔧 Technology Stack

**Backend:**
- Java 17+
- Spring Boot 3.2.0
- Spring Data JPA (Hibernate)
- H2 Database (in-memory, development)
- JUnit 5 & Spring Boot Test
- SpringDoc OpenAPI (Swagger UI)

**Frontend:**
- React 18.3.1
- TypeScript 5.4.2
- Vite 5.1.7 (fast build tool)
- Material UI 5.14.0
- Axios (HTTP client)
- Vitest & React Testing Library

## 📋 Requirements

- **Java 17+** (OpenJDK or Oracle JDK)
- **Maven 3.6+** (for backend builds)
- **Node.js 16+** (for frontend)
- **npm 7+** (comes with Node.js)

## 🚀 Quick Start

### Option 1: Run Both Services in Separate Terminals

**Terminal 1 - Backend (Spring Boot):**
```powershell
cd backend
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`

**Terminal 2 - Frontend (React + Vite):**
```powershell
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` (opens automatically)

### Option 2: Build & Run

**Build Backend:**
```powershell
cd backend
mvn clean package
java -jar target/taskmanager-0.0.1-SNAPSHOT.jar
```

**Build Frontend:**
```powershell
cd frontend
npm install
npm run build
npm run preview
```

## 📡 API Documentation

Base URL: `http://localhost:8080/api`

### Endpoints

**Get All Tasks**
```bash
curl -X GET http://localhost:8080/api/tasks
```

**Get Task by ID**
```bash
curl -X GET http://localhost:8080/api/tasks/1
```

**Create Task**
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "TODO",
    "dueDate": "2024-12-31"
  }'
```

**Update Task**
```bash
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread, cheese",
    "status": "IN_PROGRESS",
    "dueDate": "2024-12-31"
  }'
```

**Delete Task**
```bash
curl -X DELETE http://localhost:8080/api/tasks/1
```

### Response Codes

- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `404 Not Found` - Task doesn't exist
- `500 Internal Server Error` - Server error

## ✅ Testing

### Backend Tests (44 tests)

```powershell
cd backend
mvn test
```

Tests cover:
- `TaskControllerTests.java` - 19 REST API integration tests
- `TaskRepositoryTests.java` - 25 JPA repository tests
- All CRUD operations, validation, error codes

### Frontend Tests (74 tests)

```powershell
cd frontend
npm run test:run
```

Tests cover:
- `TaskForm.test.tsx` - 23 form component tests
- `TaskList.test.tsx` - 23 task list component tests
- `App.test.tsx` - 28 integration tests
- User interactions, API mocking, error scenarios

### Test with Coverage

```powershell
# Backend
cd backend
mvn test jacoco:report

# Frontend
cd frontend
npm run test:coverage
```

## 🛠️ Development Commands

**Backend:**
```powershell
cd backend

# Run in development (hot reload)
mvn spring-boot:run

# Clean and rebuild
mvn clean package

# Run only tests
mvn test

# Skip tests during build
mvn clean package -DskipTests
```

**Frontend:**
```powershell
cd frontend

# Install dependencies
npm install

# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

## 📚 Additional Resources

**Swagger API Documentation:**
Open `http://localhost:8080/swagger-ui/index.html` when backend is running for interactive API docs.

**H2 Database Console:**
Available at `http://localhost:8080/h2-console` when backend is running
- URL: `jdbc:h2:mem:taskdb`
- Username: `sa`
- Password: (leave blank)

## 📝 Input Validation Rules

**Task Title:**
- Required (cannot be empty or whitespace)
- Maximum 100 characters
- Trimmed before saving

**Task Description:**
- Optional
- Maximum 500 characters
- Trimmed before saving

**Task Status:**
- Enum: `TODO`, `IN_PROGRESS`, `DONE`
- Defaults to `TODO` for new tasks

**Due Date:**
- Optional
- Must be valid date format (YYYY-MM-DD)
- Can be past or future dates

## 🐛 Troubleshooting

**"Cannot connect to localhost:8080"**
- Ensure backend is running: `mvn spring-boot:run` in the backend directory
- Check if port 8080 is in use: `netstat -ano | findstr :8080` (PowerShell)

**"Cannot resolve module 'react'"**
- Run `npm install` in the frontend directory
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

**"Port 5173 already in use"**
- The frontend will use next available port automatically
- Or kill process: `Stop-Process -Name "node"` (PowerShell)

**Tests failing after code changes**
- Backend: `mvn clean test` (clears cache)
- Frontend: `npm run test` (Vitest watches for changes)

**H2 Database shows empty tables**
- H2 in-memory database resets on server restart
- Data persists during development session only
- For production, configure PostgreSQL or MySQL in `application.properties`

## 🚢 Deployment

For production deployment:

1. **Use persistent database** - Update `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost/taskdb
   spring.datasource.driver-class-name=org.postgresql.Driver
   spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
   ```

2. **Build Docker images:**
   ```bash
   cd backend
   docker build -t taskmanager-api .
   
   cd ../frontend
   docker build -t taskmanager-web .
   ```

3. **Deploy to cloud** - Use Docker Compose, Kubernetes, or your preferred orchestration platform

## 📄 Example Workflow

1. **Start the services:**
   - Backend on port 8080
   - Frontend on port 5173

2. **Create a task:**
   - Enter title: "Project Kickoff"
   - Add description: "Team meeting at 2 PM"
   - Set due date: Tomorrow
   - Click "Add Task"

3. **Update progress:**
   - Click task to edit
   - Change status to "IN_PROGRESS"
   - Update description with notes
   - Save changes

4. **Mark complete:**
   - Click task to edit
   - Change status to "DONE"
   - Save
   - Task moves to completed section

5. **Delete task:**
   - Click "Delete" button
   - Confirm deletion in dialog

## 📞 Support

For issues or questions:
- Check `Troubleshooting` section above
- Review test files for usage examples
- Consult Spring Boot docs: https://spring.io/projects/spring-boot
- Consult React docs: https://react.dev
