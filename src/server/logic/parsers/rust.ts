import path from "node:path";
import { Language, Parser } from "web-tree-sitter";
import type { ImportStatement, ParsedFile } from "./index";

let rustLanguage: Language | null = null;
let parser: Parser | null = null;

async function getRustParser(): Promise<Parser> {
	if (!parser) {
		await Parser.init();
		parser = new Parser();
		const wasmPath = path.join(
			process.cwd(),
			"public/tree-sitter/tree-sitter-rust.wasm",
		);
		rustLanguage = await Language.load(wasmPath);
		parser.setLanguage(rustLanguage);
	}
	return parser;
}

export async function parseRust(
	content: string,
	filePath: string,
): Promise<ParsedFile> {
	try {
		const p = await getRustParser();
		const tree = p.parse(content);

		if (!tree?.rootNode) {
			return {
				path: filePath,
				language: "rust",
				imports: [],
				parseError: "Failed to parse: no root node",
			};
		}

		const imports: ImportStatement[] = [];

		const walkUseDeclarations = (node: any) => {
			const nodeType = node.type;

			if (nodeType === "use_declaration" || nodeType === "use_list") {
				const text = node.text.trim();
				if (text.startsWith("use ")) {
					const match = text.match(/^use\s+([^;]+)/);
					if (match) {
						const source = match[1].trim();
						imports.push({
							raw: text,
							source,
							isDynamic: false,
						});
					}
				}
			}

			if (nodeType === "extern_crate_declaration") {
				const text = node.text.trim();
				const match = text.match(/extern\s+crate\s+(\w+)/);
				if (match) {
					const source = match[1];
					imports.push({
						raw: text,
						source,
						isDynamic: false,
					});
				}
			}

			if (node.children) {
				for (const child of node.children) {
					walkUseDeclarations(child);
				}
			}
		};

		walkUseDeclarations(tree.rootNode);
		tree.delete();

		console.log(`[RustParser] ${filePath}: parsed ${imports.length} imports`);
		for (const imp of imports.slice(0, 5)) {
			console.log(`  - "${imp.source}"`);
		}

		return {
			path: filePath,
			language: "rust",
			imports,
		};
	} catch (error) {
		return {
			path: filePath,
			language: "rust",
			imports: [],
			parseError:
				error instanceof Error ? error.message : "Unknown parse error",
		};
	}
}
