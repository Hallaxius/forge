import { describe, expect, test } from "bun:test";
import {
	validateEmail,
	validateGitHubToken,
	validateNotEmpty,
} from "../../src/lib/validators.js";

describe("Validators", () => {
	describe("validateEmail", () => {
		test("valid emails", () => {
			expect(validateEmail("user@example.com")).toBe(true);
			expect(validateEmail("test.user@domain.co")).toBe(true);
		});

		test("invalid emails", () => {
			expect(validateEmail("")).toBe(false);
			expect(validateEmail("not-an-email")).toBe(false);
			expect(validateEmail("@domain.com")).toBe(false);
		});
	});

	describe("validateNotEmpty", () => {
		test("non-empty strings", () => {
			expect(validateNotEmpty("hello")).toBe(true);
			expect(validateNotEmpty(" ")).toBe(true);
		});

		test("empty strings", () => {
			expect(typeof validateNotEmpty("")).toBe("string");
		});
	});

	describe("validateGitHubToken", () => {
		test("valid tokens", () => {
			expect(validateGitHubToken("ghp_abc123def456ghi789jkl012")).toBe(true);
			expect(validateGitHubToken("github_pat_abc123def456")).toBe(true);
		});

		test("invalid tokens", () => {
			expect(validateGitHubToken("")).toBe(false);
			expect(validateGitHubToken("short")).toBe(false);
		});
	});
});
