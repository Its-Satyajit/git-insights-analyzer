import { parseGo } from "./parsers/go";
import type { ParsedFile } from "./parsers/index";
import { resolveImport } from "./parsers/pathResolver";
import { parsePython } from "./parsers/python";
import { parseRust } from "./parsers/rust";
import { parseTypescript } from "./parsers/typescript";

export interface GraphNode {
	id: string;
	path: string;
	language: string;
	imports: number;
	loc?: number;
}

export interface GraphEdge {
	source: string;
	target: string;
}

export interface GraphMetadata {
	totalNodes: number;
	totalEdges: number;
	languageBreakdown: Record<string, number>;
	unresolvedImports: number;
}

export interface DependencyGraph {
	nodes: GraphNode[];
	edges: GraphEdge[];
	metadata: GraphMetadata;
}

const MAX_FILE_SIZE = 1024 * 1024;
const MAX_FILES = 500;

export interface FileContent {
	path: string;
	content: string;
	language: string;
	loc?: number;
}

export interface DependencyAnalysisResult {
	graph: DependencyGraph;
	processedFiles: number;
	skippedFiles: number;
	errorFiles: string[];
}

const LANGUAGE_PARSERS: Record<
	string,
	(content: string, path: string) => Promise<ParsedFile>
> = {
	typescript: parseTypescript,
	tsx: parseTypescript,
	js: parseTypescript,
	jsx: parseTypescript,
	python: parsePython,
	go: parseGo,
	rust: parseRust,
};

export function detectLanguage(filePath: string): string | null {
	const ext = filePath.split(".").pop()?.toLowerCase();
	const name = filePath.toLowerCase();

	if (ext === "ts" || ext === "tsx") return "typescript";
	if (ext === "js" || ext === "jsx") return "javascript";
	if (ext === "py") return "python";
	if (ext === "go") return "go";
	if (ext === "rs") return "rust";

	return null;
}

function countLoc(content: string): number {
	const lines = content.split("\n");
	let count = 0;
	let inBlockComment = false;

	for (const line of lines) {
		const trimmed = line.trim();

		if (trimmed.startsWith("/*")) inBlockComment = true;
		if (trimmed.includes("*/")) inBlockComment = false;

		if (
			!inBlockComment &&
			trimmed.length > 0 &&
			!trimmed.startsWith("//") &&
			!trimmed.startsWith("#")
		) {
			count++;
		}
	}

	return count;
}

export async function performDependencyAnalysis(
	files: FileContent[],
): Promise<DependencyAnalysisResult> {
	const codeFiles = files
		.filter((f) => {
			const lang = detectLanguage(f.path);
			return lang && LANGUAGE_PARSERS[lang];
		})
		.filter((f) => f.content.length <= MAX_FILE_SIZE)
		.slice(0, MAX_FILES);

	console.log(`[DependencyAnalysis] Processing ${codeFiles.length} code files`);

	const nodes: GraphNode[] = [];
	const edges: GraphEdge[] = [];
	const errorFiles: string[] = [];
	const unresolvedImports: string[] = [];

	const filePathSet = new Set(codeFiles.map((f) => f.path));

	for (const file of codeFiles) {
		const language = detectLanguage(file.path) || "typescript";

		const parser = LANGUAGE_PARSERS[language];
		if (!parser) continue;

		const parsed = await parser(file.content, file.path);

		if (parsed.parseError) {
			console.log(
				`[DependencyAnalysis] Parse error in ${file.path}: ${parsed.parseError}`,
			);
			errorFiles.push(file.path);
			continue;
		}

		if (parsed.imports.length > 0) {
			console.log(
				`[DependencyAnalysis] ${file.path}: ${parsed.imports.length} imports found`,
			);
			for (const imp of parsed.imports.slice(0, 3)) {
				console.log(`  - source: "${imp.source}"`);
			}
			if (parsed.imports.length > 3) {
				console.log(`  ... and ${parsed.imports.length - 3} more`);
			}
		}

		const fileEdges: GraphEdge[] = [];

		for (const imp of parsed.imports) {
			const resolved = resolveImport(imp.source, file.path);

			if (resolved.isExternal) {
				// External package - skip
			} else if (resolved.resolved) {
				const normalizedTarget = resolved.resolved;

				if (filePathSet.has(normalizedTarget)) {
					if (file.path !== normalizedTarget) {
						fileEdges.push({
							source: file.path,
							target: normalizedTarget,
						});
						console.log(
							`[DependencyAnalysis]   Edge: ${file.path} → ${normalizedTarget}`,
						);
					}
				} else {
					unresolvedImports.push(`${file.path} → ${imp.source}`);
				}
			}
		}

		nodes.push({
			id: file.path,
			path: file.path,
			language,
			imports: parsed.imports.length,
			loc: countLoc(file.content),
		});

		edges.push(...fileEdges);
	}

	const seenEdges = new Set<string>();
	const dedupedEdges = edges.filter((edge) => {
		const key = `${edge.source}:${edge.target}`;
		if (seenEdges.has(key)) return false;
		seenEdges.add(key);
		return true;
	});

	const languageBreakdown: Record<string, number> = {};
	for (const node of nodes) {
		languageBreakdown[node.language] =
			(languageBreakdown[node.language] || 0) + 1;
	}

	const graph: DependencyGraph = {
		nodes,
		edges: dedupedEdges,
		metadata: {
			totalNodes: nodes.length,
			totalEdges: dedupedEdges.length,
			languageBreakdown,
			unresolvedImports: unresolvedImports.length,
		},
	};

	return {
		graph,
		processedFiles: codeFiles.length,
		skippedFiles: files.length - codeFiles.length,
		errorFiles,
	};
}
