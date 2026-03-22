"use client";

import {
	ArrowLeft,
	ArrowLeftFromLine,
	ArrowRight,
	FileCode,
	Loader2,
	Search,
	X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useRepoStatus } from "~/hooks/useRepoStatus";

type Node = {
	id: string;
	path: string;
	language: string;
	imports: number;
	loc?: number;
};

function DependenciesContent() {
	const params = useParams();
	const router = useRouter();
	const repoId = params.repoId as string;

	const { data: status, isLoading, error } = useRepoStatus(repoId);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);

	const graph = status?.analysis?.dependencyGraph;
	const { metadata } = status ?? {};

	const filteredNodes = useMemo(() => {
		if (!graph?.nodes) return [];
		const query = searchQuery.toLowerCase();
		return graph.nodes
			.filter((node) => node.path.toLowerCase().includes(query))
			.sort((a, b) => b.imports - a.imports);
	}, [graph?.nodes, searchQuery]);

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error || !status) {
		return (
			<div className="flex h-screen flex-col items-center justify-center gap-4">
				<p className="text-red-500">Failed to load repository status</p>
				<button
					className="text-muted-foreground text-sm hover:text-foreground"
					onClick={() => router.push("/")}
					type="button"
				>
					Go back home
				</button>
			</div>
		);
	}

	const getConnections = (nodeId: string) => {
		if (!graph) return { imports: [], importedBy: [] };
		const imports = graph.edges
			.filter((e) => e.source === nodeId)
			.map((e) => graph.nodes.find((n) => n.id === e.target))
			.filter(Boolean) as Node[];
		const importedBy = graph.edges
			.filter((e) => e.target === nodeId)
			.map((e) => graph.nodes.find((n) => n.id === e.source))
			.filter(Boolean) as Node[];
		return { imports, importedBy };
	};

	const connections = selectedNode ? getConnections(selectedNode.id) : null;

	return (
		<div className="h-screen overflow-hidden bg-background">
			<div className="border-b p-4">
				<div className="mx-auto max-w-6xl">
					<div className="mb-4 flex items-center justify-between">
						<div>
							<button
								className="mb-2 flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
								onClick={() => router.push(`/dashboard/${repoId}`)}
								type="button"
							>
								<ArrowLeft className="h-4 w-4" />
								Back to Dashboard
							</button>
							<h1 className="font-bold text-xl">
								{metadata?.fullName ?? "..."}
							</h1>
							<p className="text-muted-foreground text-sm">
								Dependency Analysis
							</p>
						</div>
						<div className="flex gap-6 text-sm">
							<div className="text-center">
								<p className="font-bold text-2xl">
									{graph?.metadata.totalNodes ?? 0}
								</p>
								<p className="text-muted-foreground">Files</p>
							</div>
							<div className="text-center">
								<p className="font-bold text-2xl">
									{graph?.metadata.totalEdges ?? 0}
								</p>
								<p className="text-muted-foreground">Connections</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex h-[calc(100vh-140px)]">
				{/* File List */}
				<div className="w-1/2 overflow-auto border-r">
					<div className="sticky top-0 z-10 border-b bg-background p-4">
						<div className="relative">
							<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<input
								className="w-full rounded-md border bg-background py-2 pr-4 pl-9 text-sm"
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search files..."
								type="text"
								value={searchQuery}
							/>
							{searchQuery && (
								<button
									className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
									onClick={() => setSearchQuery("")}
									type="button"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
					</div>

					<div className="p-2">
						{filteredNodes.map((node) => {
							const isSelected = selectedNode?.id === node.id;
							const { imports, importedBy } = getConnections(node.id);

							return (
								<button
									className={`mb-1 w-full rounded-lg p-3 text-left transition-colors ${
										isSelected
											? "bg-primary/10 ring-1 ring-primary"
											: "hover:bg-muted"
									}`}
									key={node.id}
									onClick={() => setSelectedNode(isSelected ? null : node)}
									type="button"
								>
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0 flex-1">
											<p className="truncate font-mono text-sm">{node.path}</p>
											<div className="mt-1 flex items-center gap-2">
												<span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700 text-xs">
													{node.language}
												</span>
												<span className="text-muted-foreground text-xs">
													{node.loc} lines
												</span>
											</div>
										</div>
										<div className="flex gap-2 text-xs">
											{importedBy.length > 0 && (
												<span className="flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-orange-700">
													<ArrowLeftFromLine className="h-3 w-3" />
													{importedBy.length}
												</span>
											)}
											{imports.length > 0 && (
												<span className="flex items-center gap-1 rounded bg-green-100 px-1.5 py-0.5 text-green-700">
													{imports.length}
													<ArrowRight className="h-3 w-3" />
												</span>
											)}
										</div>
									</div>
								</button>
							);
						})}

						{filteredNodes.length === 0 && (
							<div className="p-8 text-center text-muted-foreground">
								No files found
							</div>
						)}
					</div>
				</div>

				{/* Detail Panel */}
				<div className="w-1/2 overflow-auto p-6">
					{selectedNode ? (
						<div>
							<div className="mb-6">
								<h2 className="mb-2 font-mono font-semibold text-lg">
									{selectedNode.path}
								</h2>
								<div className="flex gap-4 text-muted-foreground text-sm">
									<span>{selectedNode.language}</span>
									<span>{selectedNode.loc} lines</span>
									<span>{selectedNode.imports} imports</span>
								</div>
							</div>

							{connections && connections.imports.length > 0 && (
								<div className="mb-6">
									<h3 className="mb-3 flex items-center gap-2 font-medium text-green-700 text-sm">
										<ArrowRight className="h-4 w-4" />
										Imports ({connections.imports.length})
									</h3>
									<div className="space-y-2">
										{connections.imports.map((n) => (
											<button
												className="flex w-full items-center gap-2 rounded-lg bg-green-50 p-3 text-left transition-colors hover:bg-green-100"
												key={n.id}
												onClick={() => setSelectedNode(n)}
												type="button"
											>
												<FileCode className="h-4 w-4 text-green-600" />
												<span className="flex-1 truncate font-mono text-sm">
													{n.path}
												</span>
											</button>
										))}
									</div>
								</div>
							)}

							{connections && connections.importedBy.length > 0 && (
								<div>
									<h3 className="mb-3 flex items-center gap-2 font-medium text-orange-700 text-sm">
										<ArrowLeftFromLine className="h-4 w-4" />
										Imported By ({connections.importedBy.length})
									</h3>
									<div className="space-y-2">
										{connections.importedBy.map((n) => (
											<button
												className="flex w-full items-center gap-2 rounded-lg bg-orange-50 p-3 text-left transition-colors hover:bg-orange-100"
												key={n.id}
												onClick={() => setSelectedNode(n)}
												type="button"
											>
												<FileCode className="h-4 w-4 text-orange-600" />
												<span className="flex-1 truncate font-mono text-sm">
													{n.path}
												</span>
											</button>
										))}
									</div>
								</div>
							)}

							{connections &&
								connections.imports.length === 0 &&
								connections.importedBy.length === 0 && (
									<div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
										<FileCode className="mx-auto mb-2 h-8 w-8 opacity-50" />
										<p>No internal connections found</p>
										<p className="text-sm">
											This file only imports external packages
										</p>
									</div>
								)}
						</div>
					) : (
						<div className="flex h-full flex-col items-center justify-center text-muted-foreground">
							<FileCode className="mb-4 h-16 w-16 opacity-20" />
							<p className="text-lg">Select a file</p>
							<p className="text-sm">Click on a file to see its connections</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function LoadingFallback() {
	return (
		<div className="flex h-screen items-center justify-center">
			<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	);
}

export default function DependenciesPage() {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<DependenciesContent />
		</Suspense>
	);
}
