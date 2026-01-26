CREATE TABLE IF NOT EXISTS sentences (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_used_at TIMESTAMPTZ,
  version      BIGINT NOT NULL,
  data         JSONB NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS dreams (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status            SMALLINT NOT NULL,
  status_name       TEXT NOT NULL,
  area_of_life      TEXT NOT NULL,
  area_of_life_name TEXT NOT NULL,
  version           BIGINT NOT NULL,
  sequence          BIGSERIAL,
  data              JSONB NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS actions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dream_id         UUID REFERENCES dreams(id) ON DELETE SET NULL,
  parent_action_id UUID REFERENCES actions(id) ON DELETE SET NULL,
  status           SMALLINT NOT NULL,
  status_name      TEXT NOT NULL,
  version          BIGINT NOT NULL,
  sequence         BIGSERIAL,
  data             JSONB NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ DEFAULT NULL
);
