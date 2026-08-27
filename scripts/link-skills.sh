#!/usr/bin/env bash
set -euo pipefail

# Maintainer-only local skill setup.
#
# This repository owns authored skill bodies. ~/.agents/skills is the canonical
# local registry for authored and external skills. Claude, Codex, and Cursor
# receive per-skill links to that registry.

REPO="$(cd "$(dirname "$0")/.." && pwd)"
REGISTRY="$HOME/.agents/skills"
DESTS=(
  "$HOME/.claude/skills"
  "$HOME/.codex/skills"
  "$HOME/.cursor/skills"
)

names=()
srcs=()
while IFS= read -r -d '' skill_md; do
  src="$(dirname "$skill_md")"
  names+=("$(basename "$src")")
  srcs+=("$src")
done < <(find "$REPO" -mindepth 2 -maxdepth 2 -name SKILL.md -not -path '*/node_modules/*' -print0)

# Validate every runtime root before changing the canonical registry.
# A bad root should not leave a partially updated registry behind.
for DEST in "${DESTS[@]}"; do
  if [ -L "$DEST" ]; then
    echo "error: runtime skills directory must be a real directory: $DEST" >&2
    exit 1
  fi

  if [ -e "$DEST" ] && [ ! -d "$DEST" ]; then
    echo "error: runtime skills path must be a directory: $DEST" >&2
    exit 1
  fi
done

if [ -e "$REGISTRY" ] && [ ! -d "$REGISTRY" ]; then
  echo "error: canonical registry must be a directory: $REGISTRY" >&2
  exit 1
fi

# Refuse conflicts before creating links. Existing registry skills must be
# considered too: they are fanned out alongside the authored skills.
preflight_names=("${names[@]}")
has_conflict=0
if [ -d "$REGISTRY" ]; then
  while IFS= read -r -d '' registry_entry; do
    registry_name="$(basename "$registry_entry")"

    if [ -L "$registry_entry" ] && [ ! -e "$registry_entry" ]; then
      link_target="$(readlink "$registry_entry")"
      case "$link_target" in
        "$REPO"/*) ;;
        *)
          echo "error: unresolved external registry link: $registry_entry -> $link_target" >&2
          has_conflict=1
          ;;
      esac
    fi

    already_listed=0
    for preflight_name in "${preflight_names[@]}"; do
      if [ "$preflight_name" = "$registry_name" ]; then
        already_listed=1
        break
      fi
    done

    if [ "$already_listed" -eq 0 ]; then
      preflight_names+=("$registry_name")
    fi
  done < <(find "$REGISTRY" -mindepth 1 -maxdepth 1 \( -type d -o -type l \) -print0)
fi

for name in "${names[@]}"; do
  target="$REGISTRY/$name"
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    echo "conflict: preserving registry-owned entry: $target" >&2
    has_conflict=1
  fi
done

for DEST in "${DESTS[@]}"; do
  for name in "${preflight_names[@]}"; do
    target="$DEST/$name"
    if [ -e "$target" ] && [ ! -L "$target" ]; then
      echo "conflict: preserving runtime-owned entry: $target" >&2
      has_conflict=1
    fi
  done
done

if [ "$has_conflict" -ne 0 ]; then
  exit 1
fi

for DEST in "${DESTS[@]}"; do
  mkdir -p "$DEST"
done

mkdir -p "$REGISTRY"

# Link authored sources into the canonical registry.
for i in "${!names[@]}"; do
  name="${names[$i]}"
  src="${srcs[$i]}"
  target="$REGISTRY/$name"

  ln -sfn "$src" "$target"
  echo "registered $name -> $src"
done

# Fan out the complete canonical registry, including external skills.
registry_names=()
while IFS= read -r -d '' registry_entry; do
  if [ -L "$registry_entry" ] && [ ! -e "$registry_entry" ]; then
    echo "skipping unresolved registry link: $registry_entry" >&2
    continue
  fi

  registry_names+=("$(basename "$registry_entry")")
done < <(find "$REGISTRY" -mindepth 1 -maxdepth 1 \( -type d -o -type l \) -print0)

for DEST in "${DESTS[@]}"; do
  for name in "${registry_names[@]}"; do
    target="$DEST/$name"

    ln -sfn "$REGISTRY/$name" "$target"
    echo "linked $name -> $REGISTRY/$name ($DEST)"
  done
done

"$REPO/scripts/check-links.sh"
