import { readFileSync } from "node:fs";
import { join } from "node:path";
import { diffLines } from "diff";
import git, {
	currentBranch,
	log as gitLog,
	listBranches,
	listRemotes,
	listTags,
	statusMatrix,
} from "isomorphic-git";
import http from "isomorphic-git/http/node";
import { resolveToken } from "./auth.js";

const dir = process.cwd();

interface StatusResult {
	current: string;
	tracking: string;
	ahead: number;
	behind: number;
	files: { path: string; working_dir: string; index: string }[];
	recentCommits: { hash: string; date: string; message: string }[];
}

interface LogEntry {
	hash: string;
	date: string;
	message: string;
	author: string;
}

interface BranchesResult {
	current: string;
	branches: string[];
	all: string[];
}

interface StashEntry {
	index: number;
	description: string;
}

function statusChar(head: number, workdir: number): string {
	if (workdir === 0) return "D";
	if (head === 0 && workdir === 2) return "?";
	if (workdir === 2) return "M";
	return " ";
}

function indexChar(head: number, stage: number): string {
	if (head === 0 && stage === 2) return "A";
	if (stage === 0 && head === 1) return "D";
	if (stage === 2 && head === 1) return "M";
	return " ";
}

export async function getStatus(): Promise<StatusResult> {
	const matrix = await statusMatrix({ fs, dir });

	const current = (await currentBranch({ fs, dir, fullname: false })) || "";
	const logResult = await gitLog({ fs, dir, depth: 5 });

	const files = matrix
		.filter(
			([_f, head, workdir, stage]) =>
				head !== 1 || workdir !== 1 || stage !== 1,
		)
		.map(([filepath, head, workdir, stage]) => ({
			path: filepath,
			working_dir: statusChar(head as number, workdir as number),
			index: indexChar(head as number, stage as number),
		}));

	return {
		current,
		tracking: "",
		ahead: 0,
		behind: 0,
		files,
		recentCommits: logResult.map((c) => ({
			hash: c.oid,
			date: String(c.commit.author.timestamp),
			message: c.commit.message,
		})),
	};
}

export async function commit(message: string): Promise<string> {
	const name =
		(await git.getConfig({ fs, dir, path: "user.name" })) || "Unknown";
	const email =
		(await git.getConfig({ fs, dir, path: "user.email" })) ||
		"unknown@localhost";

	const result = await git.commit({
		fs,
		dir,
		message,
		author: { name, email },
	});
	return result;
}

export async function amendCommit(): Promise<void> {
	const commits = await gitLog({ fs, dir, depth: 1 });
	if (commits.length === 0) throw new Error("No commits to amend");
	const { commit: c } = commits[0];

	const name =
		(await git.getConfig({ fs, dir, path: "user.name" })) || "Unknown";
	const email =
		(await git.getConfig({ fs, dir, path: "user.email" })) ||
		"unknown@localhost";

	await git.commit({
		fs,
		dir,
		message: c.message,
		author: c.author,
		committer: { name, email },
		tree: c.tree,
		parent: c.parent.map((p) => p.toString()),
	});
}

export async function add(filepaths: string | string[]): Promise<void> {
	const files = Array.isArray(filepaths) ? filepaths : [filepaths];
	for (const filepath of files) {
		await git.add({ fs, dir, filepath });
	}
}

export async function push(force: boolean = false): Promise<string> {
	const token = await resolveToken();
	const result = await git.push({
		fs,
		http,
		dir,
		force,
		token,
		oauth2format: "github",
	});
	return result;
}

export async function pullRebase(): Promise<string> {
	const token = await resolveToken();
	await git.fetch({ fs, http, dir, token, oauth2format: "github" });
	const current = (await currentBranch({ fs, dir })) || "";
	const result = await git.merge({
		fs,
		dir,
		theirs: current,
		fastForwardOnly: true,
	});
	return result;
}

export async function log(maxCount: number = 10): Promise<LogEntry[]> {
	const result = await gitLog({ fs, dir, depth: maxCount, ref: "HEAD" });
	return result.map((c) => ({
		hash: c.oid,
		date: String(c.commit.author.timestamp),
		message: c.commit.message,
		author: c.commit.author.name,
	}));
}

