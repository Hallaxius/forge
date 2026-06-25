import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureDir, readJSON, writeJSON } from "../../src/utils/files.js";

const testDir = join(tmpdir(), "forge-files-test");

describe("Files utils", () => {
	beforeEach(async () => {
		await rm(testDir, { recursive: true, force: true });
	});

	afterAll(async () => {
		await rm(testDir, { recursive: true, force: true });
	});

	describe("ensureDir", () => {
		test("creates directory if it does not exist", async () => {
			const dirPath = join(testDir, "new", "nested", "dir");
			expect(existsSync(dirPath)).toBe(false);

			await ensureDir(dirPath);

			expect(existsSync(dirPath)).toBe(true);
		});

		test("does nothing if directory already exists", async () => {
			await mkdir(testDir, { recursive: true });
			expect(existsSync(testDir)).toBe(true);

			await ensureDir(testDir);

			expect(existsSync(testDir)).toBe(true);
		});

		test("creates parent directories recursively", async () => {
			const dirPath = join(testDir, "parent", "child", "grandchild");
			expect(existsSync(dirPath)).toBe(false);

			await ensureDir(dirPath);

			expect(existsSync(dirPath)).toBe(true);
			expect(existsSync(join(testDir, "parent"))).toBe(true);
			expect(existsSync(join(testDir, "parent", "child"))).toBe(true);
		});
	});

	describe("writeJSON", () => {
		test("writes object to JSON file", async () => {
			const filePath = join(testDir, "test.json");
			const data = { name: "test", value: 123 };

			await writeJSON(filePath, data);

			const content = await readFile(filePath, "utf-8");
			const parsed = JSON.parse(content);
			expect(parsed).toEqual(data);
		});

		test("formats JSON with 2-space indentation", async () => {
			const filePath = join(testDir, "formatted.json");
			const data = { nested: { value: "test" } };

			await writeJSON(filePath, data);

			const content = await readFile(filePath, "utf-8");
			expect(content).toContain("  ");
			expect(content).toContain("\n");
		});

		test("creates parent directories if needed", async () => {
			const filePath = join(testDir, "nested", "dir", "file.json");
			const data = { test: true };

			await writeJSON(filePath, data);

			expect(existsSync(filePath)).toBe(true);
			const parsed = JSON.parse(await readFile(filePath, "utf-8"));
			expect(parsed).toEqual(data);
		});
	});

	describe("readJSON", () => {
		test("reads JSON file and returns parsed object", async () => {
			const filePath = join(testDir, "data.json");
			const data = { key: "value", number: 42 };

			await mkdir(testDir, { recursive: true });
			await writeFile(filePath, JSON.stringify(data), "utf-8");

			const result = await readJSON(filePath);
			expect(result).toEqual(data);
		});

		test("reads JSON file with nested structure", async () => {
			const filePath = join(testDir, "nested.json");
			const data = {
				level1: {
					level2: {
						level3: "deep value",
					},
				},
			};

			await mkdir(testDir, { recursive: true });
			await writeFile(filePath, JSON.stringify(data), "utf-8");

			const result = await readJSON(filePath);
			expect(result).toEqual(data);
		});

		test("throws error for invalid JSON", async () => {
			const filePath = join(testDir, "invalid.json");

			await mkdir(testDir, { recursive: true });
			await writeFile(filePath, "not valid json", "utf-8");

			await expect(readJSON(filePath)).rejects.toThrow();
		});

		test("throws error for non-existent file", async () => {
			const filePath = join(testDir, "nonexistent.json");

			await expect(readJSON(filePath)).rejects.toThrow();
		});
	});
});
