import type { Metadata } from "next";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ repoId: string }>;
}): Promise<Metadata> {
	const { repoId } = await params;

	return {
		title: `Repository ${repoId}`,
		description: `Analysis results for repository ${repoId}`,
		openGraph: {
			title: `Repository ${repoId} Analysis`,
			description: `View detailed analysis for ${repoId}`,
		},
	};
}
