import { mock, spyOn } from "bun:test";
import type { Command } from "commander";

export interface MockStatusResult {
	current: string;
	tracking: string;
	ahead: number;
	behind: number;
	files: { path: string; working_dir: string; index: string }[];
	recentCommits: { hash: string; date: string; message: string }[];
}

export interface MockLogEntry {
	hash: string;
	date: string;
	message: string;
	author: string;
}

export interface MockBranchesResult {
	current: string;
	branches: string[];
	all: string[];
}

export interface MockStashEntry {
	index: number;
	description: string;
}

export interface MockRemoteEntry {
	name: string;
	url: string;
}

export interface MockWorktreeEntry {
	path: string;
	branch: string;
	hash: string;
}

export function createMockStatusResult(
	overrides: Partial<MockStatusResult> = {},
): MockStatusResult {
	return {
		current: "main",
		tracking: "origin/main",
		ahead: 0,
		behind: 0,
		files: [],
		recentCommits: [],
		...overrides,
	};
}

export function createMockLogEntry(
	overrides: Partial<MockLogEntry> = {},
): MockLogEntry {
	return {
		hash: "abc123def456",
		date: "2024-01-15T10:30:00.000Z",
		message: "feat: add new feature",
		author: "Test User",
		...overrides,
	};
}

export function createMockBranchesResult(
	overrides: Partial<MockBranchesResult> = {},
): MockBranchesResult {
	return {
		current: "main",
		branches: ["develop", "feature-x"],
		all: ["main", "develop", "feature-x"],
		...overrides,
	};
}

export function createMockStashEntry(
	overrides: Partial<MockStashEntry> = {},
): MockStashEntry {
	return {
		index: 1,
		description: "WIP on main",
		...overrides,
	};
}

export function createMockRemoteEntry(
	overrides: Partial<MockRemoteEntry> = {},
): MockRemoteEntry {
	return {
		name: "origin",
		url: "https://github.com/user/repo.git",
		...overrides,
	};
}

export function createMockWorktreeEntry(
	overrides: Partial<MockWorktreeEntry> = {},
): MockWorktreeEntry {
	return {
		path: "/path/to/worktree",
		branch: "feature-x",
		hash: "abc123def",
		...overrides,
	};
}

export function mockGitModule(
	overrides: Partial<typeof import("../src/lib/git.js")> = {},
): void {
	mock.module("../src/lib/git.js", () => ({
		getStatus: mock(() =>
			Promise.resolve(createMockStatusResult(overrides.getStatusResult)),
		),
		commit: mock(() => Promise.resolve("abc123def456")),
		push: mock(() => Promise.resolve("ok")),
		pullRebase: mock(() => Promise.resolve("ok")),
		fetch: mock(() => Promise.resolve("fetch ok")),
		log: mock(() => Promise.resolve([createMockLogEntry()])),
		diff: mock(() => Promise.resolve("diff output")),
		diffStaged: mock(() => Promise.resolve("staged diff")),
		getBranches: mock(() =>
			Promise.resolve(createMockBranchesResult(overrides.branchesResult)),
		),
		createBranch: mock(() => Promise.resolve()),
		deleteBranch: mock(() => Promise.resolve()),
		switchBranch: mock(() => Promise.resolve()),
		stash: mock(() => Promise.resolve("stash saved")),
		stashPop: mock(() => Promise.resolve("stash popped")),
		stashList: mock(() => Promise.resolve([createMockStashEntry()])),
		tag: mock(() => Promise.resolve("v1.0.0")),
		tagList: mock(() => Promise.resolve(["v1.0.0", "v0.9.0"])),
		undo: mock(() => Promise.resolve("undone")),
		getCurrentBranch: mock(() => Promise.resolve("main")),
		clone: mock(() => Promise.resolve("/tmp/repo")),
		init: mock(() => Promise.resolve()),
		remoteAdd: mock(() => Promise.resolve()),
		remoteRemove: mock(() => Promise.resolve()),
		remoteSetUrl: mock(() => Promise.resolve()),
		remoteRename: mock(() => Promise.resolve()),
		remoteGetUrl: mock(() =>
			Promise.resolve("https://github.com/user/repo.git"),
		),
		remoteList: mock(() => Promise.resolve([createMockRemoteEntry()])),
		worktreeAdd: mock(() => Promise.resolve()),
		worktreeList: mock(() => Promise.resolve([createMockWorktreeEntry()])),
		worktreeRemove: mock(() => Promise.resolve()),
		worktreePrune: mock(() => Promise.resolve(["pruned 1 ref"])),
		merge: mock(() => Promise.resolve("merge ok")),
		cherryPick: mock(() => Promise.resolve()),
		cherryPickContinue: mock(() => Promise.resolve()),
		cherryPickAbort: mock(() => Promise.resolve()),
		clean: mock(() => Promise.resolve(["file1", "file2"])),
		archive: mock(() => Promise.resolve("archive ok")),
		bisectStart: mock(() => Promise.resolve()),
		bisectBad: mock(() => Promise.resolve()),
		bisectGood: mock(() => Promise.resolve()),
		bisectReset: mock(() => Promise.resolve()),
		bisectLog: mock(() => Promise.resolve("bisect log...")),
		bisectRun: mock(() => Promise.resolve()),
		...overrides,
	}));
}

