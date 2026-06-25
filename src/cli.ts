import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(
	readFileSync(resolve(__dirname, "../package.json"), "utf-8"),
);

const program = new Command();

program
	.name("fg")
	.description("Modern Git CLI for professional workflows")
	.version(pkg.version);

import registerAlias from "./commands/alias.js";
import registerArchive from "./commands/archive.js";
import registerBisect from "./commands/bisect.js";
import registerBranch from "./commands/branch.js";
import registerCherryPick from "./commands/cherry-pick.js";
import registerClean from "./commands/clean.js";
import registerClone from "./commands/clone.js";
import registerCommit from "./commands/commit.js";
import registerConfig from "./commands/config.js";
import registerDiff from "./commands/diff.js";
import registerFetch from "./commands/fetch.js";
import registerHelp from "./commands/help.js";
import registerInit from "./commands/init.js";
import registerLog from "./commands/log.js";
import registerMerge from "./commands/merge.js";
import registerPush from "./commands/push.js";
import registerRemote from "./commands/remote.js";
import registerReset from "./commands/reset.js";
import registerSetup from "./commands/setup.js";
import registerStash from "./commands/stash.js";
import registerStatus from "./commands/status.js";
import registerSync from "./commands/sync.js";
import registerTag from "./commands/tag.js";
import registerUndo from "./commands/undo.js";
import registerVersion from "./commands/version.js";
import registerWorktree from "./commands/worktree.js";

registerSetup(program);
registerCommit(program);
registerPush(program);
registerStatus(program);
registerSync(program);
registerFetch(program);
registerBranch(program);
registerLog(program);
registerDiff(program);
registerStash(program);
registerTag(program);
registerAlias(program);
registerConfig(program);
registerUndo(program);
registerReset(program);
registerHelp(program);
registerVersion(program);
registerClone(program);
registerInit(program);
registerRemote(program);
registerWorktree(program);
registerMerge(program);
registerCherryPick(program);
registerClean(program);
registerArchive(program);
registerBisect(program);

if (process.argv.length <= 2) {
	program.outputHelp();
} else {
	program.parse(process.argv);
}