export async function diff(): Promise<string> {
	const matrix = await statusMatrix({ fs, dir });
	const changed = matrix.filter(
		([_f, head, workdir, _stage]) => head !== 1 || workdir !== 1,
	);
	if (changed.length === 0) return "";

	const headOid = await git.resolveRef({ fs, dir, ref: "HEAD" });
	const output: string[] = [];

	for (const [filepath, head, workdir] of changed) {
		let oldContent = "";
		let newContent = "";

		if ((head as number) !== 0) {
			try {
				const blob = await git.readBlob({
					fs,
					dir,
					oid: headOid,
					filepath,
				});
				oldContent = new TextDecoder().decode(blob.blob);
			} catch {}
		}

		if ((workdir as number) !== 0) {
			try {
				newContent = readFileSync(join(dir, filepath), "utf-8");
			} catch {}
		}

		output.push(`diff --git a/${filepath} b/${filepath}`);
		const patch = diffLines(oldContent, newContent);
		for (const part of patch) {
			if (part.added) {
				for (const line of part.value.split("\n").filter(Boolean)) {
					output.push(`+${line}`);
				}
			} else if (part.removed) {
				for (const line of part.value.split("\n").filter(Boolean)) {
					output.push(`-${line}`);
				}
			} else {
				for (const line of part.value.split("\n").filter(Boolean)) {
					output.push(` ${line}`);
				}
			}
		}
	}

	return output.join("\n");
}

export async function diffStaged(): Promise<string> {
	const matrix = await statusMatrix({ fs, dir });
	const changed = matrix.filter(
		([_f, head, _workdir, stage]) => head !== 1 || (stage as number) !== 1,
	);
	if (changed.length === 0) return "";

	const headOid = await git.resolveRef({ fs, dir, ref: "HEAD" });
	const output: string[] = [];

	for (const [filepath, head, _workdir, stage] of changed) {
		let oldContent = "";
		let newContent = "";

		if ((head as number) !== 0) {
			try {
				const blob = await git.readBlob({
					fs,
					dir,
					oid: headOid,
					filepath,
				});
				oldContent = new TextDecoder().decode(blob.blob);
			} catch {}
		}

		if ((stage as number) !== 0) {
			try {
				const blob = await git.readBlob({
					fs,
					dir,
					oid: headOid,
					filepath,
				});
				newContent = new TextDecoder().decode(blob.blob);
			} catch {}
		}

		output.push(`diff --git a/${filepath} b/${filepath} (staged)`);
		const patch = diffLines(oldContent, newContent);
		for (const part of patch) {
			if (part.added) {
				for (const line of part.value.split("\n").filter(Boolean)) {
					output.push(`+${line}`);
				}
			} else if (part.removed) {
				for (const line of part.value.split("\n").filter(Boolean)) {
					output.push(`-${line}`);
				}
			} else {
				for (const line of part.value.split("\n").filter(Boolean)) {
					output.push(` ${line}`);
				}
			}
		}
	}

	return output.join("\n");
}

export async function getBranches(): Promise<BranchesResult> {
	const all = await listBranches({ fs, dir });
	const current = (await currentBranch({ fs, dir, fullname: false })) || "";
	return {
		current,
		branches: all.filter((b) => b !== current),
		all,
	};
}

export async function createBranch(name: string): Promise<void> {
	await git.branch({ fs, dir, ref: name });
}

export async function deleteBranch(
	name: string,
	force: boolean = false,
): Promise<void> {
	if (force) {
		await git.deleteBranch({ fs, dir, ref: name });
	} else {
		await git.deleteBranch({ fs, dir, ref: name });
	}
}

export async function switchBranch(name: string): Promise<void> {
	await git.checkout({ fs, dir, ref: name });
}

export async function stash(): Promise<string> {
	await git.stash({ fs, dir });
	return "Stash saved";
}

export async function stashPop(): Promise<string> {
	const stashes = await stashList();
	if (stashes.length === 0) throw new Error("No stashes to pop");

	try {
		await git.stash({ fs, dir });
	} catch {
		throw new Error("Failed to apply stash");
	}

	const refs = await git.listRefs({ fs, dir, prefix: "refs/stash" });
	if (refs.length > 0) {
		await git.deleteRef({ fs, dir, ref: refs[0] });
	}

	return "Stash popped";
}

export async function stashList(): Promise<StashEntry[]> {
	try {
		const stashLog = await gitLog({ fs, dir, ref: "refs/stash" });
		return stashLog.map((c, i) => ({
			index: i + 1,
			description: c.commit.message,
		}));
	} catch {
		return [];
	}
}

