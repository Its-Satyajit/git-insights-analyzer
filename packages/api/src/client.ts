import axios, { type AxiosInstance } from "axios";
import type {
	AlertItem,
	AnalyzeRequestBody,
	AnalyzeResponse,
	Contributor,
	DashboardData,
	FileContent,
	HotspotData,
	RepoStatus,
	Repository,
	TreemapData,
} from "./types";

export interface ApiClientConfig {
	baseURL: string;
	timeout?: number;
	token?: string;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
	const client = axios.create({
		baseURL: config.baseURL,
		timeout: config.timeout ?? 30000,
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (config.token) {
		client.interceptors.request.use((req) => {
			req.headers.Authorization = `Bearer ${config.token}`;
			return req;
		});
	}

	return client;
}

export interface GitInsightsApi {
	getTopRepos(limit?: number): Promise<Repository[]>;
	searchRepos(q: string, limit?: number): Promise<Repository[]>;
	getDashboard(repoId: string): Promise<DashboardData>;
	getStatus(repoId: string): Promise<RepoStatus>;
	getContributors(
		repoId: string,
		sort?: "contributions" | "newest",
		limit?: number,
	): Promise<Contributor[]>;
	getTreemap(repoId: string): Promise<TreemapData>;
	getHotspots(repoId: string): Promise<HotspotData[]>;
	getFileContent(repoId: string, path: string): Promise<FileContent>;
	getAlerts(repoId?: string): Promise<AlertItem[]>;
	analyzeRepo(body: AnalyzeRequestBody): Promise<AnalyzeResponse>;
}

export function createGitInsightsApi(client: AxiosInstance): GitInsightsApi {
	return {
		getTopRepos: async (limit = 10): Promise<Repository[]> => {
			const { data } = await client.get<Repository[]>("/repos/top", {
				params: { limit },
			});
			return data;
		},

		searchRepos: async (q: string, limit = 10): Promise<Repository[]> => {
			const { data } = await client.get<Repository[]>("/repos/search", {
				params: { q, limit },
			});
			return data;
		},

		getDashboard: async (repoId: string): Promise<DashboardData> => {
			const { data } = await client.get<DashboardData>(`/dashboard/${repoId}`);
			return data;
		},

		getStatus: async (repoId: string): Promise<RepoStatus> => {
			const { data } = await client.get<RepoStatus>(
				`/dashboard/${repoId}/status`,
			);
			return data;
		},

		getContributors: async (
			repoId: string,
			sort: "contributions" | "newest" = "contributions",
			limit = 100,
		): Promise<Contributor[]> => {
			const { data } = await client.get<Contributor[]>(
				`/repos/${repoId}/contributors`,
				{
					params: { sort, limit },
				},
			);
			return data;
		},

		getTreemap: async (repoId: string): Promise<TreemapData> => {
			const { data } = await client.get<TreemapData>(
				`/dashboard/${repoId}/treemap`,
			);
			return data;
		},

		getHotspots: async (repoId: string): Promise<HotspotData[]> => {
			const { data } = await client.get<HotspotData[]>(
				`/dashboard/${repoId}/hotspots`,
			);
			return data;
		},

		getFileContent: async (
			repoId: string,
			path: string,
		): Promise<FileContent> => {
			const { data } = await client.get<FileContent>(
				`/dashboard/${repoId}/file`,
				{
					params: { path },
				},
			);
			return data;
		},

		getAlerts: async (repoId?: string): Promise<AlertItem[]> => {
			const params = repoId ? { repoId } : {};
			const { data } = await client.get<AlertItem[]>("/alerts", { params });
			return data;
		},

		analyzeRepo: async (body: AnalyzeRequestBody): Promise<AnalyzeResponse> => {
			const { data } = await client.post<AnalyzeResponse>("/analyze", body);
			return data;
		},
	};
}
