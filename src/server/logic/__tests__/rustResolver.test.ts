import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveRustImport } from "../parsers/rust";

describe("Rust Import Resolver", () => {
	describe("crate:: imports (current crate)", () => {
		it("should resolve crate::module to lib.rs", () => {
			const result = resolveRustImport(
				"crate::config",
				"crates/core/src/lib.rs",
			);
			expect(result).toEqual({
				resolved: "crates/core/src/config.rs",
				isExternal: false,
			});
		});

		it("should resolve crate::module::submodule", () => {
			const result = resolveRustImport(
				"crate::utils::helpers",
				"crates/core/src/lib.rs",
			);
			expect(result).toEqual({
				resolved: "crates/core/src/utils/helpers.rs",
				isExternal: false,
			});
		});

		it("should resolve from module file", () => {
			const result = resolveRustImport(
				"crate::config",
				"crates/core/src/main.rs",
			);
			expect(result).toEqual({
				resolved: "crates/core/src/config.rs",
				isExternal: false,
			});
		});

		it("should resolve nested crate imports", () => {
			const result = resolveRustImport(
				"crate::modules::auth::providers",
				"crates/core/src/lib.rs",
			);
			expect(result).toEqual({
				resolved: "crates/core/src/modules/auth/providers.rs",
				isExternal: false,
			});
		});
	});

	describe("super:: imports (parent module)", () => {
		it("should resolve super::module to parent", () => {
			const result = resolveRustImport(
				"super::sibling",
				"crates/core/src/nested/deep/file.rs",
			);
			expect(result).toEqual({
				resolved: "crates/core/src/nested/sibling.rs",
				isExternal: false,
			});
		});

		it("should resolve super::super to grandparent", () => {
			const result = resolveRustImport(
				"super::super::utils",
				"crates/core/src/a/b/c/file.rs",
			);
			expect(result).toEqual({
				resolved: "crates/core/src/a/utils.rs",
				isExternal: false,
			});
		});
	});

	describe("self:: imports (current module)", () => {
		it("should resolve self::module", () => {
			const result = resolveRustImport(
				"self::helper",
				"crates/core/src/utils/mod.rs",
			);
			expect(result).toEqual({
				resolved: "crates/core/src/utils/helper.rs",
				isExternal: false,
			});
		});
	});

	describe("External crates", () => {
		it("should mark tokio as external", () => {
			const result = resolveRustImport("tokio::runtime", "src/main.rs");
			expect(result.isExternal).toBe(true);
		});

		it("should mark serde as external", () => {
			const result = resolveRustImport("serde::Deserialize", "src/main.rs");
			expect(result.isExternal).toBe(true);
		});

		it("should mark std as external", () => {
			const result = resolveRustImport("std::collections", "src/main.rs");
			expect(result.isExternal).toBe(true);
		});

		it("should mark anyhow as external", () => {
			const result = resolveRustImport("anyhow::Result", "src/main.rs");
			expect(result.isExternal).toBe(true);
		});

		it("should mark reqwest as external", () => {
			const result = resolveRustImport("reqwest::Client", "src/main.rs");
			expect(result.isExternal).toBe(true);
		});

		it("should mark clap as external", () => {
			const result = resolveRustImport("clap::Parser", "src/main.rs");
			expect(result.isExternal).toBe(true);
		});
	});

	describe("Absolute paths (workspace crates)", () => {
		it("should resolve biome_analyze to crate directory", () => {
			const result = resolveRustImport(
				"biome_analyze::options",
				"crates/cli/src/main.rs",
			);
			expect(result).toEqual({
				resolved: "crates/biome_analyze/src/options.rs",
				isExternal: false,
			});
		});

		it("should resolve biome_analyze::categories to file", () => {
			const result = resolveRustImport(
				"biome_analyze::categories::lint",
				"crates/cli/src/main.rs",
			);
			expect(result).toEqual({
				resolved: "crates/biome_analyze/src/categories/lint.rs",
				isExternal: false,
			});
		});

		it("should resolve biome_js_analyze", () => {
			const result = resolveRustImport(
				"biome_js_analyze::registry",
				"crates/biome_configuration/src/lib.rs",
			);
			expect(result).toEqual({
				resolved: "crates/biome_js_analyze/src/registry.rs",
				isExternal: false,
			});
		});

		it("should handle path with underscores and hyphens", () => {
			const result = resolveRustImport("my_crate_name::module", "src/lib.rs");
			expect(result).toEqual({
				resolved: "crates/my_crate_name/src/module.rs",
				isExternal: false,
			});
		});
	});

	describe("Complex paths", () => {
		it("should resolve deeply nested paths", () => {
			const result = resolveRustImport(
				"crate::a::b::c::d::e",
				"crates/core/src/lib.rs",
			);
			expect(result).toEqual({
				resolved: "crates/core/src/a/b/c/d/e.rs",
				isExternal: false,
			});
		});

		it("should handle module as file (mod.rs alternative)", () => {
			const result = resolveRustImport(
				"crate::parent::child",
				"crates/core/src/parent.rs",
			);
			expect(result).toEqual({
				resolved: "crates/core/src/parent/child.rs",
				isExternal: false,
			});
		});
	});

	describe("Edge cases", () => {
		it("should return empty for unknown patterns", () => {
			const result = resolveRustImport("???", "src/lib.rs");
			expect(result.isExternal).toBe(false);
		});

		it("should handle empty source", () => {
			const result = resolveRustImport("", "src/lib.rs");
			expect(result.isExternal).toBe(true);
		});

		it("should handle single word as module", () => {
			const result = resolveRustImport("Config", "src/lib.rs");
			expect(result.isExternal).toBe(false);
		});
	});
});
