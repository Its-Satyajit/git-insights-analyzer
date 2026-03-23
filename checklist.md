Here is the version I would actually enforce in review, because humans love turning production apps into interpretive art.

## Stack-specific checklist for a dynamic Next.js 16.2+ page

### 1. Rendering model is declared up front

- Every route must explicitly split into:
  - static shell
  - dynamic islands
  - loading/fallback UI

- `cacheComponents: true` is enabled in `next.config.ts`
- Any cacheable route/component/function uses `"use cache"` deliberately
- Anything that must stay fresh uses `no-store` or is kept outside cached scope

Next.js 16 makes caching explicit with Cache Components and `"use cache"`, and `cacheComponents: true` changes App Router data fetching so uncached work is excluded from prerenders unless you opt in. ([Next.js][1])

### 2. No accidental dynamic behavior

- `cookies()`, `headers()`, and `searchParams` are treated as dynamic triggers
- They must not leak into cached components or data functions
- If a route becomes dynamic, the team must know exactly why

Next.js documents that runtime data and uncached data can block prerendering, which is exactly how teams end up “mysteriously” losing the performance they thought they had. ([Next.js][2])

### 3. Server Components first, Client Components only when needed

- Default to Server Components
- Use Client Components only for:
  - event handlers
  - local UI state
  - browser APIs
  - rich interactivity

- Keep client boundaries as small as possible

React 19 and Next.js 16 both lean heavily into server-driven rendering patterns, Actions, and streaming-friendly component boundaries. ([React][3])

### 4. Data-fetching rules are written, not assumed

- Server reads are centralized in shared server functions
- Client-side cache is used only where the UI actually benefits from it
- Server-prefetched data is dehydrated and hydrated when the same data is reused on the client
- Avoid duplicate fetches across page, layout, and nested components

TanStack Query explicitly supports server rendering, hydration, and advanced SSR with streaming, Server Components, and the Next.js App Router. ([TanStack][4])

### 5. Forms use the modern React 19 flow

- Prefer React 19 Actions where appropriate
- Use `useActionState`, `useOptimistic`, and `useTransition` for responsive mutations
- Validation happens before submission and again on the server
- Form state, pending state, and error state must all be visible in the UI

React 19’s forms and Actions are built around `useActionState`, `useOptimistic`, and `useTransition`, which are there so the UI doesn’t freeze like it’s 2009. ([React][5])

### 6. Validation is shared and consistent

- Pick one canonical schema source per boundary
- Use Zod for runtime validation and inferred types where it fits the flow
- Keep request validation, form validation, and server validation aligned
- Never duplicate schema logic manually in three different places like a dare

Zod is a TypeScript-first runtime validation library built for parsing untrusted data into validated, typed results. ([Zod][6])

### 7. Auth is server-aware and route-aware

- Session and auth logic stay out of client-only code
- Use Better Auth consistently across the app
- In Next.js 16, auth-protection logic should follow the framework’s updated proxy model, not old middleware habits

Better Auth documents Next.js 16 compatibility and notes that middleware is now called proxy in that environment. ([Better Auth][7])

### 8. Database access stays on the server

- Drizzle queries live in server-only modules
- Migrations are handled through `drizzle-kit`
- No database client is allowed in browser bundles
- Shared query helpers are reused rather than rewritten in every route

Drizzle’s documentation positions it as lightweight, type-safe, and serverless-ready, and its migration tooling is explicitly designed around schema and SQL migration workflows. ([Drizzle ORM][8])

### 9. Typed API boundaries are enforced

- If the frontend talks to an Elysia backend, use Eden for typed client calls
- Keep API contracts shared through types rather than hand-written duplication
- Error handling and response shapes are part of the contract, not an afterthought

Eden is Elysia’s type-safe client layer for end-to-end type inference without codegen, which is exactly the kind of thing that prevents “it works on my machine” API drift. ([Elysia][9])

### 10. Long lists and heavy visuals are virtualized

- Use TanStack Virtual for large tables, feeds, or search results
- Do not render thousands of DOM nodes because someone thought scroll performance was “fine”
- Charts stay isolated and only receive the data they need

TanStack Virtual is designed for virtualizing large element lists and only rendering visible content. ([TanStack][10])

### 11. Background work never blocks the request path

- Expensive work goes to BullMQ workers
- Redis-backed jobs are queued, not executed during page render
- Notifications, sync, indexing, and exports are asynchronous by default

BullMQ is a Redis-based queue system for processing jobs separately from the request lifecycle. ([BullMQ Documentation][11])

### 12. Quality gates are non-optional

- Biome runs for formatting and consistency
- TypeScript strictness stays on
- Environment variables are validated before runtime
- PRs fail if they introduce unclear boundaries, duplicate fetching, or missing loading states

Biome is an opinionated formatter/linter tool meant to keep teams from turning style debates into a lifestyle. ([Biome][12])

## PR review acceptance criteria

Do not merge unless all of this is true:

- the route has a clear static/dynamic split
- all dynamic sections have fallbacks
- no user-specific data is cached accidentally
- server data is fetched once and reused cleanly
- forms have pending, success, and error states
- auth and DB code stay out of client bundles
- long lists are virtualized
- background jobs are offloaded
- validation is shared and consistent
- formatting and types are clean

That is the checklist. It is boring on purpose, which is usually how software survives contact with developers.

[1]: https://nextjs.org/docs/app/getting-started/caching "Getting Started: Caching"
[2]: https://nextjs.org/docs/messages/next-prerender-dynamic-metadata "Cannot access Runtime data or uncached data in ` ..."
[3]: https://react.dev/blog/2024/12/05/react-19 "React v19"
[4]: https://tanstack.com/query/v5/docs/react/guides/ssr "Server Rendering & Hydration | TanStack Query React Docs"
[5]: https://react.dev/reference/react/useActionState "useActionState"
[6]: https://zod.dev/ "Zod: Intro"
[7]: https://better-auth.com/docs/integrations/next "Next.js integration"
[8]: https://orm.drizzle.team/ "Drizzle ORM - next gen TypeScript ORM."
[9]: https://elysiajs.com/eden/overview "End-to-End Type Safety"
[10]: https://tanstack.com/virtual "TanStack Virtual"
[11]: https://docs.bullmq.io/ "What is BullMQ | BullMQ"
[12]: https://biomejs.dev/ "Biome, toolchain of the web"
