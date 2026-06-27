import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createInterface, type Interface } from "node:readline";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { Command } from "commander";
import { ModeManager } from "./lib/modeManager.js";
import { cleanup, setReplInputHandler } from "./lib/ui.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(
	readFileSync(resolve(__dirname, "../package.json"), "utf-8"),
);

import registerExit from "./commands/base/exit.js";
import registerHelp from "./commands/base/help.js";
import registerMode from "./commands/base/mode.js";
import registerVersion from "./commands/base/version.js";
import registerAccount from "./commands/git/account.js";
import registerAlias from "./commands/git/alias.js";
import registerBranch from "./commands/git/branch.js";
import registerCi from "./commands/git/ci.js";
import registerClone from "./commands/git/clone.js";
import registerCommit from "./commands/git/commit.js";
import registerConfig from "./commands/git/config.js";
import registerDiff from "./commands/git/diff.js";
import registerFetch from "./commands/git/fetch.js";
import registerInit from "./commands/git/init.js";
import registerIssue from "./commands/git/issue.js";
import registerLog from "./commands/git/log.js";
import registerGitLogout from "./commands/git/logout.js";
import registerMerge from "./commands/git/merge.js";
import registerPr from "./commands/git/pr.js";
import registerPush from "./commands/git/push.js";
import registerRelease from "./commands/git/release.js";
import registerRemote from "./commands/git/remote.js";
import registerReset from "./commands/git/reset.js";
import registerGitSetup from "./commands/git/setup.js";
import registerStash from "./commands/git/stash.js";
import registerStatus from "./commands/git/status.js";
import registerSync from "./commands/git/sync.js";
import registerTag from "./commands/git/tag.js";
import registerUndo from "./commands/git/undo.js";
import registerNpmDeprecate from "./commands/npm/deprecate.js";
import registerNpmDistTag from "./commands/npm/dist-tag.js";
import registerNpmLogout from "./commands/npm/logout.js";
import registerNpmLs from "./commands/npm/ls.js";
import registerNpmOrg from "./commands/npm/org/index.js";
import registerNpmPackage from "./commands/npm/package.js";
import registerNpmPublish from "./commands/npm/publish.js";
import registerNpmSetup from "./commands/npm/setup.js";
import registerNpmWhoami from "./commands/npm/whoami.js";

const args = process.argv.slice(2);

function createProgramForMode(mode: ModeManager.Mode): Command {
	const program = new Command();
	program.name(`fg ${mode === "base" ? "" : mode}`).version(pkg.version);

	registerMode(program);
	registerHelp(program);
	registerVersion(program);
	registerExit(program);

	if (mode === "git") {
		registerAccount(program);
		registerAlias(program);
		registerBranch(program);
		registerCi(program);
		registerClone(program);
		registerCommit(program);
		registerConfig(program);
		registerDiff(program);
		registerFetch(program);
		registerInit(program);
		registerIssue(program);
		registerLog(program);
		registerMerge(program);
		registerPr(program);
		registerPush(program);
		registerRelease(program);
		registerRemote(program);
		registerReset(program);
		registerGitSetup(program);
		registerGitLogout(program);
		registerStash(program);
		registerStatus(program);
		registerSync(program);
		registerTag(program);
		registerUndo(program);
	} else if (mode === "npm") {
		registerNpmSetup(program);
		registerNpmLogout(program);
		registerNpmWhoami(program);
		registerNpmPackage(program);
		registerNpmPublish(program);
		registerNpmLs(program);
		registerNpmOrg(program);
		registerNpmDeprecate(program);
		registerNpmDistTag(program);
	}

	return program;
}

let replRl: Interface | null = null;
let isReplActive = false;

