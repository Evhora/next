-- ---------- Tables ----------
CREATE TABLE IF NOT EXISTS sentences (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_used_at TIMESTAMPTZ,
  data         JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS dreams (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data       JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS dreams_user_active_idx
  ON dreams (user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS dreams_user_status_idx
  ON dreams (user_id, (data->>'status')) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS dreams_user_area_idx
  ON dreams (user_id, (data->>'areaOfLife')) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS actions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dream_id         UUID REFERENCES dreams(id) ON DELETE SET NULL,
  parent_action_id UUID REFERENCES actions(id) ON DELETE SET NULL,
  data             JSONB NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS actions_user_active_idx
  ON actions (user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS actions_user_dream_idx
  ON actions (user_id, dream_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS actions_user_status_idx
  ON actions (user_id, (data->>'status')) WHERE deleted_at IS NULL;

-- ---------- Row Level Security ----------
ALTER TABLE dreams    ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dreams_owner ON dreams;
CREATE POLICY dreams_owner ON dreams
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS actions_owner ON actions;
CREATE POLICY actions_owner ON actions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS sentences_read ON sentences;
CREATE POLICY sentences_read ON sentences
  FOR SELECT
  USING (auth.role() = 'authenticated');
