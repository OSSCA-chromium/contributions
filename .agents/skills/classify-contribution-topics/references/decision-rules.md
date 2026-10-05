# Topic decision rules

## Primary purpose

Choose the purpose explained by the contribution's problem and solution,
not the number of files changed. A production fix with regression tests
keeps its production purpose. A follow-up whose sole purpose is coverage,
test migration, baselines or test infrastructure belongs to `tests`,
including independent WPT test contributions. An API or unsafe buffer
modernization can still belong to `modernization` when performed inside
test code. A documentation-only change belongs to `docs`, even when it
describes an API migration.

Use review status only to describe the record's outcome. An Abandoned
proposal still has an intended purpose; do not present its intent as an
implemented or verified improvement.

## Parent boundaries

| Competing topics | Decision |
| --- | --- |
| `retirement` / `modernization` | Removing an expired feature or unused implementation is retirement. Replacing callers with a supported API, changing types, or consolidating an implementation is modernization. Removing obsolete overloads as part of API simplification uses `modernization/shared-deprecated-api`. |
| `behavior` / `reliability` | A change whose primary justification is a specification, language rule, Web API contract or debugger protocol uses behavior. Failure handling, cancellation, permissions, isolation and resource lifetimes use reliability. |
| `behavior` / `experience` | An externally defined engine/protocol contract uses behavior. Browser interaction, visual output and visibility decisions without that primary contract use experience. |
| `modernization` / `tests` | Production Lit migration uses modernization. Baseline updates, temporary disabling, reactivation and migration of tests use tests when they are the main change. |
| `docs` / runtime topics | A Markdown link repair uses docs. Parsing a runtime HTTP `Link` header uses behavior; the shared word "link" does not determine the topic. |

## Subtopic boundaries

| Case | Decision and representative record |
| --- | --- |
| Standard algorithms remove unsafe buffer access | Use `modernization/types-buffers` when memory access is the primary purpose, even if C++ standard algorithms implement it (`8343748`). |
| File type tracking within a watcher | Use `reliability/file-watchers` for historical path types and move notifications (`8403805`); use `file-properties` for preserving file names, MIME types or creation permissions. |
| Errors after a context is destroyed | Explaining the failure uses `reliability/error-diagnostics` (`8434601`); changing cancellation or object lifetime uses `async-lifetimes`. |
| Cache deletion considers open handles | Choose `reliability/cache-quota-data` when origin data deletion is the main operation (`8484715`), rather than classifying by an incidental lifetime constraint. |
| Documentation link now points to a renamed or moved target | Use `docs/moved-replaced-targets`. A wrong relative base or directory depth uses `link-paths`; a URL scheme, duplicate slash, source-view URL or image link uses `url-resources`. |
| Documentation removes a dead reference | Use `docs/obsolete-references` when no replacement exists. When the change also explains the current tool or implementation, use `developer-guidance` (`8146040`). |
| A replacement example also repairs a filename | Use the dominant purpose, replacing the invalid reference, as `docs/moved-replaced-targets` (`8146340`). |
| A record only says "fix link path" | `docs/link-paths` is sufficient (`6508550`). Do not infer an unrecorded root cause such as directory depth. |

These records illustrate the boundaries; they are not a permanent ID-to-topic
map. Read current evidence when a record changes. Resolve ties using the
stated problem and intended effect, and include a short rationale. If
evidence still supports multiple equally plausible purposes, leave the
record unclassified and state what information is missing.

## Taxonomy changes

The catalog's IDs are stable; counts and record memberships are computed
per run. Its descriptions define purposes, with examples from the archive,
and do not require an exact title or filename match.

When a new purpose does not fit, include a suggested parent/subtopic and
the affected record IDs in `taxonomyProposals`. Explain how it differs
from its nearest existing category. Do not split a small group just to
make all counts similar or create one subtopic per component. Update the
skill's taxonomy only when the user requests that revision.

## Report contract

Write one JSON object containing:

| Field | Content |
| --- | --- |
| `status` | `proposal-only` |
| `taxonomyVersion` | Version from `topic-taxonomy.json` |
| `sourceRevision` / `worktreeDirty` | Current Git HEAD and whether source records differ from it, including modified, deleted or untracked records |
| `scope` | Included sources and any requested filters |
| `recordCount` | Number of records in that scope |
| `hierarchy` | All catalog parents and children, with IDs, labels and recomputed counts, including zero counts |
| `entries` | Classified records, each with `id`, `title`, `topic`, `subtopic`, `rationale` and `evidence` |
| `unclassified` | Unresolved records, each with `id`, `title`, reason and relevant competing topics or missing evidence |
| `taxonomyProposals` | Suggested catalog changes with rationale and affected IDs; empty when none |

`evidence` identifies the repository file and section supporting the
decision, or a verified source URL if external context was necessary.
An illustrative classified entry is:

```json
{
  "id": "8343748",
  "title": "Fix unsafe buffer usage in GamepadStructTraitsTest",
  "topic": "modernization",
  "subtopic": "types-buffers",
  "rationale": "주된 목적이 unsafe buffer 제거이고 표준 알고리즘은 구현 수단이다.",
  "evidence": ["data/contributions/8343748.md: 문제 설명 / 해결 내용"]
}
```

Before reporting, check:

- Each in-scope ID appears exactly once in `entries` or `unclassified`.
- Every assigned parent/subtopic pair exists in the catalog.
- Child counts sum to their parent; all parent counts sum to
  `entries.length`; classified plus unclassified equals `recordCount`.
- Contribution Markdown and `template.md` remain unchanged.

Summarize the parent/subtopic distribution and link the report. Include
unclassified records and proposed changes so a complete count does not
conceal unresolved decisions. Report external source checks only when
they were actually performed.
