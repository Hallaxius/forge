import { execSync } from "node:child_process";

export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function validateGitHubToken(token: string): boolean {
	const tokenRegex = /^(ghp_|gho_|ghu_|ghs_|ghr_|github_pat_)[a-zA-Z0-9]{4,}$/;
	return tokenRegex.test(token);
}

export function validateNotEmpty(input: string): boolean | string {
	if (input.length === 0) {
		return "Value cannot be empty";
	}
	return true;
}

export async function validateGitInstalled(): Promise<boolean> {
	try {
		execSync("git --version", { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
}
