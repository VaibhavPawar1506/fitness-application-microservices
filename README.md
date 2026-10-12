# AI Fitness Tracker - Full Stack Microservices Application

A full-stack fitness tracking platform built with Spring Boot microservices, React, OAuth2 authentication, asynchronous RabbitMQ messaging, and AI-powered workout recommendations using Google Gemini.

The application lets authenticated users log fitness activities, view their activity history, and receive personalized recommendations generated asynchronously after each workout is submitted.

## Why This Project Matters

This project demonstrates practical backend and full-stack engineering concepts that are commonly used in production systems:

- Microservice decomposition by business capability
- API Gateway based request routing
- Centralized configuration with Spring Cloud Config
- Service discovery with Eureka
- OAuth2/JWT security with Keycloak
- Synchronous REST communication between services
- Asynchronous event-driven processing with RabbitMQ
- Polyglot persistence with PostgreSQL and MongoDB
- AI integration using the Gemini API
- React frontend with protected login flow and API integration

## Architecture Overview

```text
React Frontend
      |
      | OAuth2 login + JWT
      v
API Gateway :8080
      |
      | Routes requests and injects X-User-ID
      |
      +----> User Service :8081 ----> PostgreSQL
      |
      +----> Activity Service :8082 ----> MongoDB
      |              |
      |              | Publishes activity event
      |              v
      |          RabbitMQ
      |              |
      |              v
      +----> AI Service :8083 ----> Gemini API
                     |
                     v
                  MongoDB

Config Server :8888 provides centralized service configuration
Eureka Server :8761 handles service registration and discovery
Keycloak :8181 handles authentication and token issuing
```

## Microservices

### API Gateway

The gateway is the single backend entry point for the frontend.

Responsibilities:

- Validates JWT access tokens using Keycloak public certificates.
- Routes `/api/users/**`, `/api/activities/**`, and `/api/recommendations/**` to the correct service.
- Applies CORS rules for the React frontend.
- Extracts user information from the JWT.
- Automatically syncs a Keycloak user into the User Service if the user does not already exist.
- Adds the authenticated user's ID to downstream requests using the `X-User-ID` header.

### User Service

The User Service manages local user profile data.

Responsibilities:

- Stores user details in PostgreSQL.
- Registers users synced from Keycloak.
- Provides user profile lookup.
- Exposes a validation endpoint used by the Activity Service before storing an activity.

Main endpoints:

- `POST /api/users/register`
- `GET /api/users/{userId}`
- `GET /api/users/{userId}/validate`

### Activity Service

The Activity Service manages workout tracking.

Responsibilities:

- Accepts activity submissions from authenticated users.
- Validates that the user exists by calling the User Service.
- Stores activity records in MongoDB.
- Publishes each saved activity to RabbitMQ for AI processing.
- Returns activity history and activity details.

Main endpoints:

- `POST /api/activities`
- `GET /api/activities`
- `GET /api/activities/{activityId}`

### AI Service

The AI Service generates and stores personalized workout feedback.

Responsibilities:

- Listens to activity events from RabbitMQ.
- Builds a structured prompt from activity details.
- Calls the Gemini API to generate workout analysis.
- Parses the AI response into analysis, improvements, suggestions, and safety guidance.
- Stores generated recommendations in MongoDB.
- Exposes recommendations by user or activity.

Main endpoints:

- `GET /api/recommendations/user/{userId}`
- `GET /api/recommendations/activity/{activityId}`

### Config Server

The Config Server centralizes service configuration using Spring Cloud Config in native profile mode.

Responsibilities:

- Stores shared and service-specific YAML configuration.
- Provides port, database, RabbitMQ, Eureka, Gateway, and Gemini settings to services.
- Reduces duplication across microservice configuration files.

### Eureka Server

The Eureka Server provides service discovery.

Responsibilities:

- Allows services to register themselves at startup.
- Allows the API Gateway to route requests using logical service names such as `USER-SERVICE`, `ACTIVITY-SERVICE`, and `AI-SERVICE`.

## Frontend

The frontend is built with React and Vite.

Responsibilities:

- Handles OAuth2 Authorization Code + PKCE login flow.
- Stores authentication state with Redux.
- Sends JWT tokens to the backend gateway.
- Allows users to submit fitness activities.
- Displays previous activities.
- Displays AI-generated recommendations for selected activities.

Frontend stack:

- React 19
- Vite
- Material UI
- Redux Toolkit
- Axios
- React OAuth2 Code PKCE
- React Router

## Tech Stack

Backend:

- Java 21 (LTS)
- Spring Boot 3.4
- Spring Cloud 2024
- Spring Cloud Gateway
- Spring Cloud Config
- Netflix Eureka
- Spring Security OAuth2 Resource Server
- Spring WebFlux
- Spring Data JPA
- Spring Data MongoDB
- Spring AMQP
- Lombok

Frontend:

- React
- Vite
- Material UI
- Redux Toolkit
- Axios

Infrastructure:

- Keycloak
- PostgreSQL
- MongoDB
- RabbitMQ
- Google Gemini API

## Local Ports

| Component | Port |
| --- | ---: |
| React frontend | 5173 |
| API Gateway | 8080 |
| User Service | 8081 |
| Activity Service | 8082 |
| AI Service | 8083 |
| Config Server | 8888 |
| Eureka Server | 8761 |
| Keycloak | 8181 |
| RabbitMQ | 5672 |
| RabbitMQ Management UI | 15672 |
| PostgreSQL | 5432 |
| MongoDB | 27017 |

