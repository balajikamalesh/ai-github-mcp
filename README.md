This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## GitHub Repository Analyzer

An AI-powered tool to analyze GitHub repositories using the GitHub API and Gemini AI.

## Prerequisites

### GitHub Personal Access Token (Required)

⚠️ **Important:** You MUST provide a GitHub Personal Access Token to use this application.

Without authentication:
- **60 requests per hour** (rate limit will be hit quickly)
- Error: "API rate limit exceeded for [your IP]"

With authentication:
- **5,000 requests per hour** 
- Access to private repositories (if token has permissions)

#### Creating a GitHub Token

1. Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens?type=beta)
2. Click "Generate new token" (fine-grained token recommended)
3. Set required permissions:
   - **Repository Contents**: Read access (required)
   - **Metadata**: Read access (included by default)
4. Select repository access (all repositories or specific ones)
5. Generate token and copy it (you won't see it again!)
6. Use this token when connecting to a repository in the app

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
