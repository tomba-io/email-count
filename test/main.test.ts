// End-to-end tests: run the Actor against a mock Tomba API.
import assert from 'node:assert/strict';
import { after, afterEach, describe, it } from 'node:test';

import type { MockHandler, MockServer } from './helpers.js';
import { removeStorage, runActor, startMockTomba, totalCharges } from './helpers.js';

/** Real Tomba /email-count response data. */
const COUNT = {
    total: 1250,
    personal_emails: 1100,
    generic_emails: 150,
    department: {
        engineering: 410,
        finance: 35,
        hr: 22,
        it: 18,
        marketing: 64,
        operations: 51,
        management: 88,
        sales: 120,
        legal: 12,
        support: 47,
        communication: 9,
        executive: 15,
    },
    seniority: { junior: 180, senior: 420, executive: 37 },
};

const ZERO = {
    total: 0,
    personal_emails: 0,
    generic_emails: 0,
    department: { engineering: 0, sales: 0 },
    seniority: { junior: 0, senior: 0, executive: 0 },
};

/** Default Tomba behaviour for GET /email-count. */
const tomba: MockHandler = (req) => {
    assert.equal(req.method, 'GET');
    assert.equal(req.path, '/email-count');
    const { domain } = req.query;
    if (domain === 'unknown.com') return { body: { data: ZERO } };
    if (domain === 'null.com') return { body: { data: null } };
    if (domain === 'empty.com') return { body: { data: {} } };
    if (domain === 'invalid') return { status: 422, body: { errors: { message: 'Invalid domain' } } };
    if (domain === 'html.com') return { raw: '<html>Bad gateway</html>' };
    return { body: { data: COUNT, website_id: 1024 } };
};

const servers: MockServer[] = [];
const dirs: string[] = [];

async function mock(handler: MockHandler = tomba): Promise<MockServer> {
    const server = await startMockTomba(handler);
    servers.push(server);
    return server;
}

async function run(...args: Parameters<typeof runActor>) {
    const result = await runActor(...args);
    dirs.push(result.storageDir);
    return result;
}

afterEach(async () => {
    await Promise.all(servers.splice(0).map(async (s) => s.close()));
});

after(async () => {
    await Promise.all(dirs.map(removeStorage));
});

