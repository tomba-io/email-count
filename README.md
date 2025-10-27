# Tomba Email-Count Actor

[![Actor](https://img.shields.io/badge/Apify-Actor-blue)](https://apify.com/actors)
[![Tomba API](https://img.shields.io/badge/Tomba-API-green)](https://tomba.io)
[![Rate Limit](https://img.shields.io/badge/Rate%20Limit-150%2Fmin-orange)](https://tomba.io/api)

A powerful Apify Actor that counts email addresses for domains using the **Tomba Email Count API**. Perfect for sales teams, marketers, and researchers who need to understand the email landscape of target companies for lead generation planning, market sizing, and competitive analysis.

## Key Features

- **Email Counting**: Get accurate email count statistics for any domain
- **Departmental Breakdown**: Email counts by department (sales, engineering, marketing, etc.)
- **Seniority Analysis**: Email distribution by seniority levels (junior, senior, executive)
- **Quality Metrics**: Confidence levels and data freshness indicators
- **Rate Limited**: Respects Tomba's 150 requests per minute limit
- **Bulk Processing**: Process multiple domains efficiently
- **Error Handling**: Robust error handling with detailed logging

## How it works

The Actor leverages Tomba's powerful Email Count API to gather comprehensive email statistics:

### Process Flow

1. **Authentication**: Connects to Tomba API using your credentials
2. **Domain Processing**: Accepts array of domains to analyze
3. **Count Analysis**: Retrieves detailed email statistics for each domain
4. **Rate Limiting**: Automatically handles 150 requests/minute limit
5. **Data Storage**: Saves results to Apify dataset

### What You Get

For each domain, you'll receive:

- **Total Email Count**: Complete number of email addresses found
- **Email Type Breakdown**: Personal vs generic email distribution
- **Department Statistics**: Email counts by department (engineering, sales, marketing, etc.)
- **Seniority Distribution**: Email counts by job level (junior, senior, executive)
- **Quality Indicators**: Confidence levels and data freshness
- **Organization Context**: Basic company information for context

## Quick Start

### Prerequisites

1. **Tomba Account**: Sign up at [Tomba.io](https://app.tomba.io/api) to get your API credentials

### Getting Your API Keys

1. Visit [Tomba API Dashboard](https://app.tomba.io/api)
2. Copy your **API Key** (starts with `ta_`)
3. Copy your **Secret Key** (starts with `ts_`)

## Input Configuration

### Required Parameters

| Parameter        | Type     | Description                     |
| ---------------- | -------- | ------------------------------- |
| `tombaApiKey`    | `string` | Your Tomba API key (ta_xxxx)    |
| `tombaApiSecret` | `string` | Your Tomba secret key (ts_xxxx) |
| `domains`        | `array`  | Array of domains to count       |

### Optional Parameters

| Parameter    | Type     | Default | Description                         |
| ------------ | -------- | ------- | ----------------------------------- |
| `maxResults` | `number` | `50`    | Maximum number of results to return |

### Example Input

```json
{
    "tombaApiKey": "ta_xxxxxxxxxxxxxxxxxxxx",
    "tombaApiSecret": "ts_xxxxxxxxxxxxxxxxxxxx",
    "domains": ["tomba.io", "stripe.com", "google.com"],
    "maxResults": 100
}
```

### Best Practices

- **Domain Selection**: Use clean domain names without protocols (http/https)
- **Rate Limits**: The Actor automatically handles Tomba's 150 requests/minute limit
- **Batch Size**: Process 10-50 domains at a time for optimal performance

## Output Data Structure

The Actor returns comprehensive email count statistics for each domain:

### Example Output

```json
{
    "domain": "tomba.io",
    "total": 245,
    "personalEmails": 198,
    "genericEmails": 47,
    "department": {
        "engineering": 45,
        "sales": 38,
        "marketing": 32,
        "hr": 15,
        "finance": 12,
        "legal": 8,
        "executive": 25,
        "support": 28,
        "other": 42
    },
    "seniority": {
        "junior": 89,
        "senior": 125,
        "executive": 31
    },
    "source": "tomba_email_count"
}
```

### Data Structure Overview

The output contains comprehensive email statistics organized into logical sections:

#### Email Count Statistics

- **Total Count**: Complete number of email addresses found for the domain
- **Email Types**: Breakdown between personal and generic email addresses
- **Quality Metrics**: Confidence levels and data freshness indicators

#### Departmental Analysis

- **Department Breakdown**: Email counts by department
    - Engineering, Sales, Marketing, HR, Finance
    - Legal, Executive, Support, and Other departments
- **Distribution Insights**: Understanding of team structure and size

#### Seniority Distribution

- **Junior Level**: Entry-level and junior position email counts
- **Senior Level**: Senior and mid-level position email counts
- **Executive Level**: C-level and executive position email counts

### Key Benefits

- **Market Sizing**: Understand the email landscape of target companies
- **Lead Planning**: Plan outreach campaigns based on email counts
- **Competitive Analysis**: Compare email presence across competitors
- **Quality Assessment**: Confidence levels ensure data reliability
- **Strategic Insights**: Department and seniority distribution for targeting

## Use Cases

- **Lead Generation Planning**: Estimate potential lead volume before launching campaigns
- **Market Research**: Analyze email presence and organizational structure of target markets
- **Competitive Intelligence**: Compare email footprints across competitor domains
- **Sales Planning**: Size potential markets and plan outreach strategies
- **Data Validation**: Verify domain email capacity before major campaigns
- **Business Intelligence**: Understand organizational structure through email distribution
- **Campaign Optimization**: Plan department-specific or seniority-targeted campaigns

## Resources & Documentation

### API Documentation

- [Tomba API Docs](https://tomba.io/api) - Complete API reference
- [Authentication Guide](https://app.tomba.io/api) - Get your API keys
- [Pricing & Limits](https://tomba.io/pricing) - Understand rate limits and costs
- [Email Count API](https://docs.tomba.io/api/finder#email-count) - Specific endpoint documentation

## Keywords

email count, email analytics, domain email statistics, email volume analysis, company email insights, email metrics, business intelligence, email data analysis, corporate email count, domain analysis

## Support

If you need any help, have questions, or encounter any issues while using Tomba.io, please don't hesitate to reach out to our support team. You can contact us via:

- **Email**: support@tomba.io
- **Live chat**: Available on the Tomba.io website during business hours

## Contributing

We welcome contributions to improve this actor. Please feel free to submit issues, feature requests, or pull requests to help make this tool even better for the community.

## About Tomba

Founded in 2020, Tomba prides itself on being the most reliable, accurate, and in-depth source of email address data available anywhere. We process terabytes of data to produce our Email finder API.

![Tomba Logo](https://tomba.io/logo.png)
