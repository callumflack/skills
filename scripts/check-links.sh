#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
REGISTRY="$HOME/.agents/skills"
LOCKFILE="$HOME/.agents/.skill-lock.json"
DESTS=(
  "$HOME/.claude/skills"
  "$HOME/.codex/skills"
  "$HOME/.cursor/skills"
)

fail() {
  echo "error: $1" >&2
  exit 1
}

owned_names=()
while IFS= read -r -d '' skill_md; do
  owned_names+=("$(basename "$(dirname "$skill_md")")")
done < <(find "$REPO" -mindepth 2 -maxdepth 2 -name SKILL.md -not -path '*/node_modules/*' -print0)

is_owned_name() {
  local candidate="$1"
  local owned_name

  for owned_name in "${owned_names[@]}"; do
    if [ "$owned_name" = "$candidate" ]; then
      return 0
    fi
  done

  return 1
}

[ -d "$REGISTRY" ] || fail "missing canonical registry: $REGISTRY"

for owned_name in "${owned_names[@]}"; do
  registry_entry="$REGISTRY/$owned_name"
  expected_source="$REPO/$owned_name"

  [ -L "$registry_entry" ] || fail "authored skill is not a symlink: $registry_entry"
  [ "$(readlink "$registry_entry")" = "$expected_source" ] || fail "wrong authored skill target: $registry_entry"
done

registry_names=()
while IFS= read -r -d '' registry_entry; do
  registry_name="$(basename "$registry_entry")"

  # Keep retired authored links out of the runtime fan-out. link-skills.sh
  # deliberately leaves these behind so deletion and rename do not make the
  # verifier fail.
  if [ -L "$registry_entry" ]; then
    link_target="$(readlink "$registry_entry")"
    case "$link_target" in
      "$REPO"/*)
        if ! is_owned_name "$registry_name"; then
          continue
        fi
        ;;
    esac
  fi

  [ -e "$registry_entry" ] || fail "unresolvable registry skill: $registry_entry"
  registry_names+=("$registry_name")
done < <(find "$REGISTRY" -mindepth 1 -maxdepth 1 \( -type d -o -type l \) -print0)

for destination in "${DESTS[@]}"; do
  [ ! -L "$destination" ] || fail "runtime skills directory must be a real directory: $destination"
  [ -d "$destination" ] || fail "missing runtime skills directory: $destination"

  for registry_name in "${registry_names[@]}"; do
    runtime_entry="$destination/$registry_name"
    expected_target="$REGISTRY/$registry_name"

    [ -L "$runtime_entry" ] || fail "runtime skill is not a symlink: $runtime_entry"
    [ "$(readlink "$runtime_entry")" = "$expected_target" ] || fail "wrong runtime skill target: $runtime_entry"
  done
done

if [ -f "$LOCKFILE" ]; then
  if grep -Fq '"source": "callumflack/skills"' "$LOCKFILE" || grep -Fq "$REPO" "$LOCKFILE"; then
    fail "authored skill is still managed by npx skills: $LOCKFILE"
  fi
fi

echo "ok: ${#owned_names[@]} authored skills; ${#registry_names[@]} registry skills; Claude, Codex, and Cursor link through ~/.agents/skills"
