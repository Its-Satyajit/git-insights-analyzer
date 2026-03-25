import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("~/env", () => ({
	env: {
		NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
		GITHUB_PAT: "test-token",
		DATABASE_URL: "postgres://test:test@localhost:5432/test",
		REDIS_URL: "redis://localhost:6379",
		NODE_ENV: "test",
		BETTER_AUTH_SECRET: "test-secret",
		REDIS_HOST: "localhost",
		REDIS_PORT: "6379",
	},
}));

afterEach(() => {
	cleanup();
});
