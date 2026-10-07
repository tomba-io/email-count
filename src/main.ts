import { Actor, log } from 'apify';
import { Count } from 'tomba';

import type { RunOptions } from './tomba.js';
import { callTomba, logSummary, normalizeDomain, runPool, setupTomba, stop, unique, useRunState } from './tomba.js';

interface EmailCountInput extends RunOptions {
    domains: string[];
    maxResults?: number;
}

const SOURCE = 'tomba_email_count';

await Actor.init();

const input = await Actor.getInput<EmailCountInput>();
if (!input?.domains?.length) {
    await Actor.fail('Input must contain at least one domain in "domains".');
}

const { domains: rawDomains, maxResults = 50, ...runOptions } = input!;
const client = await setupTomba(runOptions);
const count = new Count(client);
const state = await useRunState();

const domains = unique(rawDomains.filter((domain) => typeof domain === 'string').map(normalizeDomain));
const pending = domains.filter((domain) => !state.done[domain]);
if (pending.length < domains.length) {
    log.info(`Resuming: ${domains.length - pending.length} domains already processed.`);
}

let pushed = 0;
const startedAt = Date.now();
log.info(`Counting email addresses for ${pending.length} domains`);

await runPool(pending, async (domain) => {
    if (pushed >= maxResults) {
        stop();
        return;
    }

    const res = await callTomba('email-count', { domain }, async () => count.emailCount(domain));
    if (res.skipped) return;

    const data =
        res.data && typeof res.data === 'object' && !Array.isArray(res.data) && Object.keys(res.data).length > 0
            ? (res.data as Record<string, unknown>)
            : undefined;

    if (data) {
        pushed++;
        await Actor.pushData({
            ...data,
            domain,
            source: SOURCE,
            charged: res.charged,
            cached: res.cached,
        });
        log.info(
            `${domain}: ${typeof data.total === 'number' ? data.total : 0} emails${res.cached ? ' (cached)' : ''}`,
        );
    } else {
        await Actor.pushData({
            domain,
            source: SOURCE,
            charged: res.charged,
            cached: res.cached,
            error: res.error ?? 'No email count data found',
        });
        log.info(`${domain}: ${res.error ?? 'no email count data found'}`);
    }

    state.done[domain] = true;
});

logSummary('Email Count', domains.length, startedAt);

await Actor.exit();
