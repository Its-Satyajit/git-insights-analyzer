import type { ImportStatement, ParsedFile } from "./index";

export function createRegexParser(
	language: string,
	patterns: RegExp[],
): (content: string, path: string) => Promise<ParsedFile> {
	return async (content: string, filePath: string): Promise<ParsedFile> => {
		try {
			const imports: ImportStatement[] = [];
			const lines = content.split("\n");

			for (const line of lines) {
				const trimmed = line.trim();

				if (
					trimmed.startsWith("//") ||
					trimmed.startsWith("#") ||
					trimmed.startsWith("*") ||
					trimmed.startsWith("--")
				) {
					continue;
				}

				for (const pattern of patterns) {
					const match = trimmed.match(pattern);
					if (match && match[1]) {
						const source = match[1].trim();
						if (source && !imports.some((i) => i.source === source)) {
							imports.push({
								raw: trimmed,
								source,
								isDynamic: false,
							});
						}
					}
				}
			}

			return {
				path: filePath,
				language,
				imports,
			};
		} catch (error) {
			return {
				path: filePath,
				language,
				imports: [],
				parseError:
					error instanceof Error ? error.message : "Unknown parse error",
			};
		}
	};
}
