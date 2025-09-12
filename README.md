## What’s Inside
- Data: data/store.mjs (arrays: users, projects, tasks, nextIds)
- Routes: routes/users.mjs, routes/projects.mjs, routes/tasks.mjs
- Middleware: files in middleware/
- Utils: utils/listing.mjs (sorting + paging)
- Uses ESM (.mjs files)

## Middleware
- attachRequestId — adds req.id to each request
- requestLogger — logs method, path, status
- requireJson — checks POST/PATCH/PUT use Content-Type: application/json
- validateNumericId — checks :id is a number (else 400)
- errorHandler — sends JSON errors (last middleware)

## Base URL and Rules
- Base URL: http://localhost:3000
For POST/PATCH/PUT, set header: Content-Type: application/json
If not set, you get 415
IDs are numbers. Bad :id → 400. Missing item → 404

## List Endpoints: Query Params
- Work on GET /users, GET /projects, GET /tasks.
- page (default 1)
- limit (default 10)
- sortBy, order (asc or desc)
- Users: id | name | username | email
- Projects: id | name
- Tasks: id | title | priority | completed | dueDate | projectId | assignedTo

## Filters
Tasks only:
- completed=true|false
- search=<text> (search in title)


## API Routes

| Verb   | Path  | Description                                                                                                  |
| ------ | --------------- | ------------------------------------------------------------------------------------------------------------ |
| GET    | `/health`       | Health check. Returns `{ status, requestId }`.                                                               |
| GET    | `/debug/state`  | Counts and sample items. Shows `nextIds`.                                                                    |
| GET    | `/users`        | List users (sort + paginate).                                                                                |
| GET    | `/users/:id`    | Get one user.                                                                                                |
| POST   | `/users`        | Create user. Body: `{ name, username, email }` (username unique).                                            |
| PATCH  | `/users/:id`    | Update part of a user. Body: `{ name?, username?, email? }`.                                                 |
| PUT    | `/users/:id`    | Replace a user. Body: `{ name, username, email }`.                                                           |
| DELETE | `/users/:id`    | Delete user. Also **unassigns** tasks (`assignedTo -> null`).                                                |
| GET    | `/projects`     | List projects (sort + paginate).                                                                             |
| GET    | `/projects/:id` | Get one project.                                                                                             |
| POST   | `/projects`     | Create project. Body: `{ name }`.                                                                            |
| PATCH  | `/projects/:id` | Update part of a project. Body: `{ name? }`.                                                                 |
| PUT    | `/projects/:id` | Replace a project. Body: `{ name }`.                                                                         |
| DELETE | `/projects/:id` | Delete project. Also **clears** `task.projectId -> null`.                                                    |
| GET    | `/tasks`        | List tasks (`completed`, `search`; sort + paginate).                                                         |
| GET    | `/tasks/:id`    | Get one task.                                                                                                |
| POST   | `/tasks`        | Create task. Body: `{ title, priority?, dueDate?, projectId?, assignedTo? }` (`completed=false` by default). |
| PATCH  | `/tasks/:id`    | Update part of a task. Body: `{ title?, completed?, priority?, projectId?, assignedTo?, dueDate? }`.         |
| PUT    | `/tasks/:id`    | Replace a task. Body: `{ title, completed, priority, projectId?, assignedTo?, dueDate? }`.                   |
| DELETE | `/tasks/:id`    | Delete task.                                                                                                 |


## Errors (JSON)
- Wrong or missing JSON header on write → 415 { "error": "Content-Type must be application/json" }
- Bad id → 400 { "error": "Invalid id" }
- Not found → 404 { "error": "User/Project/Task not found" }
- Validation → 400 { "error": "message" }
- Server → 500 { "error": "Server error" } (handled by errorHandler)

## Tips for Testing
- Use Thunder Client or Postman
- Always send Content-Type: application/json for POST/PATCH/PUT
- Try page, limit, sortBy, order on list endpoints
- For tasks, try completed=true and search=<text> too