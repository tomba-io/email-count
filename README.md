# Tomba Email Count

[![Price](https://img.shields.io/badge/Price-%243.12%20per%201K%20domains-brightgreen)](#pricing)
[![No signup](https://img.shields.io/badge/Tomba%20account-not%20needed-blue)](#quick-start)
[![No rate limit](https://img.shields.io/badge/Rate%20limit-none-brightgreen)](#built-for-big-lists)

**See how many contacts you can reach at any company before you spend a cent on outreach.** Paste a list of domains and get the number of email addresses Tomba knows for each one, split into personal and generic addresses, by department and by seniority.

No Tomba account. No API key. No subscription. **You pay $0.00312 per domain, and only when we return a count.**

## Why teams choose this Actor

- **Start in 30 seconds**: Open the Actor, paste your domains, click Start. Nothing to sign up for
- **Pay only for results**: Errors and invalid inputs are free
- **$3.12 per 1,000 domains**: No monthly plan, no credits that expire, no minimum spend
- **More than a number**: Personal vs. generic addresses, plus a breakdown by department and seniority
- **Built for big lists**: No rate limit. Thousands of domains run in parallel
- **Never pay twice**: Domains you looked up in the last 24 hours come back from cache for free
- **Clean input, clean output**: Paste URLs or domains in any format; duplicates are removed automatically
- **Export anywhere**: Download as CSV, Excel or JSON, or send results straight to your CRM with Apify integrations

## What you can do with it

| Goal                      | How email counts help                                                |
| ------------------------- | -------------------------------------------------------------------- |
| **Prioritize accounts**   | Focus on the companies where you can reach the most people           |
| **Plan campaigns**        | Estimate how many contacts a list of companies will give you         |
| **Target the right team** | See how many contacts work in sales, marketing, engineering and more |
| **Reach decision makers** | Check how many senior and executive contacts each company has        |
| **Size a market**         | Compare the reachable audience across an industry or region          |

## Quick start

1. Click **Try for free**
2. Paste your domains into **Domains to Count** (for example `stripe.com`, `shopify.com`)
3. Click **Start**, then download your results as CSV, Excel or JSON

That's it. No Tomba account or API key is needed.

## Input

| Field            | Required | Default | Description                                                                 |
| ---------------- | -------- | ------- | --------------------------------------------------------------------------- |
| `domains`        | Yes      |         | Domains to count. URLs like `https://www.stripe.com/pricing` are cleaned up |
| `maxResults`     | No       | `50`    | Maximum number of domains to count                                          |
| `maxConcurrency` | No       | `10`    | How many domains to process at the same time (1–50)                         |
| `maxRetries`     | No       | `3`     | How many times to retry a temporary failure (0–10)                          |
| `useCache`       | No       | `true`  | Reuse results from your previous runs for free                              |
| `cacheTtlHours`  | No       | `24`    | How long cached results stay valid (`0` turns the cache off)                |

```json
{
    "domains": ["stripe.com", "shopify.com", "tomba.io"],
    "maxResults": 500
}
```

## Output

You get one row per domain:

```json
{
    "total": 1250,
    "personal_emails": 1100,
    "generic_emails": 150,
    "department": {
        "engineering": 410,
        "finance": 35,
        "hr": 22,
        "it": 18,
        "marketing": 64,
        "operations": 51,
        "management": 88,
        "sales": 120,
        "legal": 12,
        "support": 47,
        "communication": 9,
        "executive": 15
    },
    "seniority": {
        "junior": 180,
        "senior": 420,
        "executive": 37
    },
    "domain": "stripe.com",
    "source": "tomba_email_count",
    "charged": true,
    "cached": false
}
```

| Field             | Description                                                                             |
| ----------------- | --------------------------------------------------------------------------------------- |
| `domain`          | The domain you submitted                                                                |
| `total`           | Total number of email addresses found for the domain                                    |
| `personal_emails` | Addresses that belong to a person, e.g. `jane.doe@`                                     |
| `generic_emails`  | Shared addresses, e.g. `info@`, `support@`                                              |
| `department`      | Number of addresses per department: sales, marketing, engineering, finance, HR and more |
| `seniority`       | Number of addresses per seniority level: `junior`, `senior`, `executive`                |
| `source`          | Always `tomba_email_count`                                                              |
| `charged`         | `true` if this lookup was billed                                                        |
| `cached`          | `true` if this result came from the cache (free)                                        |
| `error`           | Why no count was returned, if applicable                                                |

## Pricing

**$0.00312 per domain ($3.12 per 1,000).** No subscription and no Tomba account needed.

You are only charged when Tomba returns a count:

| What happens                                    | Charged |
| ----------------------------------------------- | ------- |
| A count is returned for the domain              | Yes     |
| A count of zero is returned for the domain      | Yes     |
| No count returned                               | No      |
| Invalid domain or any other error               | No      |
| Temporary failure (it is retried automatically) | No      |
| Result served from the cache                    | No      |

Every row shows `charged` and `cached`, so you always know what you paid for. To cap your spend, set **Maximum cost per run** in the run options: the Actor stops cleanly when the limit is reached.

## Built for big lists

- **No rate limit**: up to 50 domains are processed at the same time
- **Automatic retries**: temporary failures are retried for you, and never billed
- **Resumable**: if a run is interrupted, it continues where it stopped without charging you again
- **Cache**: repeat lookups within 24 hours are free

## Integrations

Run it on a schedule, call it from the Apify API, or connect it to Zapier, Make, Google Sheets, HubSpot, Slack and hundreds of other apps with [Apify integrations](https://docs.apify.com/platform/integrations). Webhooks let you trigger your own workflow as soon as a run finishes.

## FAQ

**Do I need a Tomba account or API key?**
No. Everything is built in. You only pay the per-domain price on Apify.

**How much does it cost?**
$0.00312 per domain ($3.12 per 1,000). A count of zero is still an answer, so it is charged. Errors and cached lookups are free.

**Does this give me the email addresses?**
No. It tells you how many addresses exist and how they break down, so you can decide where to focus. To get the addresses themselves, use Tomba Domain Search.

**How many domains can I count in one run?**
Up to 1,000 per run, processed in parallel. There is no rate limit.

**What domain format should I use?**
Anything works: `stripe.com`, `www.stripe.com` or `https://stripe.com/pricing`. We clean it up and remove duplicates.

**What if my run is interrupted?**
It picks up where it stopped. Domains already counted are not charged again.

**How do I limit what I spend?**
Set **Maximum cost per run** before you start. The Actor stops as soon as the limit is reached.

## Support

Questions or feedback? We're happy to help:

- **Email**: support@tomba.io
- **Live chat**: on [tomba.io](https://tomba.io) during business hours
- **Issues**: use the **Issues** tab on this Actor's page

## About Tomba

Founded in 2020, [Tomba](https://tomba.io) is a B2B data platform for finding, verifying and enriching business contacts. Our Email Finder, Domain Search and Email Verifier help sales and marketing teams reach the right people.

![Tomba Logo](https://tomba.io/logo.png)
