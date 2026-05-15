Scope and language

v1 targets Japanese only. Language-agnostic is deferred — the problems (tokenization, lemmatization, grammar taxonomy, card conventions) vary too much across languages to solve generically up front.
The architecture should be extensible to other languages later, but no upfront cost paid for that.

Two sources of "things the user knows"

Curated lists (primary): vocab and grammar, organized by level (JLPT N5–N1 as the default taxonomy). You control the data — lemmatized, vetted, paired across vocab and grammar.
Imported vocab (secondary, later): user brings their own vocabulary from external sources, first of which is Anki. Stored as-is; no lemmatization. Acts as expansion vocabulary for the generator.

Two distinct flows, sharing one engine

Main flow: curated syllabus → sentence generation targets items the user is learning → translation → evaluation → performance tracking feeds back into future generation.
Imported-vocab practice mode: standalone, uses the user's imported vocab list → generates sentences → evaluates translations → no performance tracking, no syllabus. Probably still needs session state (don't repeat sentences, vary word selection) but no long-term memory.

Performance tracking (the thing that isn't quite SRS)

Past translation attempts should inform future sentence generation. Details to be planned later.
Only applies to curated items. Imported vocab is not tracked.

Evaluation

LLM-based.
Returns structured output, not prose.
Receives the sentence plus the list of vocab and grammar items it was generated from — so it can localize errors against a known taxonomy.
Attributes errors per-item with confidence scores; low-confidence attributions can fall back to whole-sentence scoring.

Grammar specifics

Curated only — no user-added grammar points. Vocab is atomic enough for users to add; grammar is structured and definitional, requiring curation effort users won't reliably do.
Has prerequisite structure (approximated by JLPT levels in v1).
Generation must deliberately target a specific grammar point; verification that the generated sentence actually used it may be needed.
Error localization for grammar is fuzzier than vocab; expect to refine this.

Lemmatization

Avoided. Curated lists are already lemmas by construction. Imported vocab isn't lemmatized because it isn't tracked, so it doesn't need to be.
The LLM bridges the gap between stored forms and surface forms during generation and evaluation.

Sequencing

Curated-only main flow with performance tracking. Validates the core loop.
Imported-vocab practice mode (Anki first). Validates the import integration in isolation.
Possibly later: combining imported vocab with tracking, if real demand emerges.
