# The gap was not spacing

## A UI Grammar case study in action-owned feedback

The visible problem looked trivial: an error message sat too far below a button in a sign-in card. Changing the margin would have made the screenshot quieter. It would not have fixed the model that produced the mistake.

UI Grammar made the stronger diagnosis possible. The interface was not a vertical list of controls with arbitrary gaps. It was a sequence of meaning:

```text
Code access step
├─ Instruction: enter the code sent to this email
└─ Submission
   ├─ Verification-code input
   ├─ Verify-code action
   └─ Submission feedback
      ├─ Failure: the submitted code did not work
      └─ Recovery: use a different email
```

Once the relationship was named, the layout followed. The submission error belonged after the action that produced it. The recovery link belonged inside the feedback sentence because it was a subordinate way out of that failure, not a second primary action.

This was not merely a better explanation of the pixels. It changed the component boundaries, spacing ownership, copy, and design-system vocabulary.

## What went wrong

The first composition treated the server-rejected code like ordinary field validation. The error sat with the input, while the “Verify code” button and “Use a different email” action read as separate rows.

That topology blurred two different failures:

- A **field validation error** says the current value does not satisfy the field's local requirements. It belongs with the field.
- A **submission failure** says the attempted action completed unsuccessfully. It belongs with the action result, even when the field also receives an invalid visual state.

The rejected verification code was the second kind. The user entered a structurally valid six-digit code, invoked “Verify code,” and received a result. Keeping the red input treatment was useful, but it did not make the explanatory message field-owned.

The original layout therefore generated false spacing questions. If the error is considered part of the field, the button appears to interrupt the field. If it is considered an unrelated row, every gap becomes an isolated aesthetic choice. In the correct grammar, the button is the causal pivot and the following message is its result.

## The corrected relationship

The accepted sequence became:

```text
verification input → Verify code → submission error and recovery
```

Three different gaps now have different jobs:

1. The instruction and input form the tightest reading unit.
2. The completed input unit and primary action have ordinary action spacing.
3. The primary action and its result stay close enough to read as one interaction episode.

The exact token remains a visual-system decision. The important rule is that the third gap expresses cause and result. It must not accidentally inherit the spacing of two independent controls.

The card description also became the instruction: “Enter the verification code sent to …”. A second visible input label would repeat that job. The input retained an accessible label for assistive technology, but the visual hierarchy no longer said the same thing twice.

The resulting sentence was deliberately legible prose:

> That code didn’t work. Check it and try again. Or use a different email.

Only “use a different email” is interactive. Keeping it inline preserves the recovery as part of the error's meaning and avoids inventing another button row.

## The second discovery: a missing primitive

Making that recovery action inline initially required a long call-site override that removed fixed height, minimum height, padding, and control typography from the shared Button component. That solved the specimen but exposed another ownership error: a consumer was reconstructing a reusable kind of button.

UI Grammar's value here was not “replace utilities with a variant” in the abstract. It named the missing relationship: this is still a Button action, but its geometry must participate in a line of text rather than occupy a control row.

That relationship became semantic component vocabulary:

```tsx
<Button variant="link" size="inline">
  use a different email
</Button>
```

`variant="link"` owns how the action looks. `size="inline"` owns its participation in surrounding text: no fixed control height, no minimum height, no horizontal padding, inherited text color, and baseline alignment. The Login callers retain only contextual treatment that the surrounding sentence owns.

The important promotion was the relationship, not the accidental utility string from the first repair.

## Why UI Grammar helped

UI Grammar turned “this spacing feels wrong” into claims that could be checked:

- What event produced the message?
- Which element owns that event?
- Is the message validation, action feedback, or an independent status?
- Is the recovery primary, secondary, or grammatically part of the feedback?
- Which geometry belongs to the feature composition, and which belongs to the shared primitive?

That sequence prevented two weak fixes: tuning a margin around the wrong topology and leaving a reusable inline-action recipe trapped in one consumer.

This is a strong case for UI Grammar as a design-engineering method because the grammar was predictive. Once the causal relation was stated, it predicted the JSX order, visual grouping, copy structure, accessibility treatment, and missing design-system capability. Eyeballing was still necessary to accept the rendered rhythm; it was no longer responsible for discovering the conceptual model.

## Where the lesson stops

This case does not establish that every error belongs after a CTA.

- A malformed email or incomplete code is field validation and should remain with the field.
- A page-level outage may belong to the page or flow status rather than one action.
- A recovery with equal product importance may deserve its own secondary button instead of an inline link.
- A flow-specific spacing relation does not automatically become a design-system layout primitive.
- A useful change found in a consumer is evidence for comparison with a master kit, not permission to synchronize repositories blindly.

The portable method is to identify the causal relation, give it one owner, and promote only the reusable semantic contract. Code and the rendered interface remain the source of truth.

## Knowledge belongs at the lowest authoritative owner

“Put the learning at the lowest level” does not mean forcing every lesson into one repository. It means moving each claim down to the narrowest owner that can make it available without distortion:

- The Button's inline behavior belongs in the Button variant recipe because code can make that contract real.
- The reasoning method belongs in UI Grammar because it must be callable across projects.
- The decision to compare a consumer improvement with a master kit belongs in a cross-project promotion playbook because it requires judgment and permission.
- A short conditional pointer belongs in ambient agent instructions because agents need to discover that playbook at the moment the trigger occurs.

This is point-and-call rather than copy-and-maintain. Repositories retain their own implementation truth. Shared knowledge lives once, while small local or global pointers load it just in time. Context is not eliminated; it is routed.

## Reusable test

When spacing around feedback feels inexplicably wrong:

1. Write the interaction as `input → action → result → recovery`.
2. Classify the result as field validation, action feedback, flow status, or page status.
3. Make the JSX order and visual grouping express that classification.
4. Remove consumer geometry that reconstructs a reusable component relation.
5. Render the changed and unchanged states; source structure cannot prove visual rhythm.

## Provenance and evidence status

This case came from the Vana Account Login code-entry error states in `vana-com/unity-surfaces` on 15 September 2026. The source owners were the live Account Login view, its UI workshop concept, Unity Design's `buttonVariants`, and the canonical `ds-kit` button recipe. The product owner accepted the corrected post-action spacing by visual review. The shared `size="inline"` contract passed focused formatting, lint, and typechecks in both repositories.

The case demonstrates one successful application. It supports continued use and research; it does not by itself prove that UI Grammar improves unrelated interface work.
