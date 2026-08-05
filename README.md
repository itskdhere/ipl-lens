<h1 align="center">
  <img src="public/icon.png" alt="IPL Lens Logo" width="96">
  <br>
  <b>IPL Lens</b>
</h1>

<div align="center">
  <a href="https://github.com/itskdhere/ipl-lens/actions/workflows/ci.yml">
    <img src="https://github.com/itskdhere/ipl-lens/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  &nbsp;
  <a href="https://github.com/itskdhere/ipl-lens/actions/workflows/docker-release-deploy.yml">
    <img src="https://github.com/itskdhere/ipl-lens/actions/workflows/docker-release-deploy.yml/badge.svg" alt="Docker Build, Release & Deploy" />
  </a>
</div>
<br>

IPL Lens is a full-stack web application and data platform built for querying, analyzing, and visualizing Indian Premier League (IPL 2022) cricket data. The project provides a relational database schema in PostgreSQL, RESTful backend APIs with OpenAPI (Swagger UI) documentation, an interactive Next.js web application, containerized setup via Docker Compose, and automated CI/CD pipelines.

## Links and Resources

- Live Application: https://ipl-lens.itskdhere.com
- OpenAPI Docs (Swagger UI): https://ipl-lens.itskdhere.com/api/docs
- GitHub Repository: https://github.com/itskdhere/ipl-lens
- Container Images:
  - GitHub Container Registry (GHCR):
    - Application Image: [`ghcr.io/itskdhere/ipl-lens-app:latest`](https://github.com/itskdhere/ipl-lens/pkgs/container/ipl-lens-app)
    - Setup & Migration Image: [`ghcr.io/itskdhere/ipl-lens-setup:latest`](https://github.com/itskdhere/ipl-lens/pkgs/container/ipl-lens-setup)
  - Docker Hub:
    - Application Image: [`docker.io/itskdhere/ipl-lens-app:latest`](https://hub.docker.com/r/itskdhere/ipl-lens-app)
    - Setup & Migration Image: [`docker.io/itskdhere/ipl-lens-setup:latest`](https://hub.docker.com/r/itskdhere/ipl-lens-setup)

## System Architecture

The application is structured into four main layers:

```text
+-----------------------------------------------------------------------------------+
|                                 Next.js Frontend                                  |
|  (Dashboard, Matches, Match Center, Players, Head-to-Head Matchups, Swagger UI)   |
+-----------------------------------------------------------------------------------+
                                          |
                                  HTTP(S) / JSON
                                          v
+-----------------------------------------------------------------------------------+
|                                Next.js API Routes                                 |
|            (Validation with Zod, OpenAPI Specs, Response Pagination)              |
+-----------------------------------------------------------------------------------+
                                          |
                                     Prisma ORM
                                          v
+-----------------------------------------------------------------------------------+
|                               PostgreSQL 16 Database                              |
|   (Relational Schema: Matches, Innings, Commentary, Players, Teams, Standings)    |
+-----------------------------------------------------------------------------------+
                                          ^
                                          |
                              Ingestion Script (One Time)
                                          |
+-----------------------------------------------------------------------------------+
|                              Raw IPL 2022 JSON Files                              |
+-----------------------------------------------------------------------------------+
```

1. **Database Layer**: PostgreSQL 16 handles structured match statistics, player profiles, ball-by-ball commentary, and wagon wheel coordinates.
2. **Ingestion Pipeline**: A TypeScript data pipeline parses raw IPL 2022 JSON files, normalizes entities, calculates aggregated stats, and seeds the database.
3. **Backend API Layer**: Next.js API routes query PostgreSQL via Prisma ORM. Endpoints use Zod for validation and export OpenAPI v3 specifications rendered via Swagger UI.
4. **Frontend Presentation Layer**: Next.js App Router (React 19) rendered with Tailwind CSS v4, Base UI, Recharts, Tabler Icons, and `next-themes`.

## Tech Stack

- **Database**: PostgreSQL v16
- **ORM**: Prisma ORM v7
- **Backend**: Next.js 16 (Node.js v24 LTS)
- **API Validation & Documentation**: Zod, `@asteasolutions/zod-to-openapi`, Swagger UI React
- **Frontend**: Next.js 16, React 19, Tailwind CSS v4, Recharts, Base UI, Tabler Icons, `next-themes`
- **Containerization**: Docker (Multi-stage build), Docker Compose
- **CI/CD**: GitHub Actions, GitHub Container Registry, Docker Hub
- **Deployment**: Render, Neon

## Database Schema and Data Ingestion

### Relational Schema Design

The PostgreSQL database uses the following core tables managed via Prisma migrations (`prisma/schema.prisma`):

- `competitions`: Information on tournament seasons, formats, and dates.
- `teams`: Team metadata, short codes, and logos.
- `players`: Player profiles, batting styles, and bowling styles.
- `venues`: Match ground locations, cities, and country details.
- `matches`: Match schedules, toss decisions, results, margins, and match awards.
- `match_innings`: Team totals, overs bowled, runs scored, and wickets lost per innings.
- `scorecard_batsmen`: Individual batting figures (runs, balls faced, strike rates, boundaries).
- `scorecard_bowlers`: Individual bowling figures (overs, maidens, runs conceded, wickets, economy rates).
- `ball_commentary`: Ball-by-ball events including runs, extras, wickets, dismissed batters, and raw commentary text.
- `wagon_wheel_shots`: Shot coordinates (X, Y) and zone classifications for individual deliveries.
- `standings`: Season points table rankings, wins, losses, net run rates, and points.
- `player_career_stats`: Pre-aggregated career metrics for batters and bowlers.

### Data Ingestion Pipeline

The data ingestion script (`scripts/ingest.ts`) processes raw JSON files from the `/dataset` folder. It runs automatically in the `setup` container during initial setup.

Processing order:

1. Competitions -> Teams -> Players -> Venues
2. Matches -> Innings -> Scorecards
3. Ball-by-Ball Commentary & Wagon Wheel Coordinates
4. Computed Standings & Career Aggregations

Database foreign keys prevent duplicate entries, and the ingestion script checks existing record counts before running to avoid redundant processing.

## Backend APIs and OpenAPI Specs

All backend endpoints return JSON format, enforce validation via Zod, and include standard error responses.

### Health Check

- `GET /api/health`: Verifies database connection status and server health.

### Matches Endpoints

- `GET /api/v1/matches`: Paginated list of matches. Supports search query, team filtering, and status filtering.
- `GET /api/v1/matches/[id]`: Detailed information for a single match.
- `GET /api/v1/matches/[id]/scorecard`: Full innings scorecards for both teams.
- `GET /api/v1/matches/[id]/worm`: Cumulative run progression comparison over by over.
- `GET /api/v1/matches/[id]/phase-analytics`: Run rate and wicket analysis split by Powerplay (overs 1-6), Middle (overs 7-15), and Death (overs 16-20).

### Players Endpoints

- `GET /api/v1/players`: Paginated list of players with search, team, and role filters.
- `GET /api/v1/players/[id]`: Detailed player profile.
- `GET /api/v1/players/[id]/career`: T20 career statistics for batting and bowling.
- `GET /api/v1/players/[id]/wagon-wheel`: Coordinate-based shot data for wagon wheel visualizations.

### Analytics and Leaderboards Endpoints

- `GET /api/v1/leaderboards`: Season leaderboards for top run scorers (Orange Cap), top wicket takers (Purple Cap), and boundary hitters (Boundary Kings). Supports `type` (`runs`, `wickets`, `sixes`) and `limit` query parameters.
- `GET /api/v1/analytics/matchups`: Head-to-head statistics between a specific batter and bowler.
- `GET /api/v1/analytics/matchups/top`: Top head-to-head player rivalries across the dataset sorted by deliveries faced.
- `GET /api/v1/standings`: League points table data with win/loss records, NRR, and recent 5-match form.
- `GET /api/v1/venues`: List of grounds with total matches hosted, 1st/2nd innings average scores, and toss decisions.

### API Documentation

Interactive Swagger UI is served directly at `/api/docs`.
Raw OpenAPI v3 JSON format is available at `/api/docs/openapi.json`.

## Frontend Features

- **Tournament Dashboard (`/dashboard`)** : Overview of competition standings, top run scorers, top wicket takers, and featured player rivalries.
- **Match Directory (`/matches`)** : List of matches with status filters, team filters, formatted IST dates, and pagination.
- **Match Center (`/matches/[id]`)** : Detailed view of a match including team line-ups, scorecards, over-by-over worm charts, phase breakdown charts, and ball-by-ball commentary.
- **Player Directory (`/players`)** : Directory of players with filtering by team, playing role, and search keywords.
- **Player Profile (`/players/[id]`)** : Detailed player card, career summary stats, zone radar chart, and interactive wagon wheel shot distribution map.
- **Head-to-Head Analytics (`/matchups`)** : Interactive search tool to compare any batter against any bowler.
- **Custom 404 Error Page (`/not-found`)** : Cricket-themed 404 page with a BackButton component and quick navigation return.

## Local Setup and Development

### Prerequisites

- **For Option 1 (Docker Compose Quickstart)**:
  - Docker with Docker Compose
- **For Option 2 (Manual Local Development)**:
  - Node.js v24 LTS
  - pnpm v11
  - PostgreSQL v16 (local installation or cloud-hosted database like Neon)

### Option 1: Quickstart using Docker Compose (Recommended)

1. Clone the repository:

   ```bash
   git clone https://github.com/itskdhere/ipl-lens.git
   cd ipl-lens
   ```

2. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

3. Place dataset files:

   Ensure the raw IPL 2022 JSON dataset files are extracted and placed inside the `./dataset` folder like this: `./dataset/Indian_Premier_League_2022-03-26/`.

4. Start all services using Docker Compose:

   ```bash
   docker compose up -d
   ```

   Instead of pulling pre-built images, to build container images locally from source code run:

   ```bash
   docker compose up -d --build
   ```

   This starts three services:
   - `db`: PostgreSQL 16 database running on port 5432.
   - `setup`: An init container that runs database migrations (`prisma migrate deploy`) and ingests data from the `/dataset` folder.
   - `app`: The Next.js production server running on port 3000 once `setup` completes successfully.

5. Open your browser:
   - Application: http://localhost:3000
   - OpenAPI Docs (Swagger UI): http://localhost:3000/api/docs

### Option 2: Manual Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/itskdhere/ipl-lens.git
   cd ipl-lens
   ```

2. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

   Ensure PostgreSQL 16 is running (locally or on a cloud provider like Neon) and configure `.env`:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ipl_db?schema=public
   ```

3. Place dataset files:

   Ensure the raw IPL 2022 JSON dataset files are extracted and placed inside the `./dataset` folder like this: `./dataset/Indian_Premier_League_2022-03-26/`.

4. Install dependencies:

   ```bash
   pnpm install
   ```

5. Run database migrations:

   ```bash
   pnpm prisma:migrate-deploy
   ```

6. Ingest dataset into PostgreSQL:

   ```bash
   pnpm ingest
   ```

7. Start the development server:

   ```bash
   pnpm dev
   ```

8. Open your browser:
   - Application: http://localhost:3000
   - OpenAPI Docs (Swagger UI): http://localhost:3000/api/docs

## Environment Variables

| Variable              | Default Value                                                 | Description                                                        |
| :-------------------- | :------------------------------------------------------------ | :----------------------------------------------------------------- |
| `PORT`                | `3000`                                                        | Port for Next.js application server.                               |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000`                                       | Public URL used for API base requests.                             |
| `DATABASE_URL`        | `postgresql://postgres:postgres@db:5432/ipl_db?schema=public` | PostgreSQL connection string.                                      |
| `POSTGRES_USER`       | `postgres`                                                    | PostgreSQL superuser username for Docker db container.             |
| `POSTGRES_PASSWORD`   | `postgres`                                                    | PostgreSQL superuser password for Docker db container.             |
| `POSTGRES_DB`         | `ipl_db`                                                      | Target PostgreSQL database name.                                   |
| `POSTGRES_PORT`       | `5432`                                                        | Host port exposed for PostgreSQL container.                        |
| `SKIP_MIGRATIONS`     | `false`                                                       | Set to `true` or `1` in setup container to skip Prisma migrations. |
| `SKIP_INGESTION`      | `false`                                                       | Set to `true` or `1` in setup container to skip data ingestion.    |

## CI/CD Workflows

The repository uses two GitHub Actions workflows located in `.github/workflows`:

1. Code Quality CI (`ci.yml`):
   - Triggers on pull requests and pushes to `main`.
   - Set up on Node.js 24 and pnpm v11 with dependency caching.
   - Runs ESLint (`pnpm lint`), TypeScript type checking (`pnpm typecheck`), and Next.js build (`pnpm build`).

2. Docker Build, Release, and Deployment (`docker-release-deploy.yml`):
   - Triggers on tag pushes matching `v*` (e.g. `v1.0.0`) or manual workflow dispatch with custom tag input.
   - Builds multi-stage Docker targets for `ipl-lens-app` and `ipl-lens-setup`.
   - Publishes images to both GitHub Container Registry (GHCR) and Docker Hub.
   - Creates a GitHub Release using `softprops/action-gh-release@v3` with build details and automated release notes.
   - Triggers automatic deployment to Render using a deploy hook webhook URL.

## Project Structure

```
ipl-lens/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # PR, lint, typecheck, and build workflow
│       └── docker-release-deploy.yml  # Docker build, GHCR/DockerHub push, release & Render deploy
├── dataset/                           # Raw IPL 2022 dataset JSON files
├── prisma/
│   ├── migrations/                    # Database migration history
│   └── schema.prisma                  # Prisma ORM schema definitions
├── public/                            # Static media and branding assets (app icons, logos)
├── scripts/
│   ├── ingest/                        # Ingestion modules (matches, players, stats) & utils
│   ├── ingest.ts                      # Data ingestion entrypoint script
│   └── setup.sh                       # Docker setup container entrypoint script
├── src/
│   ├── app/                           # Next.js App Router routes and API endpoints
│   │   ├── api/                       # API routes (matches, players, analytics, etc.)
│   │   │   ├── docs/                  # Swagger UI and openapi.json route
│   │   │   ├── health/                # Health check endpoint
│   │   │   └── v1/                    # v1 REST API routes (analytics, leaderboards, matches, players, standings, venues)
│   │   ├── dashboard/                 # Analytics dashboard page
│   │   ├── matches/                   # Matches directory and match detail pages
│   │   ├── matchups/                  # Head-to-head matchup page
│   │   ├── players/                   # Players directory and profile pages
│   │   ├── globals.css                # Global CSS styles & Tailwind v4 theme configuration
│   │   ├── layout.tsx                 # Root layout with fonts, navigation, and theme provider
│   │   ├── not-found.tsx              # Cricket-themed custom 404 error page
│   │   └── page.tsx                   # Root landing page (redirects to /dashboard)
│   ├── components/                    # UI elements, cards, charts, and layout components (Navbar, Footer)
│   │   ├── layout/                    # Header navbar and footer components
│   │   └── ui/                        # Reusable Base UI primitives (Button, BackButton, Badge, Select, Tabs, Chart, etc.)
│   ├── generated/                     # Generated Prisma client code
│   ├── lib/                           # Utility functions, Prisma client, API responses, and OpenAPI generator
│   └── providers/                     # React Context providers (Theme Provider for dark/light mode)
├── .env.example                       # Sample environment configuration file
├── components.json                    # Component registry and styling settings
├── Dockerfile                         # Multi-stage Docker build config (setup & runner targets)
├── docker-compose.yml                 # Local orchestrator config (db, setup, app)
├── next.config.ts                     # Next.js framework configuration
├── package.json                       # Project dependencies and script runner
└── prisma.config.ts                   # Prisma ORM configuration
```

<br>
<p align="center">
  <a href="https://ipl-lens.itskdhere.com">🏏🔍</a>
</p>
