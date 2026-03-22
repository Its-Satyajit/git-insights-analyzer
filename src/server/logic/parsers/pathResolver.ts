export interface ResolvedImport {
	original: string;
	resolved: string | null;
	isExternal: boolean;
}

export interface PathResolverOptions {
	aliasPrefix: string;
	aliasBase: string;
	baseDir: string;
}

const DEFAULT_OPTIONS: PathResolverOptions = {
	aliasPrefix: "@/",
	aliasBase: "src",
	baseDir: "",
};

const EXTENSIONS = [
	".ts",
	".tsx",
	".js",
	".jsx",
	"/index.ts",
	"/index.tsx",
	"/index.js",
];

const EXTERNAL_PATTERNS = [
	/^[^./@]/, // doesn't start with ./, ../, or @/
	/^@?[a-z-]+\//, // @scope/package or package/subpath
];

function isExternal(source: string): boolean {
	return EXTERNAL_PATTERNS.some((pattern) => pattern.test(source));
}

function tryExtensions(basePath: string): string | null {
	for (const ext of EXTENSIONS) {
		const fullPath = basePath + ext;
		if (fullPath) {
			return fullPath;
		}
	}
	return null;
}

export function resolveImport(
	source: string,
	filePath: string,
	options: Partial<PathResolverOptions> = {},
): ResolvedImport {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	if (isExternal(source)) {
		return {
			original: source,
			resolved: null,
			isExternal: true,
		};
	}

	let resolved: string | null = null;

	// Handle alias imports (e.g., @/components/Button)
	if (source.startsWith(opts.aliasPrefix)) {
		const withoutAlias = source.slice(opts.aliasPrefix.length);
		const basePath = `${opts.baseDir}/${opts.aliasBase}/${withoutAlias}`;
		resolved = tryExtensions(basePath);
	}
	// Handle relative imports
	else if (source.startsWith("./") || source.startsWith("../")) {
		const fileDir = filePath.includes("/")
			? filePath.slice(0, filePath.lastIndexOf("/"))
			: "";
		const basePath = `${fileDir}/${source}`;
		resolved = tryExtensions(basePath);
	}
	// Bare imports without ./ or @/ - treat as external
	else {
		return {
			original: source,
			resolved: null,
			isExternal: true,
		};
	}

	return {
		original: source,
		resolved,
		isExternal: false,
	};
}

export function resolveAllImports(
	imports: { source: string }[],
	filePath: string,
	options?: Partial<PathResolverOptions>,
): ResolvedImport[] {
	return imports.map((imp) => resolveImport(imp.source, filePath, options));
}
