# Taxi WebApp Microservices Architecture

This project implements a scalable microservices architecture for a taxi/ride-booking system.

## 🚀 Services & Ports

| Service | Port | Description |
| :--- | :--- | :--- |
| **API Gateway** | `8000` | Main entry point; routes requests to all other services. |
| **Auth Service** | `5001` | Handles user/driver/admin registration, login, and JWT issuance. |
| **User Service** | `5002` | Manages customer profiles. |
| **Admin Service** | `5003` | Admin dashboard logic; performs inter-service communication via Axios. |
| **Driver Service** | `5004` | Manages driver profiles and status (online/offline). |
| **Notification Service** | `5000` | Handles SMS and app notifications. |

## 🛠️ Tech Stack
- **Runtime**: Node.js (v24+)
- **Framework**: Express.js
- **Database**: MongoDB Atlas (separate DBs for each service)
- **Auth**: JWT (Shared Secret)
- **Encryption**: Bcryptjs
- **Inter-service**: Axios
- **Proxy**: http-proxy-middleware

## 🏃 How to Run

1. **Prerequisites**: Ensure you have Node.js and MongoDB Atlas URIs ready.
2. **Setup .env**: Each service folder contains a `.env`. Ensure the `MONGO_URI` is correct for each database.
3. **Install Dependencies**: Run `npm install` in each service folder.
4. **Start Services**: In separate terminals, run `npm run dev` for each service:
   - `cd microservices/auth-service && npm run dev`
   - `cd microservices/user-service && npm run dev`
   - `cd microservices/driver-service && npm run dev`
   - `cd microservices/admin-service && npm run dev`
   - `cd microservices/notification-service && npm run dev`
   - `cd microservices/api-gateway && npm run dev`

## 📡 API Endpoints (via API Gateway: Port 8000)

### Auth
- `POST /api/auth/signup` - Register a user/driver/admin.
- `POST /api/auth/login` - Get a JWT token.

### Customer
- `GET /api/users/profile` - Get your profile (Requires 'user' or 'admin' role).
- `PUT /api/users/update-profile` - Update your profile.

### Driver
- `GET /api/drivers/profile` - Get driver profile (Requires 'driver' or 'admin' role).
- `POST /api/drivers/status` - Set status to 'online' or 'offline'.

### Admin
- `GET /api/admins/all-users` - List all registered users.
- `GET /api/admins/all-drivers` - List all registered drivers.
- `DELETE /api/admins/user/:id` - Delete a user.

## 🔒 Security
- **JWT Authorization**: All protected routes require `Authorization: Bearer <token>`.
- **Role Control**: Middleware ensures `admin` can see everything, while `users` and `drivers` are restricted to their own domains.
