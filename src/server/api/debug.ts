import { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { db } from "../db";
import { analysisResults, repositories } from "../db/schema";

export const debugRoute = new Elysia().post(
	"/debug",
	async ({ body, set }) => {
		const { repoId, action } = body;

		if (!repoId) {
			set.status = 400;
			return { error: "Missing repoId" };
		}

		try {
			switch (action) {
				case "clear-analysis": {
					// Delete analysis results for this repository
					await db
						.delete(analysisResults)
						.where(eq(analysisResults.repositoryId, repoId));

					// Reset repository status to pending
					await db
						.update(repositories)
						.set({
							analysisStatus: "pending",
							analysisPhase: null,
						})
						.where(eq(repositories.id, repoId));

					return {
						success: true,
						message: "Analysis cleared and status reset",
					};
				}
				case "reset-status": {
					// Reset repository status to pending
					await db
						.update(repositories)
						.set({
							analysisStatus: "pending",
							analysisPhase: null,
						})
						.where(eq(repositories.id, repoId));

					return { success: true, message: "Status reset to pending" };
				}
				case "queue-status": {
					// This would require Redis connection, but we can just return a placeholder
					return {
						success: true,
						message: "Queue status check - implement with Redis",
					};
				}
				default:
					set.status = 400;
					return { error: "Invalid action" };
			}
		} catch (error) {
			console.error("Debug action failed:", error);
			set.status = 500;
			return { error: "Internal server error" };
		}
	},
	{
		body: t.Object({
			repoId: t.String(),
			action: t.String(),
		}),
	},
);