describe('email-count', () => {
    it('returns the email count and charges one event', async () => {
        const server = await mock();
        const result = await run({ input: { domains: ['stripe.com'] }, endpoint: server.url });

        assert.equal(result.code, 0, result.output);
        assert.deepEqual(server.requests[0].query, { domain: 'stripe.com' });
        assert.deepEqual(result.items, [
            { ...COUNT, domain: 'stripe.com', source: 'tomba_email_count', charged: true, cached: false },
        ]);
        assert.deepEqual(result.chargeCounts, { 'tomba-request': 1 });
    });

    it('charges a zero count, because Tomba answered', async () => {
        const server = await mock();
        const result = await run({ input: { domains: ['unknown.com'] }, endpoint: server.url });
        assert.equal(result.items[0].total, 0);
        assert.equal(result.items[0].charged, true);
        assert.equal(result.items[0].error, undefined);
        assert.deepEqual(result.chargeCounts, { 'tomba-request': 1 });
    });

    it('does not charge empty or null data', async () => {
        const server = await mock();
        const result = await run({ input: { domains: ['null.com', 'empty.com'] }, endpoint: server.url });

        assert.equal(result.code, 0, result.output);
        assert.equal(result.items.length, 2);
        for (const item of result.items) {
            assert.deepEqual(item, {
                domain: item.domain,
                source: 'tomba_email_count',
                charged: false,
                cached: false,
                error: 'No email count data found',
            });
        }
        assert.equal(totalCharges(result), 0);
    });

    it('sends the built-in credentials to Tomba', async () => {
        const server = await mock();
        await run({ input: { domains: ['stripe.com'] }, endpoint: server.url });
        assert.equal(server.requests[0].headers['x-tomba-key'], 'ta_test_key');
        assert.equal(server.requests[0].headers['x-tomba-secret'], 'ts_test_secret');
    });

    it('normalizes and deduplicates domains', async () => {
        const server = await mock();
        const result = await run({
            input: { domains: ['https://www.Stripe.com/pricing', 'stripe.com', ' STRIPE.COM ', '', 7] },
            endpoint: server.url,
        });
        assert.equal(result.code, 0, result.output);
        assert.deepEqual(
            server.requests.map((r) => r.query.domain),
            ['stripe.com'],
        );
        assert.equal(result.items.length, 1);
    });

    it('does not charge Tomba error statuses and does not retry them', async () => {
        const server = await mock();
        const result = await run({ input: { domains: ['invalid'] }, endpoint: server.url });
        assert.equal(result.code, 0, result.output);
        assert.equal(server.requests.length, 1);
        assert.equal(result.items[0].charged, false);
        assert.match(String(result.items[0].error), /422: Invalid domain/);
        assert.equal(totalCharges(result), 0);
    });

    it('does not charge a non-JSON body', async () => {
        const server = await mock();
        const result = await run({ input: { domains: ['html.com'] }, endpoint: server.url });
        assert.equal(result.items[0].charged, false);
        assert.match(String(result.items[0].error), /Invalid response/);
        assert.equal(totalCharges(result), 0);
    });

    it('retries 429 and 5xx responses, then charges the success once', async () => {
        let calls = 0;
        const server = await mock(async (req) => {
            calls++;
            if (calls === 1)
                return {
                    status: 429,
                    body: { errors: { message: 'Too many requests' } },
                    headers: { 'retry-after': '1' },
                };
            if (calls === 2) return { status: 503, body: {} };
            return tomba(req);
        });
        const result = await run({ input: { domains: ['stripe.com'], maxRetries: 3 }, endpoint: server.url });
        assert.equal(server.requests.length, 3);
        assert.equal(result.items.length, 1);
        assert.equal(result.items[0].charged, true);
        assert.deepEqual(result.chargeCounts, { 'tomba-request': 1 });
    });

    it('serves repeated runs from the cache for free', async () => {
        const server = await mock();
        const first = await run({ input: { domains: ['stripe.com'] }, endpoint: server.url });
        const second = await run({
            input: { domains: ['stripe.com'] },
            endpoint: server.url,
            storageDir: first.storageDir,
        });

        assert.equal(server.requests.length, 1);
        assert.equal(second.items.length, 1);
        assert.equal(second.items[0].cached, true);
        assert.equal(second.items[0].charged, false);
        assert.equal(second.items[0].total, 1250);
        assert.equal(totalCharges(second), 0);
    });

    it('calls Tomba again when the cache is disabled', async () => {
        const server = await mock();
        const input = { domains: ['stripe.com'], useCache: false };
        const first = await run({ input, endpoint: server.url });
        const second = await run({ input, endpoint: server.url, storageDir: first.storageDir });
        assert.equal(server.requests.length, 2);
        assert.equal(second.items[0].cached, false);
        assert.deepEqual(second.chargeCounts, { 'tomba-request': 1 });
    });

    it('stops at the max charge limit and resumes without reprocessing', async () => {
        const server = await mock();
        const domains = ['a.com', 'b.com', 'c.com', 'd.com', 'e.com'];
        const input = { domains, maxConcurrency: 1, useCache: false, maxResults: 100 };

        // Locally every event costs $1, so a $2 budget allows two billable requests.
        const first = await run({ input, endpoint: server.url, maxTotalChargeUsd: 2 });
        assert.equal(first.code, 0, first.output);
        assert.equal(totalCharges(first), 2);
        assert.equal(server.requests.length, 2);

        const second = await run({ input, endpoint: server.url, storageDir: first.storageDir, keepStorage: true });
        assert.equal(second.code, 0, second.output);
        assert.deepEqual(
            server.requests.map((r) => r.query.domain),
            domains,
        );
        assert.equal(second.items.length, 5);
    });

    it('respects maxResults', async () => {
        const server = await mock();
        const result = await run({
            input: { domains: ['a.com', 'b.com', 'c.com'], maxResults: 2, maxConcurrency: 1 },
            endpoint: server.url,
        });
        assert.equal(result.items.length, 2);
        assert.equal(server.requests.length, 2);
    });

    it('runs requests in parallel', async () => {
        let active = 0;
        let peak = 0;
        const server = await mock(async (req) => {
            active++;
            peak = Math.max(peak, active);
            await new Promise((r) => {
                setTimeout(r, 100);
            });
            active--;
            return tomba(req);
        });
        const domains = Array.from({ length: 8 }, (_, i) => `site${i}.com`);
        await run({ input: { domains, maxConcurrency: 4 }, endpoint: server.url });
        assert.equal(server.requests.length, 8);
        assert.ok(peak > 1 && peak <= 4, `peak concurrency ${peak}`);
    });

    it('fails without Tomba credentials and never calls the API', async () => {
        const server = await mock();
        const result = await run({ input: { domains: ['stripe.com'] }, endpoint: server.url, withCredentials: false });
        assert.notEqual(result.code, 0);
        assert.match(result.output, /misconfigured/);
        assert.doesNotMatch(result.output, /ta_test_key|ts_test_secret/);
        assert.equal(server.requests.length, 0);
    });

    it('fails on empty input', async () => {
        const server = await mock();
        const result = await run({ input: { domains: [] }, endpoint: server.url });
        assert.notEqual(result.code, 0);
        assert.equal(server.requests.length, 0);
    });

    it('fails when domains is missing', async () => {
        const server = await mock();
        const result = await run({ input: {}, endpoint: server.url });
        assert.notEqual(result.code, 0);
        assert.equal(server.requests.length, 0);
    });
});
