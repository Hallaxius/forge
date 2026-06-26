import fs from "node:fs";
import { Octokit } from "@octokit/rest";
import { currentBranch, getConfig } from "isomorphic-git";
import { resolveToken } from "./auth.js";

function parseRemoteUrl(remoteUrl: string): { owner: string; repo: string } {
	const match = remoteUrl.match(
		/github\.com[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?$/,
	);
	if (!match)
		throw new Error(
			`Could not determine GitHub repo from remote URL: ${remoteUrl}`,
		);
	return { owner: match[1], repo: match[2] };
}

async function createClient(): Promise<Octokit> {
	const token = await resolveToken();
	return new Octokit({ auth: token });
}

export async function getRepoInfo(): Promise<{ owner: string; repo: string }> {
	const dir = process.cwd();
	const remoteUrl = await getConfig({ fs, dir, path: "remote.origin.url" });
	if (!remoteUrl)
		throw new Error(
			"No remote 'origin' configured. Set up a GitHub remote first.",
		);
	return parseRemoteUrl(remoteUrl);
}

export async function createPR(
	title: string,
	body: string,
	head: string,
	base: string = "main",
): Promise<{ number: number; url: string }> {
	const octokit = await createClient();
	const { owner, repo } = await getRepoInfo();
	const { data } = await octokit.pulls.create({
		owner,
		repo,
		title,
		body,
		head,
		base,
	});
	return { number: data.number, url: data.html_url };
}

export async function listPRs(
	state: "open" | "closed" | "all" = "open",
): Promise<
	{
		number: number;
		title: string;
		state: string;
		url: string;
		author: string;
	}[]
> {
	const octokit = await createClient();
	const { owner, repo } = await getRepoInfo();
	const { data } = await octokit.pulls.list({
		owner,
		repo,
		state,
		per_page: 20,
	});
	return data.map((pr) => ({
		number: pr.number,
		title: pr.title,
		state: pr.state,
		url: pr.html_url,
		author: pr.user?.login || "",
	}));
}

export async function createIssue(
	title: string,
	body: string,
	labels: string[] = [],
): Promise<{ number: number; url: string }> {
	const octokit = await createClient();
	const { owner, repo } = await getRepoInfo();
	const { data } = await octokit.issues.create({
		owner,
		repo,
		title,
		body,
		labels,
	});
	return { number: data.number, url: data.html_url };
}

export async function listIssues(
	state: "open" | "closed" | "all" = "open",
): Promise<
	{
		number: number;
		title: string;
		state: string;
		url: string;
		author: string;
	}[]
> {
	const octokit = await createClient();
	const { owner, repo } = await getRepoInfo();
	const { data } = await octokit.issues.list({
		owner,
		repo,
		state,
		per_page: 20,
	});
	return data.map((issue) => ({
		number: issue.number,
		title: issue.title,
		state: issue.state,
		url: issue.html_url,
		author: issue.user?.login || "",
	}));
}

export async function createRelease(
	tag: string,
	name: string,
	body: string,
): Promise<{ url: string }> {
	const octokit = await createClient();
	const { owner, repo } = await getRepoInfo();
	const { data } = await octokit.repos.createRelease({
		owner,
		repo,
		tag_name: tag,
		name,
		body,
	});
	return { url: data.html_url };
}

export interface AccountInfo {
	login: string;
	name: string | null;
	email: string | null;
	avatarUrl: string;
	profileUrl: string;
	publicRepos: number;
	publicGists: number;
	followers: number;
	following: number;
	createdAt: string;
	plan: string | null;
	bio: string | null;
	company: string | null;
	location: string | null;
	twitter: string | null;
	blog: string | null;
}

export async function getAccountInfo(): Promise<AccountInfo> {
	const octokit = await createClient();
	const { data } = await octokit.users.getAuthenticated();
	return {
		login: data.login,
		name: data.name ?? null,
		email: data.email ?? null,
		avatarUrl: data.avatar_url,
		profileUrl: data.html_url,
		publicRepos: data.public_repos,
		publicGists: data.public_gists,
		followers: data.followers,
		following: data.following,
		createdAt: data.created_at,
		plan: data.plan?.name ?? null,
		bio: data.bio ?? null,
		company: data.company ?? null,
		location: data.location ?? null,
		twitter: data.twitter_username ?? null,
		blog: data.blog ?? null,
	};
}

export async function getCIStatus(): Promise<
	{ branch: string; name: string; conclusion: string; url: string }[]
> {
	const octokit = await createClient();
	const { owner, repo } = await getRepoInfo();
	const dir = process.cwd();
	const branch = (await currentBranch({ fs, dir })) || "HEAD";
	const { data } = await octokit.checks.listForRef({
		owner,
		repo,
		ref: branch,
		per_page: 10,
	});
	return data.check_runs.map((run) => ({
		branch,
		name: run.name,
		conclusion: run.conclusion || "pending",
		url: run.html_url,
	}));
}
