-- Discovery sessions table
CREATE TABLE IF NOT EXISTS discovery_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  version BIGINT NOT NULL DEFAULT 1,
  data JSONB NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX discovery_sessions_user_status_idx
  ON discovery_sessions (user_id, status);

CREATE INDEX discovery_sessions_user_started_idx
  ON discovery_sessions (user_id, started_at DESC);

ALTER TABLE discovery_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own discovery sessions"
  ON discovery_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('discovery-audio', 'discovery-audio', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can manage their own audio"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'discovery-audio' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'discovery-audio' AND auth.uid()::text = (storage.foldername(name))[1]);
