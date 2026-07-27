# Planovo repository boundaries

This repository contains the public Planovo marketing site. The production
college application is a separate repository:

- Planovo site: `zazabag/Planovo`
- KEMS application: `Owl-14/ScheduleKEMS`
- Canonical local KEMS clone:
  `/Users/macintosheesh/Documents/Claude/Projects/КЭМС/ScheduleKEMS`

## Mandatory safety rules

1. Read `docs/COLLABORATION.md`, `docs/TASKS.md`, and
   `docs/WORKSPACE-SAFETY.md` before changing files.
2. One task uses one branch, one worktree, and one pull request.
3. Never edit KEMS code as part of a Planovo site task.
4. For ordinary site design/content work, do not change:
   - `deploy/planovo-external/Caddyfile`
   - `deploy/planovo-external/docker-compose.yml`
   - `scripts/deploy-planovo-external.mjs`
   - `scripts/smoke-planovo-external.mjs`
   - routing for `/kems/*` or `/api/*`
5. Never deploy without an explicit owner command. Site and KEMS deployments
   must not run simultaneously.
6. Do not run `pull`, `rebase`, `reset`, or `clean` in a dirty or shared
   worktree. Preserve all unknown changes.
7. Do not edit production files over SSH and do not use broad `rsync` targets.

The active redesign worktree is intentionally isolated at
`/Users/macintosheesh/Documents/kimi/Workspaces/Planovo-redesign-v1` on branch
`codex/planovo-site-redesign-v1`.
