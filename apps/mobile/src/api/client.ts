import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	createApiClient as createBaseApiClient,
	createGitInsightsApi,
} from "@git-insights/api/client";
import type { GitInsightsApi } from "@git-insights/api/client";

const API_BASE_URL =
	process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
const AUTH_TOKEN_KEY = "auth_token";

let _apiClient: GitInsightsApi | null = null;
let _axiosClient: ReturnType<typeof createBaseApiClient> | null = null;

async function getToken(): Promise<string | null> {
	try {
		return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
	} catch {
		return null;
	}
}

export async function setToken(token: string | null): Promise<void> {
	try {
		if (token) {
			await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
		} else {
			await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
		}
	} catch (error) {
		console.error("[Auth] Failed to persist token:", error);
	}
}

export async function createApiClient(): Promise<GitInsightsApi> {
	if (_apiClient && _axiosClient) return _apiClient;

	const token = await getToken();

	_axiosClient = createBaseApiClient({
		baseURL: API_BASE_URL,
		timeout: 30000,
		token: token ?? undefined,
	});

	_apiClient = createGitInsightsApi(_axiosClient);
	return _apiClient;
}

export async function getApiClient(): Promise<GitInsightsApi> {
	if (!_apiClient) {
		return createApiClient();
	}
	return _apiClient;
}

export const api = {
	getTopRepos: async (...args: Parameters<GitInsightsApi["getTopRepos"]>) =>
		(await getApiClient()).getTopRepos(...args),
	searchRepos: async (...args: Parameters<GitInsightsApi["searchRepos"]>) =>
		(await getApiClient()).searchRepos(...args),
	getDashboard: async (...args: Parameters<GitInsightsApi["getDashboard"]>) =>
		(await getApiClient()).getDashboard(...args),
	getStatus: async (...args: Parameters<GitInsightsApi["getStatus"]>) =>
		(await getApiClient()).getStatus(...args),
	getContributors: async (
		...args: Parameters<GitInsightsApi["getContributors"]>
	) => (await getApiClient()).getContributors(...args),
	getTreemap: async (...args: Parameters<GitInsightsApi["getTreemap"]>) =>
		(await getApiClient()).getTreemap(...args),
	getHotspots: async (...args: Parameters<GitInsightsApi["getHotspots"]>) =>
		(await getApiClient()).getHotspots(...args),
	getFileContent: async (
		...args: Parameters<GitInsightsApi["getFileContent"]>
	) => (await getApiClient()).getFileContent(...args),
	getAlerts: async (...args: Parameters<GitInsightsApi["getAlerts"]>) =>
		(await getApiClient()).getAlerts(...args),
	analyzeRepo: async (...args: Parameters<GitInsightsApi["analyzeRepo"]>) =>
		(await getApiClient()).analyzeRepo(...args),
};

export default api;
