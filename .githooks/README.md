# Commit message policy and hook

This repository includes a `commit-msg` hook in the `.githooks/` directory to enforce professional, human-written commit messages suitable for a hackathon submission.

Rules enforced by the hook
- Commit message must not be empty and should have a meaningful summary.
- Summary (first line) must be at least 10 characters.
- Avoid placeholder or informal words like: `wip`, `temp`, `fixup`, `merge`, `test`, `debug`.
- Avoid AI/automation references: `ai`, `generated`, `automated`, `bot`, `chatgpt`, `gpt`, `openai`, etc.
- Avoid vague single-word summaries such as `Update`, `Initial`, `Changes`, `Misc`.

Recommended format
- Short summary (<= 50 chars) describing the change, optionally prefixed by a scope and type, e.g. `feat(auth): add JWT refresh endpoint`.
- Blank line
- Detailed body explaining the why, and any migration or rollout notes.

How to enable locally
1. Make sure your git supports shell hooks (Git for Windows does).
2. Configure git to use this hooks directory (run once):

   git config core.hooksPath .githooks

3. Commit as usual. The `commit-msg` hook will run and reject messages that don't meet the rules.

Bypass (not recommended)
- To bypass in an emergency, you can use `git commit --no-verify`, but this should be rare and documented in PRs.

Updating rules
- If you want to change the checks, edit `.githooks/commit-msg` and communicate updates to the team.
