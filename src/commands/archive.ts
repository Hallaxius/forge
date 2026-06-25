import type { Command } from "commander";
import * as git from "../lib/git.js";
import { error, success } from "../lib/logger.js";

export default function register(program: Command): void {
	program
		.command("archive")
		.description("Create an archive of the repository")
		.argument("<format>", "Archive format (tar, tar.gz, zip)")
		.option("--prefix <dir>", "Prepend prefix to archive paths")
		.option("--output <file>", "Output file path")
		.option("--tree-ish <ref>", "Tree or commit to archive")
		.action(
			async (
				format: string,
				options: { prefix?: string; output?: string; treeIsh?: string },
			) => {
				try {
					const opts: { prefix?: string; output?: string; treeIsh?: string } =
						{};
					if (options.prefix) opts.prefix = options.prefix;
					if (options.output) opts.output = options.output;
					if (options.treeIsh) opts.treeIsh = options.treeIsh;

					const _result = await git.archive(format, opts);
					const outputPath = options.output || `archive.${format}`;
					success(`Archive created: ${outputPath}`);
				} catch (err) {
					error(
						`Archive failed: ${err instanceof Error ? err.message : String(err)}`,
					);
				}
			},
		);
}