## Request Flow

### Login and User Sync

1. The user logs in from the React frontend through Keycloak.
2. Keycloak returns a JWT access token.
3. The frontend sends API requests to the API Gateway with the token.
4. The Gateway validates the token.
5. The Gateway extracts user claims such as email, first name, last name, and Keycloak subject.
6. If the user is not present in the User Service, the Gateway registers the user automatically.
7. The Gateway forwards requests with the authenticated user's ID in the `X-User-ID` header.

### Activity Tracking

1. The user submits a workout from the frontend.
2. The request goes through the API Gateway to the Activity Service.
3. The Activity Service validates the user by calling the User Service.
4. The activity is saved in MongoDB.
5. The saved activity is published to RabbitMQ using exchange `fitness.exchange`, queue `activity.queue`, and routing key `activity.tracking`.

### AI Recommendation Generation

1. The AI Service consumes the activity message from RabbitMQ.
2. It creates a Gemini prompt using the activity type, duration, calories, and additional metrics.
3. Gemini returns structured recommendation content.
4. The AI Service parses the response into:
   - Overall analysis
   - Pace feedback
   - Heart rate feedback
   - Calories analysis
   - Improvement areas
   - Suggested workouts
   - Safety guidelines
5. The recommendation is stored in MongoDB.
6. The frontend can fetch and display the recommendation by activity ID.

## Running Locally

### Prerequisites

- Java 21 (LTS)
- Maven
- Node.js and npm
- Docker & Docker Compose (or standalone PostgreSQL, MongoDB, RabbitMQ, Keycloak)
- Gemini API key

### Required Local Setup

#### Option 1: Using Docker Compose (Recommended)

Start all backing services (PostgreSQL, MongoDB, RabbitMQ, Keycloak) with a single command:

```bash
docker compose up -d
```

#### Option 2: Standalone Setup

If running databases manually without Docker, create the PostgreSQL database:

```sql
CREATE DATABASE fitness_user_db;
```

Default PostgreSQL configuration in `configserver/src/main/resources/config/user-service.yml`:

```yaml
url: jdbc:postgresql://localhost:5432/fitness_user_db
username: postgres
password: admin@123
```

MongoDB databases are created automatically when data is inserted:

- `fitnessactivity`
- `fitnessrecommendation`

RabbitMQ defaults:

```text
host: localhost
port: 5672
username: guest
password: guest
```

Set Gemini environment variables before starting the AI Service:

```bash
GEMINI_API_URL=<your-gemini-api-url>
GEMINI_API_KEY=<your-gemini-api-key>
```

Keycloak expected realm and client:

```text
Realm: fitness-oauth2
Client ID: oauth2-pkce-client
Frontend redirect URI: http://localhost:5173
```

### Startup Order

Start infrastructure first:

1. PostgreSQL
2. MongoDB
3. RabbitMQ
4. Keycloak

Start backend services:

```bash
cd configserver
mvn spring-boot:run

cd ../eureka
mvn spring-boot:run

cd ../userservice
mvn spring-boot:run

cd ../activityservice
mvn spring-boot:run

cd ../aiservice
mvn spring-boot:run

cd ../gateway
mvn spring-boot:run
```

Start the frontend:

```bash
cd fitness-app-frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Example Activity Payload

```json
{
  "type": "RUNNING",
  "duration": 30,
  "caloriesBurned": 320,
  "startTime": "2026-10-12T07:30:00",
  "additionalMetrics": {
    "distance": "5km",
    "averageHeartRate": "142 bpm",
    "pace": "6 min/km"
  }
}
```

## Resume Summary

AI-powered fitness tracking platform built with Java, Spring Boot microservices, React, Keycloak, RabbitMQ, PostgreSQL, MongoDB, Eureka, Config Server, and Google Gemini. Designed an event-driven workflow where logged workouts are persisted, published to a message queue, processed asynchronously by an AI service, and returned as personalized workout recommendations.

## Interview Talking Points

- Designed the system as independent services to separate user management, activity tracking, AI recommendation generation, gateway routing, service discovery, and configuration.
- Used an API Gateway to centralize authentication, routing, CORS, and user context propagation.
- Integrated Keycloak OAuth2/JWT authentication so services do not need to manage login credentials directly.
- Used RabbitMQ to decouple activity creation from AI processing, improving responsiveness and fault isolation.
- Used PostgreSQL for relational user profile data and MongoDB for flexible activity and recommendation documents.
- Used Eureka service discovery so the gateway can route by service name instead of hard-coded service URLs.
- Used Spring Cloud Config to centralize environment-specific configuration.
- Integrated Gemini by generating structured prompts and parsing the response into application-level recommendation models.
- Built the React frontend with protected login, activity submission, activity listing, and recommendation display.

## Future Improvements

- Add Docker Compose for one-command local startup.
- Add centralized logging and distributed tracing.
- Add resilience patterns such as retries, timeouts, and circuit breakers.
- Add refresh-token handling and stricter frontend session management.
- Add unit and integration tests for service communication and RabbitMQ processing.
- Add API documentation with OpenAPI/Swagger.
- Add role-based access control for admin and user features.
