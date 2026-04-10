import { DreamAreaOfLife } from "./DreamAreaOfLife";
import { DreamStatus } from "./DreamStatus";

/**
 * Snapshot of all fields a Dream carries. Use cases pass these props around as
 * plain objects when serialization matters (server → client component); the
 * Dream class wraps them when behavior matters.
 */
export interface DreamProps {
  id: string;
  userId: string;
  status: DreamStatus;
  areaOfLife: DreamAreaOfLife;
  title: string;
  deadline: string; // ISO date (YYYY-MM-DD)
  actionPlan: string;
  version: number;
  sequence: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface NewDreamInput {
  title: string;
  areaOfLife: DreamAreaOfLife;
  deadline: string;
  actionPlan: string;
}

/**
 * Aggregate root for the Dreams bounded context. The constructor is private:
 * callers go through `Dream.create()` (new dream from user input) or
 * `Dream.rehydrate()` (load from the database via the mapper).
 *
 * Mutations return *new* instances rather than mutating in place. This keeps
 * `props` safely shareable to client components without copy-on-pass and makes
 * version-bumping explicit at the call site.
 */
export class Dream {
  private constructor(readonly props: DreamProps) {}

  static create(input: NewDreamInput, userId: string): Dream {
    const now = new Date().toISOString();
    return new Dream({
      id: crypto.randomUUID(),
      userId,
      status: DreamStatus.IN_PROGRESS,
      areaOfLife: input.areaOfLife,
      title: input.title.trim(),
      deadline: input.deadline,
      actionPlan: input.actionPlan.trim(),
      version: 1,
      sequence: 0, // assigned by the database via BIGSERIAL
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static rehydrate(props: DreamProps): Dream {
    return new Dream(props);
  }

  withStatus(next: DreamStatus): Dream {
    return new Dream({
      ...this.props,
      status: next,
      version: this.props.version + 1,
      updatedAt: new Date().toISOString(),
    });
  }

  softDelete(): Dream {
    const now = new Date().toISOString();
    return new Dream({
      ...this.props,
      version: this.props.version + 1,
      updatedAt: now,
      deletedAt: now,
    });
  }
}
