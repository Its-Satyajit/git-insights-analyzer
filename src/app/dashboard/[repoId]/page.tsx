"use client";

import { SiGithub } from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { Code2, FolderTree, GitBranch, GitGraph, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { Suspense, use, useState } from "react";
import type { FileTreeItem } from "~/components/CollapsibleFileTree";
import { AnalysisProgress } from "~/components/dashboard/AnalysisProgress";
import { ContributorsList } from "~/components/dashboard/ContributorsList";
import { DashboardHero } from "~/components/dashboard/DashboardHero";
import { FileViewer } from "~/components/dashboard/FileViewer";
import { StatCardsSkeleton } from "~/components/dashboard/StatCards";
import { VirtualizedFileTree } from "~/components/dashboard/VirtualizedFileTree";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/lib/eden";

export default function RepoPage({
	params,
}: {
	params: Promise<{ repoId: string }>;
}) {
	return (
		<main className="blueprint-grid relative min-h-screen overflow-hidden bg-background pt-14">
			<div className="mx-auto max-w-7xl px-6 py-8">
				<Suspense fallback={<StatCardsSkeleton />}>
					<DashboardData params={params} />
				</Suspense>
			</div>
		</main>
	);
}

function DashboardData({ params }: { params: Promise<{ repoId: string }> }) {
	const { repoId } = use(params);
	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"explorer" | "contributors">(
		"explorer",
	);
	const [contributorsSort, setContributorsSort] = useState<
		"contributions" | "newest"
	>("contributions");
	const contributorsParentRef = React.useRef<HTMLDivElement>(null);

	const { data: response, isLoading } = useQuery({
		queryKey: ["repo-dashboard", repoId],
		queryFn: async () => {
			const res = await api.dashboard({ repoId }).get();
			return res;
		},
		enabled: !!repoId,
		retry: false,
	});

	const { data: contributorsData, isLoading: isContributorsLoading } = useQuery(
		{
			queryKey: ["contributors", repoId, contributorsSort],
			queryFn: async () => {
				const res = await fetch(
					`/api/repos/${repoId}/contributors?sort=${contributorsSort}`,
				);
				if (!res.ok) throw new Error("Failed to fetch contributors");
				return res.json();
			},
			enabled: !!repoId && activeTab === "contributors",
		},
	);

	const {
		data: fileContent,
		isLoading: isFileLoading,
		error: fileError,
	} = useQuery({
		queryKey: ["file-content", repoId, selectedFile],
		queryFn: async () => {
			if (!selectedFile || !response?.data) return null;

			const data = response.data as {
				owner: string;
				name: string;
				defaultBranch: string;
				isPrivate: boolean;
			};

			const ext = selectedFile.split(".").pop()?.toLowerCase();
			const isImage = [
				"png",
				"jpg",
				"jpeg",
				"gif",
				"svg",
				"webp",
				"ico",
			].includes(ext || "");
			if (isImage) {
				return "IMAGE_PLACEHOLDER";
			}

			if (!data.isPrivate) {
				const branch = data.defaultBranch || "main";
				const url = `https://raw.githubusercontent.com/${data.owner}/${data.name}/refs/heads/${branch}/${selectedFile}`;
				const res = await fetch(url);
				if (!res.ok) throw new Error("Failed to fetch file");
				return res.text();
			}

			const res = await api["file-content"].get({
				query: { repoId, path: selectedFile },
			});
			if (res.error) {
				const errorVal = res.error.value;
				const errorMsg =
					typeof errorVal === "string"
						? errorVal
						: errorVal && typeof errorVal === "object" && "summary" in errorVal
							? (errorVal as { summary: string }).summary
							: JSON.stringify(errorVal);
				throw new Error(errorMsg);
			}
			return res.data?.content;
		},
		enabled: !!selectedFile && !!response?.data,
	});

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-32">
				<div className="mb-6 flex items-center gap-3 font-mono text-muted-foreground text-sm">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span className="uppercase tracking-widest">Loading Dashboard</span>
				</div>
			</div>
		);
	}

	if (!response?.data || typeof response.data !== "object") {
		return (
			<div className="flex flex-col items-center justify-center py-32">
				<div className="mb-4 border border-destructive/30 bg-destructive/5 px-4 py-2 font-mono text-destructive text-sm">
					ERROR: Failed to load repository
				</div>
				<Link href="/">
					<Button
						className="font-mono text-xs uppercase tracking-wider"
						variant="outline"
					>
						Return Home
					</Button>
				</Link>
			</div>
		);
	}
	const data = response.data as unknown as {
		id: string;
		owner: string;
		name: string;
		fullName: string;
		url?: string;
		defaultBranch: string;
		isPrivate: boolean;
		primaryLanguage: string;
		description?: string;
		avatarUrl?: string;
		stars?: number;
		forks?: number;
		fileTree: FileTreeItem[];
		analysisResults: Array<{
			totalFiles: number;
			totalDirectories: number;
			totalLines: number;
		}>;
		fileTypeBreakdown?: Record<string, number>;
		contributorCount?: number;
	};
	const analysis = data.analysisResults?.[0];

	const handleFileSelect = (filePath: string) => {
		setSelectedFile(filePath);
	};

	return (
		<div className="flex flex-col gap-0">
			<DashboardHero
				analysis={analysis}
				contributorCount={data.contributorCount ?? contributorsData?.length}
				repo={data}
			/>

			{/* Analysis Status - compact inline */}
			<section className="flex items-center gap-4 border-border border-t py-3">
				<span className="shrink-0 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
					Status
				</span>
				<AnalysisProgress repoId={repoId} />
			</section>

			{/* Main content tabs */}
			<section className="border-border border-t py-6">
				<Tabs
					onValueChange={(v) => setActiveTab(v as typeof activeTab)}
					value={activeTab}
				>
					<div className="mb-6 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
								View Mode
							</span>
							<div className="line-rule hidden flex-1 sm:block" />
						</div>
						<TabsList className="bg-transparent p-0">
							<TabsTrigger className="tab-pill" value="explorer">
								<FolderTree className="h-3 w-3" />
								Explorer
							</TabsTrigger>
							<TabsTrigger className="tab-pill" value="contributors">
								<GitGraph className="h-3 w-3" />
								Contributors
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent className="mt-0" value="explorer">
						<div
							className="grid gap-0 lg:grid-cols-[320px_1fr]"
							style={{ height: "calc(100vh - 320px)" }}
						>
							<div className="overflow-hidden border border-border bg-card">
								<VirtualizedFileTree
									defaultBranch={data.defaultBranch}
									fileTree={data.fileTree ?? []}
									isPrivate={data.isPrivate}
									name={data.name}
									onFileSelect={handleFileSelect}
									owner={data.owner}
									repoId={data.id}
								/>
							</div>
							<div className="overflow-hidden border border-border border-l-0 bg-card">
								{selectedFile ? (
									<FileViewer
										content={fileContent ?? null}
										error={fileError ?? null}
										filePath={selectedFile}
										isLoading={isFileLoading ?? false}
										repo={{
											owner: data.owner,
											name: data.name,
											branch: data.defaultBranch || "main",
											isPrivate: data.isPrivate,
										}}
									/>
								) : (
									<div className="flex h-full min-h-[400px] flex-col items-center justify-center text-muted-foreground">
										<Code2 className="mb-4 h-8 w-8 opacity-20" />
										<p className="font-mono text-xs uppercase tracking-wider">
											Select a file to view its contents
										</p>
									</div>
								)}
							</div>
						</div>
					</TabsContent>

					<TabsContent className="mt-0" value="contributors">
						<div className="border border-border bg-card p-6">
							{contributorsData && contributorsData.length > 0 && (
								<div className="mb-6 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
											Sort By
										</span>
									</div>
									<Tabs
										onValueChange={(v) =>
											setContributorsSort(v as typeof contributorsSort)
										}
										value={contributorsSort}
									>
										<TabsList className="bg-transparent p-0">
											<TabsTrigger className="tab-pill" value="contributions">
												Top Contributors
											</TabsTrigger>
											<TabsTrigger className="tab-pill" value="newest">
												Recently Added
											</TabsTrigger>
										</TabsList>
									</Tabs>
								</div>
							)}
							{isContributorsLoading ? (
								<div className="flex items-center justify-center p-8">
									<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
								</div>
							) : contributorsData && contributorsData.length > 0 ? (
								<div
									className="relative w-full overflow-auto"
									ref={contributorsParentRef}
									style={{ height: "calc(100vh - 400px)" }}
								>
									<ContributorsList
										contributors={contributorsData}
										parentRef={contributorsParentRef}
									/>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
									<GitGraph className="mb-4 h-8 w-8 opacity-20" />
									<p className="font-mono text-xs uppercase tracking-wider">
										No contributors found
									</p>
								</div>
							)}
						</div>
					</TabsContent>
				</Tabs>
			</section>

			{/* Footer */}
			<footer className="mt-8 flex flex-col items-center justify-between gap-4 border-border border-t py-6 md:flex-row">
				<div className="flex items-center gap-6">
					<span className="font-(family-name:--font-display) text-foreground text-sm">
						Analyze
					</span>
					<div className="flex items-center gap-4 font-mono text-muted-foreground text-xs">
						<a
							className="flex items-center gap-1.5 transition-colors hover:text-foreground"
							href="https://github.com/Its-Satyajit/git-insights-analyzer"
							rel="noopener noreferrer"
							target="_blank"
						>
							<SiGithub className="h-3 w-3" />
							<span>Source</span>
						</a>
						<span className="text-border">·</span>
						<span>
							Built by{" "}
							<a
								className="text-foreground transition-colors hover:text-accent"
								href="https://github.com/Its-Satyajit"
								rel="noopener noreferrer"
								target="_blank"
							>
								Satyajit
							</a>
						</span>
						<span className="text-border">·</span>
						<Link
							className="transition-colors hover:text-foreground"
							href="/legal"
						>
							Legal
						</Link>
					</div>
				</div>
				<div className="flex items-center gap-6 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
					<span>
						Branch <span className="text-foreground">{data.defaultBranch}</span>
					</span>
					<span className="text-border">·</span>
					<span>
						Status <span className="text-accent">Analyzed</span>
					</span>
				</div>
			</footer>
		</div>
	);
}
