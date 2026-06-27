import { createInterface } from "node:readline";
import { ConfigManager } from "./config.js";

const ITERATIONS = 100000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 32;
const IV_LENGTH = 12;

let cachedToken: string | null = null;

function base64Encode(buf: Uint8Array): string {
	return btoa(String.fromCharCode(...buf));
}

function base64Decode(str: string): Uint8Array {
	return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

export function generateSalt(length: number = SALT_LENGTH): Uint8Array {
	return crypto.getRandomValues(new Uint8Array(length));
}

export function generateIV(): Uint8Array {
	return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

export function generateMachineKey(): string {
	return base64Encode(crypto.getRandomValues(new Uint8Array(32)));
}

async function deriveKey(
	password: string,
	salt: Uint8Array,
): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(password),
		"PBKDF2",
		false,
		["deriveKey"],
	);
	return crypto.subtle.deriveKey(
		{ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
		keyMaterial,
		{ name: "AES-GCM", length: KEY_LENGTH },
		false,
		["encrypt", "decrypt"],
	);
}

export async function encryptToken(
	token: string,
	key: string,
): Promise<string> {
	const salt = generateSalt();
	const iv = generateIV();
	const derivedKey = await deriveKey(key, salt);
	const encoder = new TextEncoder();
	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		derivedKey,
		encoder.encode(token),
	);
	const parts = [
		base64Encode(salt),
		base64Encode(iv),
		base64Encode(new Uint8Array(encrypted)),
	];
	return parts.join(":");
}

export async function decryptToken(
	encryptedData: string,
	key: string,
): Promise<string> {
	const parts = encryptedData.split(":");
	if (parts.length !== 3) {
		throw new Error("Invalid encrypted data format");
	}
	const [saltB64, ivB64, ciphertextB64] = parts;
	const salt = base64Decode(saltB64);
	const iv = base64Decode(ivB64);
	const ciphertext = base64Decode(ciphertextB64);
	const derivedKey = await deriveKey(key, salt);
	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		derivedKey,
		ciphertext,
	);
	const decoder = new TextDecoder();
	return decoder.decode(decrypted);
}

export function cacheToken(token: string): void {
	cachedToken = token;
}

export function getCachedToken(): string | null {
	return cachedToken;
}

export function clearTokenCache(): void {
	cachedToken = null;
}

function promptPassword(): Promise<string> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	return new Promise((resolve) => {
		rl.question("Master password: ", (answer: string) => {
			rl.close();
			resolve(answer);
		});
	});
}

export async function resolveToken(): Promise<string> {
	if (cachedToken) return cachedToken;

	const config = new ConfigManager();
	const encryptedToken = config.get("github.encryptedToken") as string;
	if (!encryptedToken) {
		throw new Error("No GitHub token configured. Run 'fg git setup -w' first.");
	}

	try {
		const hasMasterPassword = config.get("auth.hasMasterPassword") as boolean;

		let machineKey: string;
		if (hasMasterPassword) {
			const encryptedKey = config.get("auth.machineKey") as string;
			const password = await promptPassword();
			machineKey = await decryptToken(encryptedKey, password);
		} else {
			machineKey = config.get("auth.machineKey") as string;
		}

		const token = await decryptToken(encryptedToken, machineKey);
		cachedToken = token;
		return token;
	} catch (_err) {
		clearTokenCache();
		throw new Error(
			"GitHub token is invalid or expired. Run 'fg git setup -w' to authenticate again.",
		);
	}
}

export async function resolveTokenWithPassword(
	password?: string,
): Promise<string> {
	if (cachedToken) return cachedToken;

	const config = new ConfigManager();
	const encryptedToken = config.get("github.encryptedToken") as string;
	if (!encryptedToken) {
		throw new Error("No GitHub token configured. Run 'fg git setup -w' first.");
	}

	const hasMasterPassword = config.get("auth.hasMasterPassword") as boolean;

	let machineKey: string;
	if (hasMasterPassword) {
		const encryptedKey = config.get("auth.machineKey") as string;
		if (!password) {
			throw new Error("Master password required to decrypt token.");
		}
		machineKey = await decryptToken(encryptedKey, password);
	} else {
		machineKey = config.get("auth.machineKey") as string;
	}

	try {
		const token = await decryptToken(encryptedToken, machineKey);
		cachedToken = token;
		return token;
	} catch (_err) {
		clearTokenCache();
		throw new Error(
			"GitHub token is invalid or expired. Run 'fg git setup -w' to authenticate again.",
		);
	}
}
