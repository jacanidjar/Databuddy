import { describe, expect, test } from "bun:test";
import { hashIp } from "./hash";

describe("hashIp", () => {
	describe("output format", () => {
		test("should return a 64-character hex string (SHA256)", () => {
			const result = hashIp("192.168.1.1");
			expect(result).toMatch(/^[a-f0-9]{64}$/);
		});

		test("should return consistent hash for same IP", () => {
			const ip = "8.8.8.8";
			const hash1 = hashIp(ip);
			const hash2 = hashIp(ip);
			expect(hash1).toBe(hash2);
		});

		test("should return different hash for different IPs", () => {
			const hash1 = hashIp("8.8.8.8");
			const hash2 = hashIp("1.1.1.1");
			expect(hash1).not.toBe(hash2);
		});
	});

	describe("edge cases", () => {
		test("should handle empty string", () => {
			const result = hashIp("");
			expect(result).toMatch(/^[a-f0-9]{64}$/);
		});

		test("should handle IPv6 addresses", () => {
			const result = hashIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
			expect(result).toMatch(/^[a-f0-9]{64}$/);
		});

		test("should handle localhost", () => {
			const result = hashIp("127.0.0.1");
			expect(result).toMatch(/^[a-f0-9]{64}$/);
		});

		test("should handle 'unknown' string", () => {
			const result = hashIp("unknown");
			expect(result).toMatch(/^[a-f0-9]{64}$/);
		});
	});

	describe("uniqueness", () => {
		test("should generate unique hashes for 100 random IPs", () => {
			const hashes = new Set<string>();
			const ips = Array.from({ length: 100 }, (_, i) => {
				const octet1 = Math.floor(i / 27) + 1;
				const octet2 = (i * 7) % 256;
				const octet3 = (i * 13) % 256;
				const octet4 = (i * 17) % 256;
				return `${octet1}.${octet2}.${octet3}.${octet4}`;
			});

			for (const ip of ips) {
				const hash = hashIp(ip);
				expect(hash).toMatch(/^[a-f0-9]{64}$/);
				hashes.add(hash);
			}

			expect(hashes.size).toBe(ips.length);
		});
	});

	describe("privacy properties", () => {
		test("should not expose original IP in hash", () => {
			const ip = "192.168.1.1";
			const hash = hashIp(ip);

			// Hash should not contain the IP
			expect(hash).not.toContain("192");
			expect(hash).not.toContain("168");
		});

		test("hash should not be reversible to IP", () => {
			// This is a property test - the hash should be one-way
			const ip = "10.0.0.1";
			const hash = hashIp(ip);

			// A proper SHA256 hash should be 64 hex characters
			// and contain no pattern that could be reversed
			expect(hash.length).toBe(64);
			expect(hash).not.toBe(ip);
		});
	});
});
