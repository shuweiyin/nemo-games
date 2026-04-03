# Dockerized Nemo's Games Monorepo Architecture

**Date:** 2026-04-03
**Status:** Design Approved
**Scope:** Docker-compose infrastructure for 10+ games, static homepage, GCP deployment

---

## Overview

Transform Nemo's Games into a **fully containerized monorepo** where:
- Each game runs as an **independent Docker container** (Vite + React)
- **Static homepage** links to games via environment-configurable URLs
- **Local development:** Games on separate ports, easy debugging
- **Production:** Single domain with Nginx reverse proxy routing
- **Cloud-ready:** Deploy to GCP Cloud Run, GKE, or any Docker-compatible platform

**Why this approach:**
- **Scalability:** Each game scales independently
- **Isolation:** Developers work on games without affecting others
- **Portability:** Same setup works locally, staging, and production
- **Maintainability:** Games are self-contained, easy to update individually

---

## Architecture Overview

### Monorepo Structure

```
nemo-game/
├── docker-compose.yml              # Local development orchestration
├── docker-compose.prod.yml         # Production orchestration
├── .env.local                      # Local environment variables
├── .env.prod                       # Production environment variables
│
├── nginx/                          # Reverse proxy (production)
│   ├── Dockerfile
│   ├── nginx.conf                 # Route configuration
│   └── README.md
│
├── games/
│   ├── fishing/                   # Game 1: Fishing (Vite + React)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── FishingGame.jsx
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── index.css
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   └── README.md
│   │
│   └── space-shooter/             # Game 2: Space Shooter (Vite + React)
│       ├── src/
│       ├── public/
│       ├── index.html
│       ├── vite.config.js
│       ├── package.json
│       ├── Dockerfile
│       ├── .dockerignore
│       └── README.md
│
├── index.html                      # Static homepage
├── public/                         # Homepage static assets
├── styles.css                      # Homepage styles
├── .gitignore
└── README.md
```

Each future game (3-10) will follow the same pattern: `games/{game-name}/`

---

## Component Details

### 1. Docker Compose (Local Development)

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Game 1: Fishing
  fishing:
    build:
      context: ./games/fishing
      dockerfile: Dockerfile
    container_name: fishing-game
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
    volumes:
      - ./games/fishing/src:/app/src
    command: npm run dev

  # Game 2: Space Shooter
  space-shooter:
    build:
      context: ./games/space-shooter
      dockerfile: Dockerfile
    container_name: space-shooter-game
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
    volumes:
      - ./games/space-shooter/src:/app/src
    command: npm run dev

  # Static Homepage
  homepage:
    image: nginx:alpine
    container_name: homepage
    ports:
      - "8080:80"
    volumes:
      - ./index.html:/usr/share/nginx/html/index.html:ro
      - ./public:/usr/share/nginx/html/public:ro
      - ./styles.css:/usr/share/nginx/html/styles.css:ro
    environment:
      - FISHING_URL=http://localhost:3000
      - SPACESHOOTER_URL=http://localhost:3001
    depends_on:
      - fishing
      - space-shooter
```

**Usage:**
```bash
# Start all services
docker-compose up

