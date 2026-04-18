import { type Sentence, SentenceSchema } from "@/modules/dashboard/proto/v1/sentence_pb";

/**
 * Domain surface for the Sentences bounded context. The entity is read-only
 * from the app's perspective — sentences are seeded and rotated server-side —
 * so there are no factory or mutator functions here.
 */

export type { Sentence };
export { SentenceSchema };
