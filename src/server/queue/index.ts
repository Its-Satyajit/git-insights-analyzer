import { Queue } from "bullmq";
import { env } from "~/env";

export interface AnalysisJob {
	repoId: string;
	owner: string;
	repo: string;
	branch: string;
	githubUrl: string;
}

export const analysisQueue = new Queue<AnalysisJob>("analysis", {
	connection: {
		host: env.REDIS_HOST || "localhost",
		port: env.REDIS_PORT ? parseInt(env.REDIS_PORT, 10) : 6379,
	},
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 1000,
		},
		removeOnComplete: 100,
		removeOnFail: 50,
	},
});
