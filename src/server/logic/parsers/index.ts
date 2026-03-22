export interface ImportStatement {
	raw: string; // e.g., "import Foo from './Foo'"
	source: string; // e.g., "./Foo"
	isDynamic: boolean; // true for import('./Foo')
}

export interface ParsedFile {
	path: string;
	language: string;
	imports: ImportStatement[];
	parseError?: string;
}
