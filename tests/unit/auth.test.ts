import { describe, expect, test } from "bun:test";
import {
	decryptToken,
	encryptToken,
	generateIV,
	generateSalt,
} from "../../src/lib/auth.js";

describe("Auth", () => {
	test("encrypt and decrypt token", async () => {
		const token = "ghp_test_token_12345";
		const password = "master_password_123";

		const encrypted = await encryptToken(token, password);
		expect(encrypted).toBeTruthy();
		expect(encrypted.includes(":")).toBe(true);

		const decrypted = await decryptToken(encrypted, password);
		expect(decrypted).toBe(token);
	});

	test("decrypt with wrong password fails", async () => {
		const token = "ghp_test_token";
		const encrypted = await encryptToken(token, "correct_password");

		try {
			await decryptToken(encrypted, "wrong_password");
			expect.unreachable("Should have thrown");
		} catch (e) {
			expect(e).toBeTruthy();
		}
	});

	test("generateSalt returns Uint8Array", () => {
		const salt = generateSalt();
		expect(salt instanceof Uint8Array).toBe(true);
		expect(salt.length).toBe(32);
	});

	test("generateIV returns Uint8Array", () => {
		const iv = generateIV();
		expect(iv instanceof Uint8Array).toBe(true);
		expect(iv.length).toBe(12);
	});

	test("different encryptions of same token produce different ciphertexts", async () => {
		const token = "same_token";
		const password = "password";

		const e1 = await encryptToken(token, password);
		const e2 = await encryptToken(token, password);

		expect(e1).not.toBe(e2);
	});
});