export async function tag(name: string, message?: string): Promise<string> {
	if (message) {
		await git.tag({ fs, dir, ref: name, message });
	} else {
		await git.tag({ fs, dir, ref: name });
	}
	return name;
}

export async function tagList(): Promise<string[]> {
	return listTags({ fs, dir });
}

export async function fetch(): Promise<string> {
	const token = await resolveToken();
	const result = await git.fetch({
		fs,
		http,
		dir,
		token,
		oauth2format: "github",
	});
	return result;
}

export async function undo(): Promise<string> {
	const commits = await gitLog({ fs, dir, depth: 1, ref: "HEAD" });
	if (commits.length === 0) throw new Error("No commits to undo");
	const c = commits[0];
	if (c.commit.parent.length === 0) throw new Error("Cannot undo root commit");

	const parentOid = c.commit.parent[0];
	await git.writeRef({
		fs,
		dir,
		ref: "HEAD",
		value: parentOid.toString(),
		force: true,
	});
	return `Undone to ${parentOid.toString().slice(0, 7)}`;
}

export async function getCurrentBranch(): Promise<string> {
	return (await currentBranch({ fs, dir })) || "";
}

export async function clone(
	url: string,
	targetDir?: string,
	options?: {
		depth?: number;
		branch?: string;
		recurseSubmodules?: boolean;
	},
): Promise<string> {
	const token = await resolveToken();
	const cloneDir =
		targetDir || url.split("/").pop()?.replace(".git", "") || "repo";

	await git.clone({
		fs,
		http,
		dir: cloneDir,
		url,
		singleBranch: !!options?.branch,
		ref: options?.branch,
		depth: options?.depth,
		token,
		oauth2format: "github",
	});

	return cloneDir;
}

export async function init(
	targetDir?: string,
	options?: { initialBranch?: string },
): Promise<void> {
	const initDir = targetDir || ".";
	await git.init({
		fs,
		dir: initDir,
		defaultBranch: options?.initialBranch,
	});
}

export async function remoteAdd(name: string, url: string): Promise<void> {
	await git.addRemote({ fs, dir, remote: name, url });
}

export async function remoteRemove(name: string): Promise<void> {
	await git.deleteRemote({ fs, dir, remote: name });
}

export async function remoteSetUrl(
	name: string,
	newUrl: string,
): Promise<void> {
	await git.setConfig({
		fs,
		dir,
		path: `remote.${name}.url`,
		value: newUrl,
	});
}

export async function remoteRename(
	oldName: string,
	newName: string,
): Promise<void> {
	const url = await git.getConfig({
		fs,
		dir,
		path: `remote.${oldName}.url`,
	});
	if (!url) throw new Error(`Remote '${oldName}' not found`);

	await remoteAdd(newName, url);
	await remoteRemove(oldName);
}

export async function remoteGetUrl(name: string): Promise<string> {
	const url = await git.getConfig({
		fs,
		dir,
		path: `remote.${name}.url`,
	});
	if (!url) throw new Error(`Remote '${name}' not found`);
	return url;
}

export async function remoteList(): Promise<{ name: string; url: string }[]> {
	const remotes = await listRemotes({ fs, dir });
	return remotes.map((r) => ({ name: r.remote, url: r.url }));
}

export async function merge(
	branch: string,
	options?: {
		noFF?: boolean;
		squash?: boolean;
		noCommit?: boolean;
	},
): Promise<string> {
	const name =
		(await git.getConfig({ fs, dir, path: "user.name" })) || "Unknown";
	const email =
		(await git.getConfig({ fs, dir, path: "user.email" })) ||
		"unknown@localhost";

	const result = await git.merge({
		fs,
		dir,
		theirs: branch,
		ours: undefined,
		noCommit: options?.noCommit,
		squash: options?.squash,
		fastForward: !options?.noFF,
		author: { name, email },
		committer: { name, email },
	});
	return result;
}

export default {
	getStatus,
	commit,
	amendCommit,
	add,
	push,
	pullRebase,
	log,
	diff,
	diffStaged,
	getBranches,
	createBranch,
	deleteBranch,
	switchBranch,
	stash,
	stashPop,
	stashList,
	tag,
	tagList,
	fetch,
	undo,
	getCurrentBranch,
	clone,
	init,
	remoteAdd,
	remoteRemove,
	remoteSetUrl,
	remoteRename,
	remoteGetUrl,
	remoteList,
	merge,
};
