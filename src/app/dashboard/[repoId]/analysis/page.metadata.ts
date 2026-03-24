import type { Metadata } from "next";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ repoId: string }>;
}): Promise<Metadata> {
	const { repoId } = await params;

	return {
		title: `Analysis - ${repoId}`,
		description: `Comprehensive analysis of ${repoId} including dependencies, hotspots, and structure`,
		openGraph: {
			title: `${repoId} - Comprehensive Analysis`,
			description: `View dependency graph, hotspots, and detailed code analysis for ${repoId}`,
		},
	};
}
