import Elysia from "elysia";
import { analyzeRoute } from "./ analyze";
import { dashboardRoute } from "./dashboard";
import { fileContentRoute } from "./file-content";
import { statusRoute } from "./status";

export const apiHandler = new Elysia()
	.get(
		"/hello-elysia",
		() => {
			return "🦊 I am Alive,";
		},
		{},
	)
	.use(analyzeRoute)
	.use(dashboardRoute)
	.use(fileContentRoute)
	.use(statusRoute);
