import type { ParsedFile } from "./index";

export async function parseRust(
	_content: string,
	_filePath: string,
): Promise<ParsedFile> {
	return {
		path: _filePath,
		language: "rust",
		imports: [],
		parseError: "Rust parser not yet implemented",
	};
}
