# Phase 2: GitHub Integration

## Planning & Design (Grill-Me)
- [x] Determine Data Fetching Architecture (Sync vs Async) & Repository Limits -> **Decision: Synchronous + Hard Limits (max 1000 files). Background jobs will be added later.**
- [x] Choose GitHub API Protocol (REST vs GraphQL) & Auth Strategy -> **Decision: REST API (Octokit) with flexible Auth (server PAT by default, user PAT or GitHub OAuth later).**
- [x] Define Database Schema (repositories, files, commits) -> **Decision: Option A: Link `files` and `commits` directly to `repositories` via `repoId`. No join table for now.**
- [x] Plan Error Handling Strategy (rate limits, 404s, private repos) -> **Decision: Standard HTTP Status Codes (404, 429, 413) with frontend toast notifications.**

## Implementation (Day 3-5)
- [x] Setup GitHub API client (Octokit / fetch)
- [x] Update DB Schema (Drizzle ORM)
- [x] Implement Metadata fetching
- [x] Implement File Tree fetching
- [x] Implement Commit fetching
- [x] Handle API Errors appropriately

# Phase 3: Basic Analysis (Day 5-7)

## Planning & Design (Grill-Me)
- [x] Define Analysis Trigger (**Decision: Synchronous in `/analyze` API**)
- [x] Dataset Scope (**Decision: Full tree for counts, top 1000 for details**)
- [x] LOC Strategy (**Decision: Hybrid - Top 10 files exact, others heuristic**)
- [x] Persistence (**Decision: Structured columns + JSON `fileTree` in `analysis_results`**)

## Implementation
- [x] Implement `getFileContent` in Octokit DAL
- [x] Create `analysis_results` DAL
- [x] Implement iterative `performBasicAnalysis` logic
- [x] Add Hybrid LOC counting (Top 10 extraction + heuristic)
- [x] Integrate analysis into `/analyze` endpoint
- [x] Verify results via script and manual API test

# Phase 4: Dashboard UI (Day 7-10)

## Planning & Design (Grill-Me)
- [x] Dashboard Data Flow (React Query vs Zustand) -> **Decision: React Query for fetching.**
- [x] Routing & Initial State -> **Decision: `/dashboard/[repoId]` triggers analysis if missing.**
- [x] Visualization Details (Pie vs Bar)
- [x] File Explorer Interaction (Tree vs Flat) -> **Decision: Nested Collapsible Tree.**

## Implementation
- [x] Setup `shadcn/charts` and dependencies
- [x] Implement `GET /api/dashboard/:repoId` (Optimized with JSON persistence)
- [x] Create Dashboard Layout with Sidebar (Using `CollapsibleFileTree`)
- [x] Build Stat Cards (Total Files, LOC, etc.)
- [x] Build File Type Chart (Donut/Bar)
- [x] Implement Virtualized File Explorer (`@tanstack/react-virtual`)
- [x] Add Skeleton Loaders and Empty States

# Phase 5: Search & Filtering (Day 10-12)

## Planning & Design (Grill-Me)
- [x] Search Strategy (Client vs Server) -> **Decision: Client-side for instant feedback.**
- [x] UI Placement -> **Decision: Inside `VirtualizedFileTree` header.**

## Implementation
- [x] Add `searchQuery` state to `VirtualizedFileTree`
- [x] Implement filtering logic in `visibleNodes` memo
- [x] UI: Add `Input` component and search icon
- [x] Add "No results found" empty state

# Phase 6: Dependency Graph (Day 13-16)

## Planning & Design (Grill-Me)

### Architecture
- [x] Pipeline Integration -> **Decision: Synchronous - new `performDependencyAnalysis` function called after `performBasicAnalysis` in `/analyze` pipeline.**
- [x] File Scope -> **Decision: Sub-limit of 500 code files (max 1000 total).**
- [x] API Modularization -> **Decision: Route-per-file Elysia plugin pattern. Each route in its own file under `src/server/api/`.**

### Language Support
- [x] Languages Supported -> **Decision: Tier 1 - JavaScript/TypeScript + Python + Go + Rust. Excludes C/C++, Java, Ruby, PHP for MVP.**
- [x] Parser Approach -> **Decision: Tree-sitter WASM via `web-tree-sitter` package.**
- [x] WASM Storage -> **Decision: Bundled in `/public/tree-sitter/` directory.**
- [x] WASM Loading -> **Decision: Lazy per language - load on first use, cache in memory.**

### Parser Implementation
- [x] Parser Structure -> **Decision: Language-specific classes with shared `ImportParser` interface in `src/server/logic/parsers/`.**
- [x] Path Resolution -> **Decision: Heuristic resolution - relative paths + alias stripping + common extensions. Unresolved imports tracked for debugging.**
- [x] Error Handling -> **Decision: Skip failed files + track in `unresolvedImports` metadata. Pipeline always completes.**

### Graph Data
- [x] Graph Data Structure -> **Decision: `{ nodes: GraphNode[]; edges: GraphEdge[]; metadata: GraphMetadata }` - separate nodes and edges.**
- [x] Node Data -> **Decision: `{ path, language, imports: number, loc?: number }` - includes LOC from Phase 3.**
- [x] Edge Deduplication -> **Decision: One edge per unique (source, target) pair.**
- [x] Self-loops -> **Decision: Excluded from graph.**
- [x] External Dependencies -> **Decision: Stripped - internal imports only.**
- [x] Storage -> **Decision: Store in existing `analysis_results.dependencyGraphJson` column. Re-analysis replaces existing.**
- [x] File Size Limit -> **Decision: Skip files >1MB before parsing.**

### Visualization & UI
- [x] Visualization -> **Decision: "Most connected files" ranked list with drill-down showing immediate connections.**
- [x] Dashboard Integration -> **Decision: Separate page - `/dependencies/[repoId]`.**
- [x] Data Fetching -> **Decision: Separate endpoint - `GET /dashboard/:repoId/graph`.**

## Implementation

### API Modularization
- [x] Create `src/server/api/routes/analyze.ts`
- [x] Create `src/server/api/routes/dashboard.ts`
- [x] Create `src/server/api/routes/file-content.ts`
- [x] Refactor `src/server/api/index.ts` to compose plugins

### Tree-sitter Setup
- [ ] Install dependencies (`web-tree-sitter`, tree-sitter language parsers)
- [ ] Download WASM files to `public/tree-sitter/`
- [ ] Add WASM MIME type to `next.config.ts`
- [ ] Create `src/server/logic/parsers/index.ts` with shared interface
- [ ] Create `src/server/logic/parsers/typescript.ts`
- [ ] Create `src/server/logic/parsers/python.ts`
- [ ] Create `src/server/logic/parsers/go.ts`
- [ ] Create `src/server/logic/parsers/rust.ts`

### Core Logic
- [ ] Create `src/server/logic/dependencyAnalysis.ts` with `performDependencyAnalysis`
- [ ] Implement path resolution utility
- [ ] Integrate into `/analyze` pipeline

### API Routes
- [ ] Add `GET /dashboard/:repoId/graph` endpoint
- [ ] Add route plugin file for graph endpoint

### Frontend
- [ ] Create `src/app/dependencies/[repoId]/page.tsx`
- [ ] Create `src/components/dependencies/HubFilesList.tsx`
- [ ] Create `src/components/dependencies/ConnectionDrawer.tsx`
- [ ] Add React Query hook for graph data
- [ ] Add loading skeleton for dependencies page
