# Generic Row Grammar Receipt

```text
Grammar: Row
Owner: src/components/ui/row.tsx

Row
  ProviderMark                  <- media.iconName
  RowPrimary
    Title                       <- title
    Description?                <- description
  Trailing?                     <- metadata | action
```

## Inputs

| Input | Meaning | Visual consequence |
| --- | --- | --- |
| `media.iconName` | Provider identity | Resolves controlled provider media through the product asset owner. |
| `title` | Primary identity | Renders the primary line. |
| `description?` | Supporting information | Adds the second line and derives the detailed internal geometry. |
| `metadata?` | Trailing display information | Renders the non-interactive trailing role. |
| `action?` | Trailing semantic action | Renders the action as a sibling of the primary region. |
| `tone?` | Default or attention meaning | Determines attention presentation. |
| `primaryAction?` | Primary-region interaction | Makes only provider media and content interactive. |

## Invariants

- Same title, trailing geometry, internal gap, focus treatment, and DOM slots.
- The consumer cannot pass `size`, `className`, density, or icon dimensions.
- Primary-region and trailing actions remain sibling interaction targets.
- `metadata` and `action` are mutually exclusive.

The only compact-to-detailed cause is `description` presence. Do not add a
parallel compact component or public size variant. Feature adapters map their
own product states into this grammar; those states do not belong in the generic
row component.

# Route Bootstrap Fixture

The skill includes a synthetic React fixture. Supply a package in the adopting
repository that already provides TypeScript:

```sh
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs bootstrap \
  .agents/skills/ui-grammar/examples/bootstrap/src/route.tsx \
  --package-json <owning-react-package/package.json>
```

The traversal reaches `SyntheticRoute -> LocalPanel` and reports the imported
design-system `Button` as an external boundary. This is the intended result:
bootstrap provides deterministic orientation and names what it cannot follow;
it does not infer semantic rules or pretend to understand the surface.

# Repository Registry

Keep product grammars and requests outside the skill. A repository can index
them with a small JSON registry:

```json
{
  "version": 1,
  "repositoryRoot": "..",
  "evidenceTargets": {
    "visual-catalog": {
      "source": "tooling/catalog/registry.ts",
      "ownerAnchorTemplate": "id: \"{{id}}\"",
      "ownerCommandTemplate": "npm run catalog -- --surface {{id}}",
      "caseCommandTemplate": "npm run catalog -- --only {{id}}"
    }
  },
  "flows": [
    {
      "id": "account.profile",
      "entry": {
        "file": "src/routes/profile.tsx",
        "export": "default",
        "packageJson": "package.json"
      },
      "grammar": "ui-grammar/flows/account/profile/grammar.json",
      "renderEvidence": {
        "target": "visual-catalog",
        "ownerId": "profile"
      },
      "cases": [
        {
          "id": "complete",
          "request": "ui-grammar/flows/account/profile/requests/complete.json",
          "renderEvidenceIds": ["profile.complete"]
        }
      ]
    }
  ]
}
```

The evidence bridge is optional. Its source path, anchor, IDs, and commands are
repository configuration, never skill defaults.

```sh
node .agents/skills/ui-grammar/scripts/ui-grammar-registry.mjs \
  list ui-grammar/registry.json
node .agents/skills/ui-grammar/scripts/ui-grammar-registry.mjs \
  inspect ui-grammar/registry.json account.profile
node .agents/skills/ui-grammar/scripts/ui-grammar-registry.mjs \
  check ui-grammar/registry.json
```