export function mockUiModule(
	overrides: Partial<typeof import("../src/lib/ui.js")> = {},
): void {
	mock.module("../src/lib/ui.js", () => ({
		showBox: mock(() => {}),
		createTable: mock((headers: string[], rows: string[][]) => {
			const colWidths = headers.map((h, i) =>
				Math.max(h.length, ...rows.map((r) => (r[i] || "").length)),
			);
			const separator = `+${colWidths.map((w) => "-".repeat(w + 2)).join("+")}+`;
			const headerRow = `| ${headers.map((h, i) => h.padEnd(colWidths[i])).join(" | ")} |`;
			const dataRows = rows.map(
				(row) =>
					"| " +
					row.map((cell, i) => (cell || "").padEnd(colWidths[i])).join(" | ") +
					" |",
			);
			return [separator, headerRow, separator, ...dataRows, separator].join(
				"\n",
			);
		}),
		withSpinner: mock(async <T>(_text: string, fn: () => Promise<T>) => fn()),
		showHeader: mock(() => {}),
		showSeparator: mock(() => {}),
		confirm: mock(() => Promise.resolve(true)),
		select: mock(() => Promise.resolve("default")),
		input: mock(() => Promise.resolve("test input")),
		password: mock(() => Promise.resolve("test password")),
		checkbox: mock(() => Promise.resolve([])),
		...overrides,
	}));
}

export function mockLoggerModule(): void {
	mock.module("../src/lib/logger.js", () => ({
		success: mock((msg: string) => console.log(`[SUCCESS] ${msg}`)),
		error: mock((msg: string) => console.error(`[ERROR] ${msg}`)),
		warning: mock((msg: string) => console.warn(`[WARNING] ${msg}`)),
		info: mock((msg: string) => console.log(`[INFO] ${msg}`)),
		highlight: mock((msg: string) => console.log(`[HIGHLIGHT] ${msg}`)),
		text: mock((msg: string) => console.log(msg)),
		newline: mock(() => console.log()),
	}));
}

export function mockAuthModule(
	overrides: Partial<typeof import("../src/lib/auth.js")> = {},
): void {
	mock.module("../src/lib/auth.js", () => ({
		encryptToken: mock(async (_token: string, _password: string) =>
			Promise.resolve("encrypted:token"),
		),
		decryptToken: mock(async (_token: string, _password: string) =>
			Promise.resolve("decrypted_token"),
		),
		generateSalt: mock(() => new Uint8Array(32)),
		generateIV: mock(() => new Uint8Array(12)),
		...overrides,
	}));
}

export function mockValidatorsModule(
	overrides: Partial<typeof import("../src/lib/validators.js")> = {},
): void {
	mock.module("../src/lib/validators.js", () => ({
		validateEmail: mock((email: string) => email.includes("@")),
		validateGitHubToken: mock(
			(token: string) =>
				token.startsWith("ghp_") || token.startsWith("github_pat_"),
		),
		validateNotEmpty: mock((value: string) => Boolean(value)),
		validateGitInstalled: mock(() => Promise.resolve(true)),
		...overrides,
	}));
}

export function mockConfigModule(
	overrides: Partial<typeof import("../src/lib/config.js")> = {},
): void {
	mock.module("../src/lib/config.js", () => {
		class MockConfigManager {
			private store: Record<string, any> = {};

			get<T>(key: string): T {
				return this.store[key] as T;
			}

			set<T>(key: string, value: T): void {
				this.store[key] = value;
			}

			delete(key: string): void {
				delete this.store[key];
			}

			clear(): void {
				this.store = {};
			}

			getPath(): string {
				return "/mock/path/to/config.json";
			}

			getAll(): Record<string, any> {
				return this.store;
			}

			isConfigured(): boolean {
				return Object.keys(this.store).length > 0;
			}

			addClone(clone: string): void {
				if (!this.store.clones) this.store.clones = [];
				if (this.store.clones.length < 10) {
					this.store.clones.push(clone);
				}
			}

			getClones(): string[] {
				return this.store.clones || [];
			}
		}

		return {
			ConfigManager: MockConfigManager,
			...overrides,
		};
	});
}

export function mockConfModule(
	overrides: Partial<typeof import("conf")> = {},
): void {
	const mockStore: Record<string, string> = {};

	mock.module("conf", () => {
		class MockConf {
			get<T>(key: string): T | undefined {
				return mockStore[key] as T | undefined;
			}

			set<T>(key: string, value: T): void {
				mockStore[key] = value as unknown as string;
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
			...overrides,
		};
	});
}

export function createTestCommand(
	register: (program: Command) => void,
	args: string[] = [],
): Promise<void> {
	const program = new Command();
	register(program);
	return program.parseAsync(["node", "test", ...args]);
}

export type ConsoleSpies = {
	log: ReturnType<typeof spyOn>;
	error: ReturnType<typeof spyOn>;
	warn: ReturnType<typeof spyOn>;
	info: ReturnType<typeof spyOn>;
};

export function createConsoleSpies(): ConsoleSpies {
	return {
		log: spyOn(console, "log"),
		error: spyOn(console, "error"),
		warn: spyOn(console, "warn"),
		info: spyOn(console, "info"),
	};
}

export function restoreConsoleSpies(spies: ConsoleSpies): void {
	spies.log.mockRestore();
	spies.error.mockRestore();
	spies.warn.mockRestore();
	spies.info.mockRestore();
}
