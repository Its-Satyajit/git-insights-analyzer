import "dotenv/config";
import { getFileContentFromRaw } from "~/server/octokit";

async function test() {
	const owner = "Its-Satyajit";
	const repo =
		"nextjs-typescript-tailwind-shadcn-postgresql-drizzle-orm-better-auth-template";
	const branch = "main";
	const testPaths = ["package.json", "src/app/page.tsx", "src/index.ts"];

	for (const path of testPaths) {
		console.log(`\nFetching: ${path}`);

		const content = await getFileContentFromRaw({ owner, repo, branch, path });
		if (content) {
			console.log(`Success! Length: ${content.length} chars`);
		} else {
			console.log("Failed - returned null");
		}
	}
}

test().catch(console.error);
