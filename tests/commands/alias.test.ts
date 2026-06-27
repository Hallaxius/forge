import { beforeEach, describe, expect, mock, test } from "bun:test";
import { Command } from "commander";
import register from "../../src/commands/git/alias.js";

const mockStore: Record<string, string> = {};

describe("alias command", () => {
	beforeEach(() => {
		Object.keys(mockStore).forEach((key) => {
			delete mockStore[key];
		});

		mock.module("conf", () => {
			class MockConf {
				set<T>(key: string, value: T): void {
					mockStore[key] = value as unknown as string;
				}

				get<T>(key: string): T | undefined {
					return mockStore[key] as T | undefined;
				}

				delete(key: string): void {
					delete mockStore[key];
				}

				clear(): void {
					Object.keys(mockStore).forEach((key) => {
						delete mockStore[key];
					});
				}

				get store(): Record<string, string> {
					return mockStore;
				}
			}

			return {
				default: MockConf,
			};
		});

		mock.module("../../src/lib/ui.js", () => ({
			createTable: mock((headers: string[], rows: string[][]) => {
				const colWidths = headers.map((h, i) =>
					Math.max(h.length, ...rows.map((r) => (r[i] || "").length)),
				);
				const headerRow = headers
					.map((h, i) => h.padEnd(colWidths[i]))
					.join("  ");
				const dataRows = rows.map((row) =>
					row.map((cell, i) => (cell || "").padEnd(colWidths[i])).join("  "),
				);
				return [headerRow, ...dataRows].join("\n");
			}),
		}));

		mock.module("../../src/lib/logger.js", () => ({
			error: mock((_msg: string) => {}),
			warning: mock((_msg: string) => {}),
			text: mock((_msg: string) => {}),
			newline: mock(() => {}),
		}));
	});

	test("register function exists and is callable", async () => {
		const program = new Command();
		expect(() => register(program)).not.toThrow();
	});

	test("module exports register function", async () => {
		expect(typeof register).toBe("function");
	});
});
