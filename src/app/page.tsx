import type { Metadata } from "next";
import HomeClient from "./page-client";

export const metadata: Metadata = {
	title: "Repository Analyzer - Deep Insights for Your Codebase",
	description:
		"Analyze any GitHub repository. Explore structure, analyze dependencies, find hotspots, and understand your project's architecture with AI-powered insights.",
	openGraph: {
		title: "Repository Analyzer - Deep Insights for Your Codebase",
		description:
			"Analyze any GitHub repository. Explore structure, analyze dependencies, find hotspots, and understand your project's architecture.",
	},
};

export default function Home() {
	return <HomeClient />;
}
