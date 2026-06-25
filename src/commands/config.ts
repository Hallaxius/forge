import { spawnSync } from "node:child_process";
import type { Command } from "commander";
import { ConfigManager } from "../lib/config.js";
import { info } from "../lib/logger.js";
import { showBox } from "../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("config")
		.description("Manage configuration")
		.option("--show", "Show config")
		.option("--edit", "Edit config in editor")
		.action(async (options) => {
			try {
				const config = new ConfigManager();

				if (options.edit) {
					const editor = process.env.EDITOR || "vim";
					const configPath = config.getPath();
					spawnSync(editor, [configPath], { stdio: "inherit" });
					info("Config edited.");
					return;
				}

				const user = config.get("user");
				const github = config.get("github");
				const prefs = config.get("preferences");

				const content = [
					`User:`,
					`  Name:  ${user.name || "(not set)"}`,
					`  Email: ${user.email || "(not set)"}`,
					``,
					`GitHub:`,
					`  Token: ${github.token ? (github.token.includes(":") ? "*** (encrypted)" : "***") : "(not set)"}`,
					``,
					`Preferences:`,
					`  Auto Push:       ${prefs.autoPush}`,
					`  Commit Template: ${prefs.commitTemplate || "(default)"}`,
					`  Editor:          ${prefs.editor}`,
				].join("\n");

				showBox("Configuration", content);
			} catch (err) {
				info(`Config: ${err instanceof Error ? err.message : String(err)}`);
			}
		});
}
