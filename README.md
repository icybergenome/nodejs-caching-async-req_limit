# User Data API

A highly efficient Express.js API with advanced caching, rate limiting, and asynchronous processing for high-traffic scenarios.

## 🚀 Quick Start

### Installation
```bash
# Clone and install
git clone <repository-url>
cd user-data-api
pnpm install

# Set up environment
cp .env.example .env

# Run the application
pnpm run dev
```

The API will be available at `http://localhost:8000`

### Testing
```bash
# Run tests
pnpm test

# Build for production
pnpm run build
pnpm start
```

## 📚 API Endpoints

### Users
- **GET /users/:id** - Get user by ID
- **POST /users** - Create new user

### Cache Management  
- **GET /cache/status** - View cache statistics
- **DELETE /cache** - Clear cache

### Health Check
- **GET /health** - Server status

## 💡 Core Concepts Explained

### 🧠 Caching Strategy

**What it does**: Stores frequently requested data in memory for faster access.

**How it works**:
```
First request: Database (200ms) → Cache → User
Subsequent requests: Cache (1-5ms) → User
```

**Key Features**:
- **LRU (Least Recently Used)**: When cache is full, removes least popular data
- **TTL (Time To Live)**: Data expires after 60 seconds to stay fresh
- **Background Cleanup**: Automatically removes stale data every 30 seconds

**Example**:
```bash
# First request (slow - cache miss)
curl http://localhost:8000/users/1
# Response time: ~200ms, "cached": false

# Second request (fast - cache hit)  
curl http://localhost:8000/users/1
# Response time: ~5ms, "cached": true
```

### 🚦 Rate Limiting Strategy

**What it does**: Prevents system overload by limiting requests per user.

**Rules**:
- **Regular limit**: 10 requests per minute per IP
- **Burst protection**: Max 5 requests in 10 seconds per IP

**How it works**:
```
User makes requests → Rate limiter checks → Allow or block (429 error)
```

**Headers returned**:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests left in current window
- `X-RateLimit-Reset`: When limit resets
- `Retry-After`: Seconds to wait if blocked

**Example**:
```bash
# Normal request
curl -i http://localhost:8000/users/1
# Headers: X-RateLimit-Remaining: 9

# Too many requests
curl -i http://localhost:8000/users/1
# Response: 429 Too Many Requests
# Header: Retry-After: 30
```

### ⚡ Asynchronous Processing

**What it does**: Handles multiple requests efficiently without blocking.

**Key Components**:

1. **Non-blocking Operations**: Server can handle other requests while database calls are in progress

2. **Request Deduplication**: If multiple users ask for the same data simultaneously, only one database call is made

**How it works**:
```
3 users request User #1 at same time:
┌─ Request A ─┐
├─ Request B ─┤ → Queue → 1 Database Call → Shared Result → All 3 users
└─ Request C ─┘
```

**Performance Impact**:
- **Without deduplication**: 100 requests = 100 database calls = 20 seconds
- **With deduplication**: 100 requests = 1 database call = 0.2 seconds

**Example**:
```javascript
// Multiple simultaneous requests for same user
Promise.all([
  fetch('/users/1'),  // All start together
  fetch('/users/1'),  // Only 1 database call made
  fetch('/users/1')   // Results shared among all
]);
```

## 🧪 Testing the Features

### Test Caching
```bash
# First request (cache miss)
time curl http://localhost:8000/users/1

# Second request (cache hit) 
time curl http://localhost:8000/users/1

# Check cache statistics
curl http://localhost:8000/cache/status
```

### Test Rate Limiting
```bash
# Send 6 rapid requests (should hit burst limit)
for i in {1..6}; do curl http://localhost:8000/users/1; done
```

### Test Async Processing
```bash
# Send multiple requests simultaneously
curl http://localhost:8000/users/1 &
curl http://localhost:8000/users/1 &
curl http://localhost:8000/users/1 &
wait
```

## 📊 Performance Metrics

| Feature | Without Optimization | With Optimization | Improvement |
|---------|---------------------|-------------------|-------------|
| Cache Hit | 200ms (database) | 1-5ms (memory) | **40x faster** |
| Concurrent Requests | 5 × 200ms = 1000ms | 1 × 200ms = 200ms | **5x faster** |
| Rate Limiting | System overload risk | Protected | **Stable performance** |

## 🔧 Configuration

Environment variables in `.env`:
```bash
NODE_ENV=development
PORT=8000
CORS_ORIGIN=*
DB_DELAY_MS=200
```

## 🏗️ Project Structure

```
src/
├── app.ts              # Express app setup
├── index.ts            # Server startup
├── routes/             # API endpoints
├── services/           # Core logic
│   ├── cacheService.ts # LRU cache with TTL
│   ├── rateLimiter.ts  # Dual-layer rate limiting
│   └── queueService.ts # Async request deduplication
├── middleware/         # Request processing
└── database/           # Mock data storage
```

## 🎯 Key Takeaways

1. **Caching**: Smart memory management with LRU + TTL keeps data fresh and fast
2. **Rate Limiting**: Dual-layer protection (burst + sustained) prevents overload
3. **Async Processing**: Request deduplication eliminates wasteful duplicate work
