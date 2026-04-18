import {
  type DescMessage,
  fromJson,
  type JsonValue,
  type MessageShape,
  toJson,
} from "@bufbuild/protobuf";

/**
 * Canonical proto-JSON encoding for JSONB storage.
 *
 * `enumAsInteger: true` makes enums round-trip as numeric wire values
 * (`1`, `2`, …) instead of their string names (`"ACTION_STATUS_NOT_STARTED"`).
 * Numeric storage is compact, stable under proto renames (only the enum
 * *value* is part of the wire contract, not the constant's spelling), and
 * matches what a future Go service would write via `protojson.Marshal` with
 * the same option.
 *
 * `fromProtoJson` is symmetric for convenience; the default `fromJson` reader
 * already accepts both numeric and string enum values, so data written in the
 * older string-encoded form still decodes cleanly.
 */
export const toProtoJson = <D extends DescMessage>(
  schema: D,
  message: MessageShape<D>,
): JsonValue => toJson(schema, message, { enumAsInteger: true });

export const fromProtoJson = <D extends DescMessage>(
  schema: D,
  data: JsonValue,
): MessageShape<D> => fromJson(schema, data);
