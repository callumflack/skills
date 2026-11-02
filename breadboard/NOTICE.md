# Source and local reuse

The viewer template, interaction module and upstream contract in `assets/unity/` are copied from `vana-com/unity-surfaces`, pull request #1957, revision `6e7d27377e98184629a54f4c779a7ed9d266e51e`. Their original paths and SHA-256 hashes are recorded in [provenance.json](references/provenance.json).

`scripts/renderer.mjs` derives the definition validation and rendering functions from that revision's `scripts/breadboards.mjs`. It omits Unity repository synchronization, changes the interaction import location and permits local source references through the portable entry point. The portable template adds story reading paths, direct check links and collapsible story details. The interaction module retains its original bytes.

Callum authorized this local reuse and cross-repository skill. The source repository has no root license covering these viewer files. This notice makes no public redistribution or license grant for the copied Unity material. Callum subsequently authorized publication of the skill in this repository on 2 November 2026. The copied material is not covered by this repository's default MIT license. The authored instructions and portable entry point are separate from that copied material.
