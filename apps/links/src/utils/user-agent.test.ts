import { describe, expect, test } from "bun:test";
import { parseUserAgent } from "./user-agent";

describe("parseUserAgent", () => {
	describe("null and empty handling", () => {
		test("should return null values for null user agent", () => {
			const result = parseUserAgent(null);
			expect(result.browserName).toBeNull();
			expect(result.deviceType).toBeNull();
		});

		test("should return null values for empty string", () => {
			const result = parseUserAgent("");
			expect(result.browserName).toBeNull();
			expect(result.deviceType).toBeNull();
		});
	});

	describe("desktop browsers", () => {
		test("should parse Chrome on Windows", () => {
			const ua =
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
			const result = parseUserAgent(ua);
			expect(result.browserName).toBe("Chrome");
			expect(result.deviceType).toBe("desktop");
		});

		test("should parse Firefox on Windows", () => {
			const ua =
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0";
			const result = parseUserAgent(ua);
			expect(result.browserName).toBe("Firefox");
			expect(result.deviceType).toBe("desktop");
		});

		test("should parse Safari on macOS", () => {
			const ua =
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15";
			const result = parseUserAgent(ua);
			expect(result.browserName).toBe("Safari");
			expect(result.deviceType).toBe("desktop");
		});

		test("should parse Edge on Windows", () => {
			const ua =
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
			const result = parseUserAgent(ua);
			expect(result.browserName).toBe("Edge");
			expect(result.deviceType).toBe("desktop");
		});
	});

	describe("mobile browsers", () => {
		test("should parse Safari on iPhone", () => {
			const ua =
				"Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1";
			const result = parseUserAgent(ua);
			expect(result.browserName).toBe("Mobile Safari");
			expect(result.deviceType).toBe("mobile");
		});

		test("should parse Chrome on Android", () => {
			const ua =
				"Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36";
			const result = parseUserAgent(ua);
			expect(result.browserName).toBe("Mobile Chrome");
			expect(result.deviceType).toBe("mobile");
		});

		test("should parse Firefox on Android", () => {
			const ua =
				"Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0";
			const result = parseUserAgent(ua);
			expect(result.browserName).toBe("Mobile Firefox");
			expect(result.deviceType).toBe("mobile");
		});

		test("should parse Samsung Browser", () => {
			const ua =
				"Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36";
			const result = parseUserAgent(ua);
			expect(result.browserName).toBe("Samsung Internet");
			expect(result.deviceType).toBe("mobile");
		});
	});

	describe("tablets", () => {
		test("should parse Safari on iPad", () => {
			const ua =
				"Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1";
			const result = parseUserAgent(ua);
			expect(result.browserName).toBe("Mobile Safari");
			expect(result.deviceType).toBe("tablet");
		});

		test("should parse Chrome on Android tablet", () => {
			const ua =
				"Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Safari/537.36";
			const result = parseUserAgent(ua);
			expect(result.browserName).toBe("Chrome");
			expect(result.deviceType).toBe("tablet");
		});
	});

	describe("bots and crawlers", () => {
		test("should handle Googlebot gracefully", () => {
			const ua =
				"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
			const result = parseUserAgent(ua);
			// UA parser may not detect bot browsers, returns null
			expect(result.browserName).toBeNull();
			expect(result.deviceType).toBe("desktop");
		});

		test("should handle Bingbot gracefully", () => {
			const ua =
				"Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)";
			const result = parseUserAgent(ua);
			// UA parser may not detect bot browsers, returns null
			expect(result.browserName).toBeNull();
			expect(result.deviceType).toBe("desktop");
		});
	});

	describe("CLI tools", () => {
		test("should handle curl gracefully", () => {
			const ua = "curl/8.4.0";
			const result = parseUserAgent(ua);
			// UA parser may not detect CLI tools
			expect(result.browserName).toBeNull();
			expect(result.deviceType).toBe("desktop");
		});

		test("should handle wget gracefully", () => {
			const ua = "Wget/1.21.4";
			const result = parseUserAgent(ua);
			// UA parser may not detect CLI tools
			expect(result.browserName).toBeNull();
			expect(result.deviceType).toBe("desktop");
		});
	});

	describe("edge cases", () => {
		test("should handle malformed user agent gracefully", () => {
			const ua = "not a real user agent at all!!!";
			const result = parseUserAgent(ua);
			// Should not throw, returns null or default values
			expect(result.browserName).toBeNull();
			expect(result.deviceType).toBe("desktop");
		});

		test("should handle very long user agent", () => {
			const ua = "Mozilla/5.0 ".repeat(100);
			const result = parseUserAgent(ua);
			// Should not throw
			expect(result).toBeDefined();
		});

		test("should handle unicode in user agent", () => {
			const ua = "Mozilla/5.0 (测试浏览器) Chrome/120.0.0.0";
			const result = parseUserAgent(ua);
			expect(result).toBeDefined();
		});
	});
});
