---
name: classify-contribution-topics
description: Use when grouping this contribution archive by work purpose, proposing topic labels, or refining 대주제 and 하위 주제 classifications. Routine status/date updates and module/kind maintenance use sync-contributions instead.
---

# Classify contribution topics

Classify contributions by the purpose of the work using the project's
seven parent topics and 35 subtopics. `module` identifies the code area;
`kind` identifies the form of the change; topic and subtopic identify why
the work was done. They are separate axes.

## Sources and scope

Work from the repository root. Read
[the taxonomy](references/topic-taxonomy.json) before assigning topics.
Use [the decision rules and report contract](references/decision-rules.md)
for competing purposes, ambiguous records and the final report.

Inventory the current `data/contributions/*.md`, excluding `template.md`.
Use each filename stem as its record ID. Read the title and explanation
of the problem, changes and review context. For ambiguous records, read
the complete body; filenames, `module`, `kind` and changed paths alone
do not establish the purpose. Reuse existing source reports when useful.
If evidence is insufficient, report the gap rather than invent intent.

Include every archived record and status unless the user narrows the
scope. Related CLs and resubmissions remain separate records. This is an
archive distribution, not a count of unique changes or successful merges.
Recompute counts from the current inventory; previous proposal files
are context, not the source of truth for current coverage.

## Classification

- Assign one primary parent topic and one of its subtopics per record.
- Use the intended effect to distinguish implementation changes from
  accompanying tests, documentation and incidental cleanup.
- Keep stable taxonomy IDs; use the Korean labels in user-facing tables.
- When refining an existing proposal's subtopics, preserve its parent
  assignments unless the user asks to review them. Report a conflicting
  parent assignment as a review question with evidence.
- Put unsupported decisions in `unclassified` with a reason. For a clear
  purpose outside the catalog, propose a taxonomy extension separately
  instead of forcing a match or creating a catch-all group.

## Deliverable and write boundary

The default deliverable is a **proposal-only** JSON report under
`.cache/contribution-sync/topics-hierarchy-proposal.json` and a concise
summary of parent/subtopic counts and unresolved decisions. Follow the
report contract in the decision rules and state the source revision.

Keep contribution Markdown, `template.md`, maintenance state and site
code unchanged during classification. Topic adoption into frontmatter
or the UI requires a separate explicit request and a defined data
contract. Do not send topic decisions to the maintenance command's
`--classification-file`; that input accepts only `module` and `kind`.

Check coverage, unique record IDs, valid parent/subtopic pairs and totals
against the actual inventory before reporting the result. Distinguish
reviewed evidence from uncertain assumptions.

Example invocation:

```text
$classify-contribution-topics 현재 기여 내역을 대주제와 하위 주제로 분류해줘. MD에는 반영하지 마.
```
