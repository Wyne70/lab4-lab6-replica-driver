# MongoDB Replica Set and Driver Integration

A laboratory project demonstrating MongoDB Replica Set configuration, data replication, Node.js Driver integration, and CRUD operations using Docker.

## Technologies
- MongoDB 7
- Node.js
- Express.js
- MongoDB Node.js Driver
- Docker and Docker Compose

## How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/Wyne70/lab4-lab6-replica-driver.git
cd lab4-lab6-replica-driver
```

### 2. Start the Containers

```bash
docker compose up -d --build
```

### 3. Check the Containers

```bash
docker compose ps
```

Make sure all MongoDB nodes and the Node.js application are running.

### 4. Check the Replica Set

```bash
docker compose exec mongo1 mongosh
```

Inside MongoDB Shell, execute:

```javascript
rs.status()
```

Check the Primary and Secondary members.

### 5. Access the API

Open your browser:

```text
http://localhost:3000
```

Available API endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Display API information |
| GET | `/api/species` | Retrieve all species |
| GET | `/api/replica-status` | Check Replica Set status |

For the complete CRUD routes, check `src/server.js`.

## How to Perform the Laboratory Activities

1. **Replica Set Configuration** – Configure three MongoDB nodes: one Primary and two Secondary members.
2. **Data Replication** – Insert records into the Primary and check whether the data is replicated to the Secondary nodes.
3. **Driver Integration** – Connect the Node.js application to the MongoDB Replica Set.
4. **CRUD Operations** – Create, read, update, and delete species records using the API.
5. **Replica Set Monitoring** – Use `rs.status()` to monitor the status of the MongoDB nodes.
6. **Primary Election** – Use the election testing script in `scripts/test-election.js` to demonstrate Primary node election.

## Stop the Project

```bash
docker compose stop
```

To start it again:

```bash
docker compose start
```

**Important:** Do not use `docker compose down -v` because it deletes the MongoDB data volumes.

## Repository

GitHub: https://github.com/Wyne70/lab4-lab6-replica-driver