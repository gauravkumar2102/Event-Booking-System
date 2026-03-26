# Event Booking System 

A RESTful API built with **Node.js + Express + MySQL** for managing events and ticket bookings.

---
LIVE APPLICATION LINK - https://event-booking-system-production-d8c2.up.railway.app/api-docs

## Project Structure

```
event-booking-system/
├── src/
│   ├── app.js                  # Entry point
│   ├── config/db.js            # MySQL connection pool
│   ├── controllers/            # Business logic
│   ├── routes/                 # Express routes
│   └── middlewares/            # (extendable)
├── docs/
│   └── swagger.yaml            # OpenAPI 3.0 spec
├── schema.sql                  # Database schema + seed data
├── postman_collection.json     # Postman collection
├── Dockerfile                  # Docker image
├── docker-compose.yml          # One-click Docker deployment
├── .env.example                # Environment variable template
└── README.md
```

---

## Option A — Run with Docker (Recommended, No MySQL install needed)

### Step 1: Install Docker Desktop
- Download from https://www.docker.com/products/docker-desktop/
- Install and open Docker Desktop. Wait until it says "Running".

### Step 2: Start the app
Open a terminal in the project folder and run:
```bash
docker-compose up --build
```

That's it! The app and database both start automatically.

- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api-docs

To stop:
```bash
docker-compose down
```

---

## Option B — Run Manually (MySQL + Node.js)

### Step 1: Install Node.js
- Download from https://nodejs.org (choose the LTS version)
- Install it. After installing, open a terminal and verify:
```bash
node -v    # should print something like v18.x.x
npm -v     # should print something like 9.x.x
```

### Step 2: Install MySQL

#### On Windows:
1. Go to https://dev.mysql.com/downloads/installer/
2. Download **MySQL Installer** (Community)
3. Run the installer → choose "Developer Default" setup
4. During setup, set a **root password** — remember this!
5. Finish installation

#### On macOS:
```bash
brew install mysql
brew services start mysql
mysql_secure_installation  # follow prompts, set a root password
```

#### On Ubuntu/Linux:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Step 3: Set Up the Database

Open a terminal and log into MySQL:
```bash
mysql -u root -p
```
It will ask for your password (the one you set during install). Type it and press Enter.

Now run this command to create the database and tables:
```sql
source /full/path/to/event-booking-system/schema.sql
```
(Replace `/full/path/to/` with the actual path to the project folder.)

Or you can copy-paste the contents of `schema.sql` directly into the MySQL prompt.

Type `exit` when done.

### Step 4: Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Open `.env` and fill in your MySQL password:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_password_here
DB_NAME=event_booking
PORT=3000
```

### Step 5: Install Dependencies
```bash
npm install
```

### Step 6: Start the Server
```bash
npm start
```

You should see:
```
Server running on http://localhost:3000
Swagger docs at http://localhost:3000/api-docs
```

---

## API Endpoints

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | /events                | List all upcoming events             |
| POST   | /events                | Create a new event                   |
| POST   | /bookings              | Book a ticket (returns booking code) |
| GET    | /users/:id/bookings    | Get all bookings for a user          |
| POST   | /events/:id/attendance | Mark attendance using booking code   |

Full API documentation available at: http://localhost:3000/api-docs

---

## Testing with Postman

1. Download Postman from https://www.postman.com/downloads/
2. Open Postman → click **Import** → select `postman_collection.json`
3. Set the `baseUrl` variable to `http://localhost:3000`
4. Run the requests in order: Create Event → Create Booking → Mark Attendance

---

## Key Technical Highlights

- **Race Condition Prevention**: The `POST /bookings` endpoint uses a MySQL transaction with `SELECT ... FOR UPDATE` to lock the event row, ensuring two simultaneous requests can't overbook the same event.
- **Unique Booking Codes**: Each booking gets a unique 12-character alphanumeric code (UUID-based).
- **Input Validation**: All endpoints validate input using `express-validator`.
- **OpenAPI Docs**: Full Swagger UI at `/api-docs`.
