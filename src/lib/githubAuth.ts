export interface DeviceCodeResponse {
	device_code: string;
	user_code: string;
	verification_uri: string;
	expires_in: number;
	interval: number;
}

export interface AccessTokenResponse {
	access_token: string;
	token_type: string;
	scope: string;
}

const GITHUB_OAUTH_CONFIG = {
	client_id: process.env.GITHUB_CLIENT_ID || "Ov23lib0kLONoYtd9AA3",
	scope: "user:email repo read:org workflow",
	device_auth_url: "https://github.com/login/device/code",
	token_url: "https://github.com/login/oauth/access_token",
};

export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
	const response = await fetch(GITHUB_OAUTH_CONFIG.device_auth_url, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Accept: "application/json",
		},
		body: new URLSearchParams({
			client_id: GITHUB_OAUTH_CONFIG.client_id,
			scope: GITHUB_OAUTH_CONFIG.scope,
		}).toString(),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to request device code: ${response.status} ${response.statusText}`,
		);
	}

	return response.json();
}

export async function pollForAccessToken(
	deviceCode: string,
	interval: number,
	expirationTime: number,
): Promise<AccessTokenResponse> {
	const startTime = Date.now();
	const maxAttempts = Math.floor(expirationTime / interval) + 10;
	let attempts = 0;
	let lastError: string | null = null;

	while (
		Date.now() - startTime < expirationTime * 1000 &&
		attempts < maxAttempts
	) {
		attempts++;

		if (attempts % 5 === 0) {
			process.stdout.write(
				`\rWaiting for authorization... (${attempts}/${maxAttempts})`,
			);
		}

		try {
			const response = await fetch(GITHUB_OAUTH_CONFIG.token_url, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Accept: "application/json",
				},
				body: new URLSearchParams({
					client_id: GITHUB_OAUTH_CONFIG.client_id,
					device_code: deviceCode,
					grant_type: "urn:ietf:params:oauth:grant-type:device_code",
				}).toString(),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				lastError = errorData.error || String(response.status);

				if (errorData.error === "authorization_pending") {
					await new Promise((resolve) => setTimeout(resolve, interval * 1000));
					continue;
				}

				if (errorData.error === "slow_down") {
					interval = Math.min(interval * 2, 30);
					await new Promise((resolve) => setTimeout(resolve, interval * 1000));
					continue;
				}

				if (errorData.error === "access_denied") {
					throw new Error("Authorization denied by user");
				}

				throw new Error(
					`Failed to get access token: ${errorData.error || String(response.status)}`,
				);
			}

			const tokenResponse = await response.json();

			if (!tokenResponse.access_token) {
				throw new Error("No access token received from GitHub");
			}

			process.stdout.write(`\r${" ".repeat(50)}\r`);

			return tokenResponse;
		} catch (err) {
			lastError = err instanceof Error ? err.message : String(err);

			if (err instanceof Error && err.name !== "AbortError") {
				await new Promise((resolve) => setTimeout(resolve, interval * 1000));
				continue;
			}
			throw err;
		}
	}

	process.stdout.write(`\r${" ".repeat(50)}\r`);

	throw new Error(
		lastError?.includes("denied")
			? "Authorization denied by user"
			: lastError?.includes("timeout")
				? "Authorization timeout: User did not authorize within the time limit"
				: `Authorization failed: ${lastError || "User did not authorize within the time limit"}`,
	);
}

export async function openBrowser(url: string): Promise<boolean> {
	try {
		const { platform } = process;
		const { execSync } = await import("node:child_process");

		switch (platform) {
			case "darwin":
				execSync(`open "${url}"`);
				return true;

			case "win32":
				execSync(`start "" "${url}"`);
				return true;

			case "linux":
				execSync(`xdg-open "${url}"`);
				return true;

			default:
				return false;
		}
	} catch {
		return false;
	}
}

export async function githubDeviceFlow(timeout?: number): Promise<string> {
	const deviceCodeResponse = await requestDeviceCode();

	const { device_code, user_code, verification_uri, expires_in, interval } =
		deviceCodeResponse;

	const effectiveTimeout = Math.min(timeout || expires_in || 600, 600);

	console.log("");
	console.log("GitHub Authentication");
	console.log("====================");
	console.log(`1. Open your browser and go to: ${verification_uri}`);
	console.log(`2. Enter this code: ${user_code}`);
	console.log("3. Authorize the application");
	console.log("");
	console.log(`This code expires in ${expires_in} seconds.`);
	console.log("");

	const { confirm } = await import("../lib/ui.js");
	const shouldOpenBrowser = await confirm(
		"Would you like to open the browser automatically?",
		true,
	);

	if (shouldOpenBrowser) {
		const opened = await openBrowser(verification_uri);
		if (!opened) {
			console.log(
				"Could not open browser automatically. Please open it manually.",
			);
		}
	}

	console.log("Waiting for authorization...");

	const tokenResponse = await pollForAccessToken(
		device_code,
		interval,
		effectiveTimeout,
	);

	console.log("Authorization successful!");

	return tokenResponse.access_token;
}
