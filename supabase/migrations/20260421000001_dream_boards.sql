-- ---------- Tables ----------
CREATE TABLE IF NOT EXISTS dream_boards (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data       JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS dream_boards_user_active_idx
  ON dream_boards (user_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS dream_boards_user_created_idx
  ON dream_boards (user_id, created_at);

CREATE TABLE IF NOT EXISTS dream_board_conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS dream_board_conversations_user_created_idx
  ON dream_board_conversations (user_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS dream_board_conversations_one_active_per_user_idx
  ON dream_board_conversations (user_id)
  WHERE archived_at IS NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS user_photos (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data       JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- Row Level Security ----------
ALTER TABLE dream_boards              ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_board_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_photos               ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dream_boards_owner ON dream_boards;
CREATE POLICY dream_boards_owner ON dream_boards
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS dream_board_conversations_owner ON dream_board_conversations;
CREATE POLICY dream_board_conversations_owner ON dream_board_conversations
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS user_photos_owner ON user_photos;
CREATE POLICY user_photos_owner ON user_photos
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------- Storage buckets ----------
INSERT INTO storage.buckets (id, name, public)
VALUES ('dream-boards', 'dream-boards', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', FALSE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS dream_boards_storage_rw ON storage.objects;
CREATE POLICY dream_boards_storage_rw ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'dream-boards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'dream-boards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS user_photos_storage_rw ON storage.objects;
CREATE POLICY user_photos_storage_rw ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'user-photos'
    AND auth.uid()::text = split_part(name, '.', 1)
  )
  WITH CHECK (
    bucket_id = 'user-photos'
    AND auth.uid()::text = split_part(name, '.', 1)
  );