function _startReplMode(mode: "npm" | "git") {
	cleanup();

	replRl = createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true,
	});

	console.log(
		chalk.green(`\nEntering ${mode.toUpperCase()} mode. Type "exit" to leave.`),
	);

	const program = createProgramForMode(mode);
	isReplActive = true;

	setReplInputHandler((input: string) => {
		if (!isReplActive) return;

		const trimmed = input.trim();
		if (trimmed === "exit" || trimmed === "quit") {
			console.log(chalk.green("\nExiting to base mode..."));
			if (replRl) {
				replRl.close();
				replRl = null;
			}
			isReplActive = false;
			ModeManager.reset();
			process.exit(0);
			return;
		}

		if (!trimmed) {
			return;
		}

		try {
			program.parse(trimmed.split(" "), { from: "user" });
		} catch (err) {
			console.error(
				chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`),
			);
		}
	});

	const ask = () => {
		if (!isReplActive || !replRl) return;

		replRl.question(`${mode}> `, async (input) => {
			const trimmed = input.trim();

			if (trimmed === "exit" || trimmed === "quit") {
				console.log(chalk.green("\nExiting to base mode..."));
				replRl.close();
				replRl = null;
				isReplActive = false;
				ModeManager.reset();
				process.exit(0);
				return;
			}

			if (!trimmed) {
				ask();
				return;
			}

			try {
				program.parse(trimmed.split(" "), { from: "user" });
			} catch (err) {
				console.error(
					chalk.red(
						`Error: ${err instanceof Error ? err.message : String(err)}`,
					),
				);
			}

			ask();
		});
	};

	globalThis.pauseRepl = () => {
		isReplActive = false;
		if (replRl) {
			replRl.pause();
		}
	};

	globalThis.resumeRepl = () => {
		isReplActive = true;
		if (replRl) {
			replRl.resume();
		}
	};

	ask();
}

function startReplBaseMode(program: Command) {
	cleanup();

	replRl = createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true,
	});

	isReplActive = true;

	setReplInputHandler((input: string) => {
		if (!isReplActive) return;

		const trimmed = input.trim();
		if (trimmed === "exit" || trimmed === "quit") {
			console.log(chalk.green("\nExiting Forge CLI..."));
			if (replRl) {
				replRl.close();
				replRl = null;
			}
			isReplActive = false;
			ModeManager.reset();
			process.exit(0);
			return;
		}

		if (!trimmed) {
			return;
		}

		try {
			program.parse(trimmed.split(" "), { from: "user" });
		} catch (err) {
			console.error(
				chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`),
			);
		}
	});

	const ask = () => {
		if (!isReplActive || !replRl) return;

		replRl.question(`${chalk.gray("base")}> `, async (input) => {
			const trimmed = input.trim();

			if (trimmed === "exit" || trimmed === "quit") {
				console.log(chalk.green("\nExiting Forge CLI..."));
				replRl.close();
				replRl = null;
				isReplActive = false;
				ModeManager.reset();
				process.exit(0);
				return;
			}

			if (!trimmed) {
				ask();
				return;
			}

			try {
				program.parse(trimmed.split(" "), { from: "user" });
			} catch (err) {
				console.error(
					chalk.red(
						`Error: ${err instanceof Error ? err.message : String(err)}`,
					),
				);
			}

			ask();
		});
	};

	globalThis.pauseRepl = () => {
		isReplActive = false;
		if (replRl) {
			replRl.pause();
		}
	};

	globalThis.resumeRepl = () => {
		isReplActive = true;
		if (replRl) {
			replRl.resume();
		}
	};

	ask();
}

if (args.length >= 2 && (args[0] === "npm" || args[0] === "git")) {
	const service = args[0] as ModeManager.Mode;
	const commandArgs = args.slice(1);

	ModeManager.setMode(service);

	const program = createProgramForMode(service);

	program.parse(commandArgs, { from: "user" });
	process.exit(0);
} else if (
	args.length === 1 &&
	(args[0] === "npm" || args[0] === "git" || args[0] === "base")
) {
	const targetMode = args[0] as ModeManager.Mode;
	ModeManager.setMode(targetMode);

	if (targetMode === "base") {
		const program = createProgramForMode(targetMode);

		console.log(chalk.bold.cyan("\n🔥 Forge CLI - Base Mode\n"));
		console.log(
			chalk.gray('Type "help" for available commands, "exit" to quit.'),
		);

		startReplBaseMode(program);
	} else {
		console.log(`\nForge CLI - ${targetMode.toUpperCase()} Mode`);
		console.log(
			`Type commands without prefix. Use 'mode <target>' to switch, 'exit' to quit.`,
		);
		console.log(`Prompt: ${ModeManager.getPrompt()}`);

		_startReplMode(targetMode);
	}
} else {
	ModeManager.setMode("base");

	const program = createProgramForMode("base");

	if (args.length === 0) {
		console.log(chalk.bold.cyan("\n🔥 Forge CLI - Modal Interface\n"));
		console.log(chalk.gray("Available modes:"));
		console.log(
			`  ${chalk.green("fg npm")}  - Enter npm mode for package management`,
		);
		console.log(
			`  ${chalk.blue("fg git")}  - Enter git mode for version control`,
		);
		console.log();
		console.log(chalk.gray("Base commands:"));
		console.log(`  ${chalk.yellow("fg mode")}     - Switch to target mode`);
		console.log(`  ${chalk.yellow("fg help")}     - Show help`);
		console.log(`  ${chalk.yellow("fg version")}  - Show version`);
		console.log(`  ${chalk.yellow("fg exit")}     - Exit`);
		console.log();
		console.log(chalk.gray("One-shot commands:"));
		console.log(
			`  ${chalk.magenta("fg npm whoami")}   - Execute whoami in npm mode`,
		);
		console.log(
			`  ${chalk.magenta("fg git status")}   - Execute status in git mode`,
		);
	}

	program.parse(args, { from: "user" });
}
