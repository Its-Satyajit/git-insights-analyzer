import Elysia, { t } from "elysia";
import { getOwnerRepo } from "~/lib/getOwnerRepo";

export const apiHandler = new Elysia()
	.get(
		"/hello-elysia",
		() => {
			return "🦊 I am Alive,";
		},
		{},
	)
	.post(
		"/analyze",
		(ctx) => {
			const parseResult = getOwnerRepo(ctx.body.githubUrl);

			return parseResult;
		},
		{
			body: t.Object({
				githubUrl: t.String(),
			}),
		},
	);
