import Elysia, { t } from "elysia";
import type { FileTreeItem } from "~/lib/treeUtils";
import { getRepositoryData } from "../dal/repositories";

export const dashboardRoute = new Elysia().get(
	"/dashboard/:repoId",
	async ({ params, set }) => {
		const data = await getRepositoryData(params.repoId);
		if (!data) {
			set.status = 404;
			return { error: "Repository not found" };
		}

		// Use the stored fileTree from analysisResults if available
		const fileTree =
			(data.analysisResults[0]?.fileTreeJson as FileTreeItem[]) ?? [];

		return {
			...data,
			fileTree,
		};
	},
	{
		params: t.Object({
			repoId: t.String(),
		}),
	},
);
