#!/usr/bin/env bash
# Stop hook: once per turn, checks whether files changed this session
# introduced code no longer referenced anywhere else in the monorepo.
# Advisory only (see .claude/agents/dead-code-checker.md) — never edits
# anything. Skips entirely (no subagent spawned) when nothing changed.
set -u

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$repo_root" || exit 0

changed="$(git status --porcelain=v1 -- '*.ts' '*.tsx' 2>/dev/null \
  | awk '{print $2}' \
  | grep -v -E '(^|/)(node_modules|\.next|dist|build)/' \
  | sort -u)"

if [ -z "$changed" ]; then
  exit 0
fi

prompt="You are a read-only dead-code auditor for the Mobvex monorepo (Turborepo + pnpm workspaces: apps/mobile, apps/trainer, packages/db, packages/ui, packages/utils). The following files were just changed in the working tree:

$changed

Task: for each changed file, list its exported functions/consts/components/types. For each export, search the rest of the monorepo (excluding node_modules, .next, dist, and the defining file itself) for references to that export name. If you find NO references anywhere else in the repo, flag it as a candidate for removal. Be conservative: do NOT flag anything that is (a) re-exported from an index/barrel file, (b) a Next.js/Expo Router page/layout/route file (default exports there are framework-invoked, not manually referenced), (c) referenced only via a string you can't grep exactly (dynamic import, route path, config key), or (d) part of a package's public API surface that another app/package might consume — check apps/mobile and apps/trainer too, not just the package that defines it.

Output: a short, plain-text report. If nothing looks unused, say so in one line. Otherwise list each candidate as 'file:line — symbol — reason', at most 8 items, most confident first. Do not modify any files. Do not run any commands other than reading/searching the codebase."

result="$(claude -p "$prompt" \
  --model haiku \
  --tools "Read,Grep,Glob" \
  --setting-sources user \
  --output-format json \
  --no-session-persistence \
  --max-budget-usd 0.15 \
  2>/dev/null)"

text="$(printf '%s' "$result" | jq -r '.result // empty' 2>/dev/null)"

if [ -z "$text" ]; then
  exit 0
fi

jq -n --arg msg "$text" '{systemMessage: ("Dead-code check: " + $msg)}'
