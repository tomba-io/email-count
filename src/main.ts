// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { Actor } from 'apify';
// Tomba SDK for email count
import { Count, TombaClient } from 'tomba';

interface ActorInput {
    tombaApiKey: string;
    tombaApiSecret: string;
    domains?: string[];
    maxResults?: number;
}

// Rate limiting: 150 requests per minute
const RATE_LIMIT = 150;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
let requestCount = 0;
let windowStart = Date.now();

async function rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // Reset counter if window has passed
    if (now - windowStart > RATE_LIMIT_WINDOW) {
        requestCount = 0;
        windowStart = now;
    }

    // Check if we've hit the rate limit
    if (requestCount >= RATE_LIMIT) {
        const waitTime = RATE_LIMIT_WINDOW - (now - windowStart);
        console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), waitTime);
        });

        // Reset after waiting
        requestCount = 0;
        windowStart = Date.now();
    }

    requestCount++;
    return await requestFn();
}

// The init() call configures the Actor for its environment
await Actor.init();

try {
    // Get input from the Actor
    const input = (await Actor.getInput()) as ActorInput;

    if (!input) {
        throw new Error('No input provided');
    }

    if (!input.tombaApiKey || !input.tombaApiSecret) {
        throw new Error('Tomba API key and secret are required');
    }

    console.log('Starting Tomba Email-Count Actor...');
    console.log(`Processing ${input.domains?.length || 0} domains`);

    // Initialize Tomba client
    const client = new TombaClient();
    const count = new Count(client);

    client.setKey(input.tombaApiKey).setSecret(input.tombaApiSecret);

    const results: Record<string, unknown>[] = [];
    const maxResults = input.maxResults || 50;

    // Process domains
    if (input.domains && input.domains.length > 0) {
        console.log(`Processing ${input.domains.length} domains...`);

        for (const domain of input.domains) {
            if (results.length >= maxResults) break;

            try {
                console.log(`Getting email count for domain: ${domain}`);

                // Use Tomba's email count method with rate limiting
                const tombaResult = await rateLimitedRequest(async () => count.emailCount(domain));

                if (tombaResult && tombaResult.data) {
                    const countData = {
                        ...tombaResult.data,
                        domain,
                        source: 'tomba_email_count',
                    };

                    results.push(countData);
                    console.log(`Found email count for: ${domain} - ${tombaResult.data.total || 0} emails`);
                }
            } catch (error) {
                console.log(`Error processing domain ${domain}:`, error);

                // Add error entry to results for transparency
                results.push({
                    domain,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    source: 'tomba_email_count',
                });
            }
        }
    }

    if (results.length > 0) {
        await Actor.pushData(results);
    }

    // Log summary
    console.log('=== SUMMARY ===');
    console.log(`Total domains processed: ${input.domains?.length || 0}`);
    console.log(`Successful counts: ${results.filter((r) => !('error' in r)).length}`);
    console.log(`Failed counts: ${results.filter((r) => 'error' in r).length}`);
} catch (error) {
    console.error('Actor failed:', error);
    throw error;
}

// Gracefully exit the Actor process
await Actor.exit();
