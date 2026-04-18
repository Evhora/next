#!/usr/bin/env bash
set -euo pipefail

# Generated TypeScript is emitted directly into `src/`, which mirrors the buf
# module root (see buf.yaml). Every .proto at `src/modules/<ctx>/proto/v1/`
# produces its `*_pb.ts` next to it, and cross-module imports (e.g. action.proto
# referencing a dream enum) resolve via the shared `src/` root.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[proto-gen] -> src/"
pnpm exec buf generate --output src
