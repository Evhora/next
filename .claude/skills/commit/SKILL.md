---
name: commit
description: Use whenever the user asks to create a git commit in this repo — phrases like "commit this", "make a commit", "commit the changes", "/commit", or any request to record staged work into git history. Enforces the project's Conventional Commits style (lowercase, short subject, no body unless needed) and strictly forbids any agent/model attribution trailers (no "Co-Authored-By: Claude", no "Generated with Claude Code", no emojis). Only commits what is already staged — never runs `git add`.
---

# Commit

Create a git commit that matches this repo's history. Keep it short, conventional, and free of any AI attribution.

**Always delegate the commit message generation to `/caveman-commit`.** Invoke the `caveman:caveman-commit` skill to draft the message — it produces the ultra-compressed Conventional Commits format this repo uses. Do not hand-write the subject line yourself; let `/caveman-commit` generate it, then commit with that message following the rules below.

## Hard rules

- **Never** include `Co-Authored-By: Claude` (or any model/agent name), `Generated with Claude Code`, 🤖 emoji, or any other trailer that hints the commit was AI-assisted. The user's history is clean — keep it that way.
- **Never** run `git add`, `git add -A`, or `git add .`. Only commit what the user has already staged. If nothing is staged, stop and tell the user.
- **Never** use `--amend`, `--no-verify`, or `-i`.
- **Never** push without asking first. After the commit succeeds, offer to push; wait for confirmation.

## Format

`/caveman-commit` produces the Conventional Commits subject. No scopes (history doesn't use them). No body unless the _why_ is genuinely non-obvious.

## Workflow

1. Run these in parallel:
   - `git status` (no `-uall`)
   - `git diff --staged`
   - `git log --oneline -10` (sanity-check tone)
2. If `git diff --staged` is empty: stop. Tell the user nothing is staged and ask what to stage. Do not stage on their behalf unless they name files.
3. Read the staged diff. Pick the type that best fits the dominant change. If the diff spans unrelated changes, mention it and ask whether to split — but defer to the user.
4. Invoke `/caveman-commit` to generate the subject line from the staged diff. Sanity-check it: lowercase, imperative, under ~60 chars, accurate type.
5. Commit with a heredoc so formatting is preserved:

   ```bash
   git commit -m "$(cat <<'EOF'
   feat: add dream discovery page
   EOF
   )"
   ```

   No trailers. No co-authors. No signature.

6. Run `git status` to confirm the commit landed and the working tree is clean (or shows only the files the user intentionally left unstaged).
7. Ask the user if they want to push. If yes, `git push` (plain — no `--force`, no `--no-verify`). If the branch has no upstream, ask before running `git push -u origin <branch>`.

## When the hook fails

If a pre-commit hook rejects the commit, the commit did **not** happen. Do not `--amend`. Fix the underlying issue, re-stage the fixed files (only those — still no `-A`), and create a new commit with the same message.

## Why this matters

This repo's history is the project's narrative. Short conventional subjects make `git log` scannable; AI attribution trailers add noise and date the commits to a specific tool. The user has chosen to keep authorship clean — respect that choice.
