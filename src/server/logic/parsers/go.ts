import type { ParsedFile } from "./index";

export async function parseGo(
	_content: string,
	_filePath: string,
): Promise<ParsedFile> {
	return {
		path: _filePath,
		language: "go",
		imports: [],
		parseError: "Go parser not yet implemented",
	};
}
