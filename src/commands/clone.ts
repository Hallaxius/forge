import type { Command } from "commander";
import { ConfigManager } from "../lib/config.js";
import * as git from "../lib/git.js";
import { error, highlight, info } from "../lib/logger.js";
import { createTable, showBox, withSpinner } from "../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("clone")
		.description("Clone a repository")
		.argument("[url]", "Repository URL or org/repo shorthand")
		.argument("[dir]", "Target directory")
		.option("--ssh", "Use SSH URL")
		.option(
			"--depth <n>",
			"Create a shallow clone with history truncated to n commits",
		)
		.option("--branch <name>", "Clone a specific branch")
		.option(
			"--recurse-submodules",
			"Initialize and clone submodules recursively",
		)
		.option("--cd", "Print cd command for eval")
		.option("--list", "List recent clones")
		.action(async (url, dir, options) => {
			try {
				if (options.list) {
					const config = new ConfigManager();
					const clones = config.getClones();

					if (clones.length === 0) {
						info("No recent clones found.");
						return;
					}

					const rows = clones.map((c) => {
						const [u, d] = c.split("|");
						return [u || "", d || ""];
					});

					info("Recent clones:");
					console.log(createTable(["URL", "Directory"], rows));
					return;
				}

				if (!url) {
					error("Repository URL or org/repo shorthand is required.");
					return;
				}

				let resolvedUrl = url;

				if (url.includes("/") && !url.includes(".") && !url.includes("://")) {
					resolvedUrl = `https://github.com/${url}.git`;
				}

				if (options.ssh) {
					const match = resolvedUrl.match(/https:\/\/github\.com\/(.+)\.git$/);
					if (match) {
						resolvedUrl = `git@github.com:${match[1]}.git`;
					} else if (resolvedUrl.startsWith("https://")) {
						const rest = resolvedUrl.replace("https://", "");
						const slashIndex = rest.indexOf("/");
						if (slashIndex !== -1) {
							const host = rest.substring(0, slashIndex);
							const path = rest.substring(slashIndex + 1).replace(/\.git$/, "");
							resolvedUrl = `git@${host}:${path}.git`;
						}
					}
				}

				const cloneDir = await withSpinner("Cloning repository...", () =>
					git.clone(resolvedUrl, dir, {
						depth: options.depth ? Number(options.depth) : undefined,
						branch: options.branch,
						recurseSubmodules: options.recurseSubmodules,
					}),
				);

				const content = [
					`URL:       ${resolvedUrl}`,
					`Directory: ${cloneDir}`,
					`Branch:    ${options.branch || "default"}`,
				].join("\n");

				showBox("Clone Complete", content);

				if (options.cd) {
					highlight(`cd ${cloneDir}`);
				}

				const config = new ConfigManager();
				config.addClone(`${resolvedUrl}|${cloneDir}`);
			} catch (err) {
				error(
					`Clone failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
