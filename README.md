# 🍽️ Zomatoes

> A production-grade food ordering and restaurant discovery platform built using a distributed service architecture, RabbitMQ event-driven communication, Socket.IO real-time updates, and Razorpay payment integration.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Message%20Broker-orange)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-blue)

---

# 📖 Overview

Zomatoes is a full-stack food ordering platform inspired by modern food delivery applications such as Zomato and Swiggy.

Unlike traditional monolithic applications, Zomatoes is designed around a distributed service architecture where multiple independent services communicate asynchronously through RabbitMQ. Real-time updates are delivered to connected clients using Socket.IO, enabling live order tracking and instant notifications.

The platform demonstrates production-grade backend concepts including:

* Distributed Service Architecture
* Event-Driven Communication
* Message Queues
* Real-Time Systems
* Secure Authentication
* Payment Processing
* Service Decoupling
* Scalable System Design

---

# ✨ Features

## 👤 User Features

* User Registration & Login
* JWT Authentication
* Profile Management
* Restaurant Discovery
* Search & Filtering
* Cart Management
* Order Placement
* Order History
* Live Order Tracking

## 🍔 Restaurant Features

* Restaurant Management
* Menu Management
* Category Management
* Item Availability Control
* Order Processing

## 🛒 Ordering Features

* Add To Cart
* Remove From Cart
* Quantity Updates
* Checkout Flow
* Order Tracking
* Order History

## 💳 Payment Features

* Razorpay Integration
* Payment Verification
* Secure Transactions
* Payment Status Tracking
* Failed Payment Handling

## 🔔 Real-Time Features

* Live Order Status Updates
* Real-Time Notifications
* Instant Event Broadcasting
* Socket.IO Integration

---

# 🏗️ System Architecture

The system is composed of multiple independent services.

```text
┌─────────────────────────────────────────┐
│                Frontend                 │
└─────────────────────────────────────────┘
                    │

 ┌───────────────┬───────────────┬───────────────┐
 │               │               │               │

 ▼               ▼               ▼               ▼

Auth         User         Restaurant       Order
Service      Service      Service          Service

 │               │               │               │
 └───────────────┴───────┬───────┴───────────────┘
                         │

                         ▼

                  RabbitMQ Broker

                         │

        ┌────────────────┼────────────────┐

        ▼                ▼                ▼

 Notification      Payment        Other Event
 Service           Service        Consumers

        │                │
        └───────┬────────┘

                ▼

             Socket.IO

                ▼

             Frontend
```

---

# 🔄 Event Driven Communication

Services communicate asynchronously using RabbitMQ.

## Example Events

```text
ORDER_CREATED
ORDER_CONFIRMED
PAYMENT_COMPLETED
PAYMENT_FAILED
ORDER_PREPARING
ORDER_OUT_FOR_DELIVERY
ORDER_DELIVERED
NOTIFICATION_CREATED
```

### Event Flow

```text
User Places Order
       │
       ▼
 Order Service
       │
       ▼
 Publish Event
       │
       ▼
    RabbitMQ
       │
       ├────────► Payment Service
       ├────────► Notification Service
       └────────► Other Consumers
```

This architecture provides:

* Loose Coupling
* Improved Scalability
* Better Reliability
* Independent Service Deployment
* Easier Maintenance

---

# ⚡ Real-Time Communication

Socket.IO is used to provide real-time updates to connected clients.

### Real-Time Updates

* Order Status Changes
* Payment Updates
* Notifications
* Restaurant Updates
* Delivery Updates

### Example Flow

```text
Order Status Updated
         │
         ▼
 Notification Service
         │
         ▼
     Socket.IO
         │
         ▼
     Frontend
```

---

# 💳 Payment Integration

Payments are handled using Razorpay.

### Supported Workflow

```text
Create Order
      │
      ▼
Generate Razorpay Order
      │
      ▼
User Payment
      │
      ▼
Verify Signature
      │
      ▼
Publish PAYMENT_COMPLETED Event
      │
      ▼
Update Order Status
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Redux Toolkit
* TanStack Query
* Tailwind CSS
* Socket.IO Client

## Backend

* Node.js
* Express.js
* TypeScript

## Database

* MongoDB

## Message Broker

* RabbitMQ

## Real-Time Communication

* Socket.IO

## Authentication

* JWT
* Refresh Tokens
* bcrypt

## Payments

* Razorpay

## DevOps

* Docker
* Docker Compose
* GitHub Actions

---

# 📁 Project Structure

```bash
zomatoes/

├── services/
│
├── auth-service/
├── user-service/
├── restaurant-service/
├── menu-service/
├── order-service/
├── payment-service/
├── notification-service/
│
├── frontend/
│
├── shared/
│
├── docker/
│
├── docs/
│
└── README.md
```

---

# 🔐 Security

Implemented security measures include:

* JWT Authentication
* Password Hashing
* Refresh Tokens
* Input Validation
* Request Sanitization
* Secure Payment Verification
* Environment Variable Protection

---

# 📈 Scalability Considerations

The application is designed with scalability in mind.

### Implemented

* Service Separation
* Event-Driven Architecture
* Asynchronous Communication
* Real-Time Messaging
* Stateless Services
* Independent Deployability

### Future Enhancements

* Kubernetes Deployment
* Distributed Tracing
* Circuit Breakers
* Service Discovery
* Rate Limiting
* Centralized Logging
* Monitoring & Alerting

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/your-username/zomatoes.git
cd zomatoes
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

```env
PORT=
MONGO_URI=
JWT_SECRET=
RABBITMQ_URL=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CLIENT_URL=
```

## Start RabbitMQ

```bash
docker compose up rabbitmq
```

## Start Services

```bash
npm run dev
```

## Start Frontend

```bash
npm run dev
```

---

# 🧪 Testing

```bash
npm run test
```

### Testing Scope

* Unit Testing
* Integration Testing
* Service Testing
* API Testing

---

# 🎯 Learning Outcomes

This project demonstrates hands-on experience with:

* Distributed Systems
* Event-Driven Architecture
* RabbitMQ
* Socket.IO
* MongoDB
* Payment Gateway Integration
* Authentication & Authorization
* Service-Oriented Design
* Real-Time Applications
* Production-Grade Backend Development

---

# 👨‍💻 Author

**Mohammad Razim**

Building scalable web applications and distributed backend systems.

---

# ⭐ Support

If you found this project useful, consider giving it a star.
