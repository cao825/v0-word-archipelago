# Security Policy

## About this project

Word Isles is a word game built with Next.js (App Router) + React + Redux,
deployed on Vercel. It is mostly a static, client-side single-page app, but it
has a small server surface: one Next.js API route
(`app/api/leaderboard/route.ts`) backed by an Upstash Redis store, which holds
the leaderboard (player-entered initials + game scores). There are no user
accounts, no authentication, and no other personal data is collected.

The realistic security surface is therefore third-party dependency
vulnerabilities — monitored via OSV-Scanner, CodeQL, and Dependabot in this
repository — plus the leaderboard API route and its data store (untrusted input
there is sanitized; CodeQL is wired to catch regressions).

## Supported versions

This project is continuously deployed from `main`. Only the currently
deployed version receives fixes; there are no maintained release branches.

| Version            | Supported |
| ------------------ | --------- |
| Deployed `main`    | Yes       |
| Anything older     | No        |

## Reporting a vulnerability

Please do not open a public issue for security reports.

Use GitHub's private vulnerability reporting for this repository:
**Security → Report a vulnerability** (the "Report a vulnerability" button
on the repo's Security tab). This opens a private advisory visible only to
the maintainers.

We'll acknowledge a valid report as soon as we're able. As a personal
hobby project, response times are best-effort, not guaranteed.
