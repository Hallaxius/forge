import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { ModeManager } from "./lib/modeManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf-8"),
);

// Importar todos os comandos existentes
import registerAccount from "./commands/account.js";
import registerAlias from "./commands/alias.js";
import registerBranch from "./commands/branch.js";
import registerCi from "./commands/ci.js";
import registerClone from "./commands/clone.js";
import registerCommit from "./commands/commit.js";
import registerConfig from "./commands/config.js";
import registerDiff from "./commands/diff.js";
import registerFetch from "./commands/fetch.js";
import registerHelp from "./commands/help.js";
import registerInit from "./commands/init.js";
import registerIssue from "./commands/issue.js";
import registerLog from "./commands/log.js";
import registerMerge from "./commands/merge.js";
import registerPr from "./commands/pr.js";
import registerPush from "./commands/push.js";
import registerRelease from "./commands/release.js";
import registerRemote from "./commands/remote.js";
import registerReset from "./commands/reset.js";
import registerSetup from "./commands/git/setup.js";
import registerStash from "./commands/stash.js";
import registerStatus from "./commands/status.js";
import registerSync from "./commands/sync.js";
import registerTag from "./commands/tag.js";
import registerUndo from "./commands/undo.js";
import registerVersion from "./commands/version.js";

// Importar comandos npm
import registerNpmSetup from "./commands/npm/setup.js";
import registerNpmLogout from "./commands/npm/logout.js";
import registerNpmWhoami from "./commands/npm/whoami.js";
import registerNpmPackage from "./commands/npm/package.js";
import registerNpmPublish from "./commands/npm/publish.js";
import registerNpmLs from "./commands/npm/ls.js";
import registerNpmOrg from "./commands/npm/org/index.js";
import registerNpmDeprecate from "./commands/npm/deprecate.js";
import registerNpmDistTag from "./commands/npm/dist-tag.js";

// Analisar argumentos
const args = process.argv.slice(2);

// Verificar se é um comando de modo (fg npm, fg git, fg base)
if (args.length >= 1 && (args[0] === "npm" || args[0] === "git" || args[0] === "base")) {
  const mode = args[0] as ModeManager.Mode;
  const commandArgs = args.slice(1);

  // Definir modo
  ModeManager.setMode(mode);

  // Criar programa para este modo
  const program = new Command();
  program.name(`fg ${mode === 'base' ? '' : mode}`).version(pkg.version);

  // Registrar comandos específicos do modo
  if (mode === 'git') {
    // Todos os comandos atuais são git commands
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
    registerSetup(program);
    registerStash(program);
    registerStatus(program);
    registerSync(program);
    registerTag(program);
    registerUndo(program);
} else if (mode === 'npm') {
  // Registrar comandos npm
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

  // Adicionar comandos de modo base
  program
    .command("mode <target>")
    .description("Switch to target mode (npm, git, base)")
    .action((target) => {
      if (ModeManager.isValidMode(target)) {
        ModeManager.setMode(target as ModeManager.Mode);
        console.log(`Switched to ${target} mode.`);
      } else {
        console.error(`Invalid mode: ${target}`);
      }
    });

  program
    .command("exit")
    .description("Exit current mode or terminate if in base")
    .action(() => {
      if (mode === 'base') {
        console.log("Exiting Forge CLI.");
        process.exit(0);
      } else {
        ModeManager.setMode('base');
        console.log(`Returned to base mode.`);
      }
    });

  program
    .command("help")
    .description("Show help for current mode")
    .action(() => {
      console.log(`Forge CLI - ${mode === 'base' ? 'Base' : mode.toUpperCase()} Mode`);
      if (mode === 'git') {
        console.log("Available git commands: account, alias, branch, ci, clone, commit, config, diff, fetch, init, issue, log, merge, pr, push, release, remote, reset, setup, stash, status, sync, tag, undo");
      } else if (mode === 'npm') {
        console.log("Available npm commands: setup, whoami, package, publish, ls, org, deprecate, dist-tag");
      }
      console.log("Base commands: mode, help, version, exit");
    });

  program
    .command("version")
    .description("Show version")
    .action(() => {
      console.log(`Forge v${pkg.version}`);
    });

  // If no commands, show mode help
  if (commandArgs.length === 0) {
    console.log(`\nForge CLI - ${mode === 'base' ? 'Base' : mode.toUpperCase()} Mode`);
    console.log(`Type commands without prefix. Use 'mode <target>' to switch, 'exit' to quit.`);
    console.log(`Prompt: ${ModeManager.getPrompt()}`);
    process.exit(0);
  }

  // Process remaining arguments (without mode name)
  program.parse(commandArgs, { from: 'user' });
} else {
  // Base mode or no arguments
  ModeManager.setMode('base');

  const program = new Command();
  program.name("fg").version(pkg.version);

  // Registrar todos os comandos atuais (para compatibilidade retroativa)
  registerAccount(program);
  registerAlias(program);
  registerBranch(program);
  registerCi(program);
  registerClone(program);
  registerCommit(program);
  registerConfig(program);
  registerDiff(program);
  registerFetch(program);
  registerHelp(program);
  registerInit(program);
  registerIssue(program);
  registerLog(program);
  registerMerge(program);
  registerPr(program);
  registerPush(program);
  registerRelease(program);
  registerRemote(program);
  registerReset(program);
  registerSetup(program);
  registerStash(program);
  registerStatus(program);
  registerSync(program);
  registerTag(program);
  registerUndo(program);
  registerVersion(program);

  // Adicionar comandos de modo
  program
    .command("mode <target>")
    .description("Switch to target mode (npm, git, base)")
    .action((target) => {
      if (ModeManager.isValidMode(target)) {
        ModeManager.setMode(target as ModeManager.Mode);
        console.log(`Switched to ${target} mode.`);
      } else {
        console.error(`Invalid mode: ${target}`);
      }
    });

  program
    .command("exit")
    .description("Exit current mode or terminate")
    .action(() => {
      console.log("Exiting Forge CLI.");
      process.exit(0);
    });

  if (args.length === 0) {
  // Show help when no arguments
  console.log("Forge CLI - Modal Interface");
    console.log("Available modes:");
    console.log("  fg npm  - Enter npm mode for package management");
    console.log("  fg git  - Enter git mode for version control");
    console.log("");
    console.log("Base commands:");
    console.log("  fg mode     - Switch to target mode");
    console.log("  fg help     - Show help");
    console.log("  fg version  - Show version");
    console.log("  fg exit     - Exit");
    console.log("");
    console.log("One-shot commands:");
    console.log("  fg npm whoami   - Execute whoami in npm mode");
    console.log("  fg git status   - Execute status in git mode");
  }

  program.parse(args, { from: 'user' });
}