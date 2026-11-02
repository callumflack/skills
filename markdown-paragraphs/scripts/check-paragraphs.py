#!/usr/bin/env python3
"""Reject accidental source wrapping in ordinary Markdown prose."""
import argparse
import re
import sys
from pathlib import Path


def violations(text):
    fence = None
    frontmatter = False
    table = False
    previous = None
    for number, line in enumerate(text.splitlines(), 1):
        stripped = line.strip()
        if number == 1 and stripped == "---":
            frontmatter = True
            continue
        if frontmatter:
            if stripped == "---":
                frontmatter = False
            continue
        marker = re.match(r"^(`{3,}|~{3,})", stripped)
        if marker:
            if fence is None:
                fence = marker[1][0]
            elif marker[1][0] == fence:
                fence = None
            previous = None
            continue
        if fence:
            continue
        if stripped.startswith("<table"):
            table = True
        if table:
            if "</table>" in stripped:
                table = False
            previous = None
            continue
        if not stripped or re.match(r"^(#{1,6}\s|[>|]|<|---$|\*\*\*$)", stripped):
            previous = None
            continue
        item = bool(re.match(r"^([-+*] |\d+[.)] )", stripped))
        if not item and previous is not None:
            prior_number, prior_line = previous
            if not prior_line.endswith("  ") and not prior_line.endswith("\\"):
                yield number, prior_number
        previous = (number, line)


def structure(text):
    result = []
    fence = None
    for line in text.splitlines():
        marker = re.match(r"^\s*(`{3,}|~{3,})", line)
        if marker:
            fence = None if fence else marker[1][0]
            continue
        if fence:
            continue
        if re.match(r"^#{2,6}\s|^\s*([-+*] |\d+[.)] )", line):
            line = re.sub(r"\[([^\]]+)\]\((?:<[^>]+>|[^)]+)\)", r"\1", line)
            result.append(line.strip())
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reference", help="Compare headings and list items with the original source")
    parser.add_argument("files", nargs="+")
    args = parser.parse_args()
    failed = False
    for filename in args.files:
        if args.reference and structure(Path(filename).read_text()) != structure(Path(args.reference).read_text()):
            print(f"{filename}: headings or list items differ from {args.reference}; inspect block boundaries")
            failed = True
        for current, prior in violations(Path(filename).read_text()):
            print(f"{filename}:{current}: wrapped prose continues line {prior}; join the paragraph or separate blocks")
            failed = True
    sys.exit(1 if failed else 0)
