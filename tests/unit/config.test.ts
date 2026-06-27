import { beforeEach, describe, expect, test } from "bun:test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ConfigManager } from "../../src/lib/config.js";

describe("ConfigManager", () => {
	let config: ConfigManager;
	let testDir: string;

	beforeEach(() => {
		testDir = join(tmpdir(), "forge-test");
		config = new ConfigManager({
			configName: "forge-test",
			cwd: testDir,
		});
		config.clear();
	});

	test("set and get values", () => {
		config.set("user.name", "Test User");
		expect(config.get("user.name")).toBe("Test User");
	});

	test("isConfigured returns false when no config", () => {
		expect(config.isConfigured()).toBe(false);
	});

	test("getPath returns path or undefined", () => {
		const path = config.getPath();
		expect(path === undefined || typeof path === "string").toBe(true);
	});

	test("getAll returns full config object", () => {
		config.set("user.name", "John");
		config.set("user.email", "john@test.com");

		const all = config.getAll();
		expect(all.user.name).toBe("John");
		expect(all.user.email).toBe("john@test.com");
	});

	test("clear returns defaults", () => {
		config.set("user.name", "Test");
		config.clear();
		expect(config.get("user.name")).toBeUndefined();
	});

	test("delete removes specific key", () => {
		config.set("user.name", "Test");
		config.set("user.email", "test@test.com");
		config.delete("user.name");
		expect(config.get("user.name")).toBeUndefined();
		expect(config.get("user.email")).toBe("test@test.com");
	});
});