# Access:
# - Homepage: http://localhost:8080
# - Fishing: http://localhost:3000
# - Space Shooter: http://localhost:3001
```

**Volumes for development:**
- `volumes:` sections allow hot-reload of game code without rebuilding containers
- Homepage is read-only (no development changes expected)

### 2. Each Game Structure (Vite + React)

**File:** `games/{game-name}/package.json`

```json
{
  "name": "game-name",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
```

**File:** `games/{game-name}/Dockerfile`

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Features:**
- Multi-stage build: Separates build dependencies from runtime
- Production uses `serve` to serve static files
- Alpine Linux keeps image size minimal (~150MB)

**File:** `games/{game-name}/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

**Key:** `host: '0.0.0.0'` allows the dev server to be accessible from outside the container.

### 3. Static Homepage

**File:** `index.html`

The existing homepage stays mostly unchanged. Add environment variable placeholders:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- existing head -->
</head>
<body>
  <!-- Game grid with dynamic links -->
  <div class="games-grid">
    <a href="${FISHING_URL}" class="game-card">
      <h3>Fishing Game</h3>
      <p>Catch rare fish and build your collection</p>
    </a>
    <a href="${SPACESHOOTER_URL}" class="game-card">
      <h3>Space Shooter</h3>
      <p>Defend the galaxy from aliens</p>
    </a>
    <!-- More games will be added here -->
  </div>

  <script>
    // Replace placeholders with env variables (injected by nginx or build)
    document.documentElement.innerHTML = document.documentElement.innerHTML
      .replace('${FISHING_URL}', window.GAMES_CONFIG?.fishing || 'http://localhost:3000')
      .replace('${SPACESHOOTER_URL}', window.GAMES_CONFIG?.spaceshooter || 'http://localhost:3001')
  </script>
</body>
</html>
```

**Alternative (cleaner):** Use a simple `.env` injection script:

```html
<script>
  window.GAMES_CONFIG = {
    fishing: window.ENV?.FISHING_URL || 'http://localhost:3000',
    spaceshooter: window.ENV?.SPACESHOOTER_URL || 'http://localhost:3001'
  };
</script>
```

### 4. Nginx Reverse Proxy (Production)

**File:** `nginx/Dockerfile`

```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**File:** `nginx/nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  upstream fishing {
    server fishing:3000;
  }

  upstream space_shooter {
    server space-shooter:3000;
  }

  server {
    listen 80;
    server_name _;

    # Root path serves static homepage
    root /usr/share/nginx/html;
    index index.html;

    # Fishing game
    location /games/fishing {
      proxy_pass http://fishing;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Space Shooter game
    location /games/space-shooter {
      proxy_pass http://space-shooter;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Fallback to homepage
    location / {
      try_files $uri /index.html;
    }

    error_page 404 /index.html;
  }
}
```

---

## Local Development Workflow

### Initial Setup

```bash
# 1. Clone and enter project
cd nemo-game

# 2. Build and start all services
docker-compose up --build

# 3. In separate terminals, develop games:
cd games/fishing
npm install
npm run dev
# Game hot-reloads at http://localhost:3000

# Similarly for space-shooter:
cd games/space-shooter
npm install
npm run dev
# Game hot-reloads at http://localhost:3001
```

### Adding a New Game (#3)

When you have `new-game.txt` ready:

1. Create folder: `mkdir games/new-game`
2. Copy template files from `games/fishing/` (package.json, vite.config.js, Dockerfile, etc.)
3. Convert `new-game.txt` → `src/components/NewGame.jsx`
4. Add to `docker-compose.yml`:
   ```yaml
   new-game:
     build: ./games/new-game
     ports: ["3002:3000"]
     ...
   ```
5. Add to `index.html` and `.env` with new game URL
6. Run: `docker-compose up --build`

### Code Changes During Development

**For games:**
- Edit `games/{game-name}/src/` files
- Changes hot-reload automatically (Vite dev server)
- No container rebuild needed

**For homepage:**
- Edit `index.html`, `styles.css`, `public/`
- Restart nginx: `docker-compose restart homepage`
- Or rebuild: `docker-compose up --build`

---

## Production Deployment Strategy

### Docker Compose for Production

**File:** `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  fishing:
    build:
      context: ./games/fishing
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
    restart: always

  space-shooter:
    build:
      context: ./games/space-shooter
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
    restart: always

  nginx:
    build: ./nginx
    ports:
      - "80:80"
    volumes:
      - ./index.html:/usr/share/nginx/html/index.html:ro
      - ./public:/usr/share/nginx/html/public:ro
    depends_on:
      - fishing
      - space-shooter
    restart: always
```

**Run locally (production mode):**
```bash
docker-compose -f docker-compose.prod.yml up --build
```

Access at `http://localhost:80` — all games routed through Nginx.

---

## GCP Deployment

### Option 1: Cloud Run (Recommended - Easiest)

**Advantages:**
- Serverless (pay per request)
- Auto-scaling
- No VM management
- Built-in HTTPS
- ~$0.20/million requests

**Deployment Steps:**

1. **Set up GCP project:**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   gcloud artifacts repositories create nemo-games --location=us-central1 --repository-format=docker
   ```

2. **Configure authentication:**
   ```bash
   gcloud auth configure-docker us-central1-docker.pkg.dev
   ```

3. **Build and push Docker images:**
   ```bash
   # Build each game image
   docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/nemo-games/fishing:latest ./games/fishing
   docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/nemo-games/space-shooter:latest ./games/space-shooter

   # Push to Artifact Registry
   docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/nemo-games/fishing:latest
   docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/nemo-games/space-shooter:latest
   ```

4. **Deploy each game to Cloud Run:**
   ```bash
   gcloud run deploy fishing \
     --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/nemo-games/fishing:latest \
     --platform managed \
     --region us-central1 \
     --memory 512Mi \
     --cpu 1

   gcloud run deploy space-shooter \
     --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/nemo-games/space-shooter:latest \
     --platform managed \
     --region us-central1 \
     --memory 512Mi \
     --cpu 1
   ```

5. **Deploy Nginx reverse proxy + homepage:**
   ```bash
   docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/nemo-games/homepage:latest ./nginx
   docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/nemo-games/homepage:latest

   gcloud run deploy homepage \
     --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/nemo-games/homepage:latest \
     --platform managed \
     --region us-central1 \
     --memory 256Mi \
     --cpu 1 \
     --allow-unauthenticated
   ```

6. **Get URLs and link them:**
   ```bash
   # Cloud Run will give you URLs like:
   # https://fishing-xxxxx-uc.a.run.app
   # https://space-shooter-xxxxx-uc.a.run.app
   # https://homepage-xxxxx-uc.a.run.app
   ```

7. **Update homepage to link to game URLs** (or use environment variables in Cloud Run).

**Cost estimate:** ~$10/month for low-traffic games.

---

### Option 2: GKE (Kubernetes - Best for Scale)

If you expect high traffic or want auto-scaling across multiple games:

1. **Create GKE cluster:**
   ```bash
   gcloud container clusters create nemo-games \
     --zone us-central1-a \
     --num-nodes 2
   ```

2. **Push images to Artifact Registry** (same as Cloud Run step 3)

3. **Create Kubernetes manifests** (`k8s/` folder):
   ```yaml
   # k8s/fishing-deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: fishing
   spec:
     replicas: 2
     selector:
       matchLabels:
         app: fishing
     template:
       metadata:
         labels:
           app: fishing
       spec:
         containers:
         - name: fishing
           image: us-central1-docker.pkg.dev/YOUR_PROJECT_ID/nemo-games/fishing:latest
           ports:
           - containerPort: 3000
   ```

4. **Deploy to GKE:**
   ```bash
   kubectl apply -f k8s/
   ```

**Cost estimate:** ~$30-50/month (two small VMs always running).

---

### Option 3: Compute Engine (VMs - Most Control)

For more control or if you want to run the entire docker-compose stack on a single VM:

1. **Create VM:**
   ```bash
   gcloud compute instances create nemo-games \
     --image-family ubuntu-2204-lts \
     --image-project ubuntu-os-cloud \
     --zone us-central1-a \
     --machine-type e2-medium
   ```

2. **SSH into VM, install Docker:**
   ```bash
   gcloud compute ssh nemo-games --zone us-central1-a
   sudo apt-get update && sudo apt-get install -y docker.io docker-compose
   ```

3. **Clone repo and run:**
   ```bash
   git clone YOUR_REPO
   cd nemo-game
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Set up Cloud DNS** to point domain to VM's external IP.

**Cost estimate:** ~$15-25/month.

---

### Recommended Flow

**Development → Staging → Production:**

1. **Local:** `docker-compose up` (all services together)
2. **Push to GitHub/Cloud Source Repos**
3. **Staging:** Deploy to GCP Cloud Run for testing
4. **Production:** Once verified, deploy with proper scaling/logging

---

## Development Workflow Summary

### Local Setup (First Time)
```bash
cd nemo-game
docker-compose up --build
# Everything runs: homepage (8080), fishing (3000), space-shooter (3001)
```

### Day-to-Day Development
```bash
# Terminal 1: Monitor all services
docker-compose logs -f

# Terminal 2: Edit fishing game code
cd games/fishing
# Edit src/... files
# Auto-hot-reloads at http://localhost:3000

# Terminal 3: Edit space-shooter code
cd games/space-shooter
# Edit src/... files
# Auto-hot-reloads at http://localhost:3001
```

### Adding Game #3
```bash
# When ready with new-game.txt:
mkdir games/new-game
# Copy package.json, vite.config.js, Dockerfile from games/fishing
# Convert new-game.txt → src/components/NewGame.jsx
# Add service to docker-compose.yml
docker-compose up --build
```

### Deploy to GCP
```bash
# Build, push, and deploy using scripts (to be created in next phase)
./deploy-to-gcp.sh fishing
./deploy-to-gcp.sh space-shooter
```

---

## Success Criteria

✅ Local development: `docker-compose up` starts all services
✅ Games run independently on different ports
✅ Homepage links to games with correct URLs
✅ Production build: `docker-compose -f docker-compose.prod.yml up` works
✅ Nginx reverse proxy routes `/games/fishing` → fishing container
✅ Games deployable to GCP Cloud Run with correct URLs
✅ Adding a new game (#3+) follows same pattern
✅ No code changes between local/production (env vars handle routing)

---

## Assumptions & Constraints

- Docker and Docker Compose installed locally (Mac/Linux/Windows)
- Node 18+ available
- GCP project with Artifact Registry enabled
- All games are stateless (client-side only, no backend)
- No database or external dependencies initially

---

## Next Steps (Implementation Phase)

1. **Create docker-compose.yml** with fishing + space-shooter services
2. **Convert fishing.txt** → `games/fishing/src/components/FishingGame.jsx`
3. **Convert space-shooter** → `games/space-shooter/src/components/SpaceShooter.jsx`
4. **Set up each game's package.json, vite.config.js, Dockerfile**
5. **Create nginx/ folder** with Dockerfile and nginx.conf
6. **Test locally**: `docker-compose up --build`
7. **Update index.html** to use game URLs
8. **Test production build**: `docker-compose -f docker-compose.prod.yml up`
9. **Create GCP deployment script** for easy publishing
10. **Deploy to GCP Cloud Run** as proof of concept

---

## Future Enhancements

- **CI/CD pipeline** (GitHub Actions or Cloud Build) for auto-deployment
- **Health checks** in docker-compose for production
- **Logging and monitoring** (Cloud Logging, Cloud Trace)
- **Database integration** if games need persistence
- **Authentication** for leaderboards or user profiles
- **Mobile optimization** across all games
- **Analytics** (Google Analytics, Mixpanel)

