import { log } from 'apify';
import { Count } from 'tomba';

import { InputError, queryInt, queryList, runActor } from './standby.js';
import type { RunOptions } from './tomba.js';
import { callTomba, getClient, normalizeDomain, runPool, unique } from './tomba.js';

interface EmailCountInput extends RunOptions {
    domains?: string[];
    maxResults?: number;
}

const SOURCE = 'tomba_email_count';

await runActor<EmailCountInput>({
    title: 'Email Count',
    count: (input) => input.domains?.length ?? 0,
    fromQuery: (query) => ({
        domains: queryList(query, 'domain', 'domains'),
        maxResults: queryInt(query, 'maxResults'),
    }),
    run: async (input, { push, isDone, markDone, standby }) => {
        if (!input.domains?.length) throw new InputError('Input must contain at least one domain in "domains".');

        const { domains: rawDomains, maxResults = 50 } = input;
        const count = new Count(getClient());

        const domains = unique(rawDomains.filter((domain) => typeof domain === 'string').map(normalizeDomain));
        const pending = domains.filter((domain) => !isDone(domain));
        if (pending.length < domains.length) {
            log.info(`Resuming: ${domains.length - pending.length} domains already processed.`);
        }

        let pushed = 0;
        const limitReached = () => pushed >= maxResults;
        if (!standby) log.info(`Counting email addresses for ${pending.length} domains`);

        await runPool(
            pending,
            async (domain) => {
                if (limitReached()) return;

                const res = await callTomba('email-count', { domain }, async () => count.emailCount(domain));
                if (res.skipped) return;

                const data =
                    res.data &&
                    typeof res.data === 'object' &&
                    !Array.isArray(res.data) &&
                    Object.keys(res.data).length > 0
                        ? (res.data as Record<string, unknown>)
                        : undefined;

                if (data) {
                    pushed++;
                    await push({
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
                    await push({
                        domain,
                        source: SOURCE,
                        charged: res.charged,
                        cached: res.cached,
                        error: res.error ?? 'No email count data found',
                    });
                    log.info(`${domain}: ${res.error ?? 'no email count data found'}`);
                }

                markDone(domain);
            },
            undefined,
            limitReached,
        );
    },
});
