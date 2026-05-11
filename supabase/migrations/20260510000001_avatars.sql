-- Create the avatars storage bucket (public read, user-owned writes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Users can upload/replace their own avatar (path must start with their uid)
DROP POLICY IF EXISTS "avatars_insert_owner" ON storage.objects;
CREATE POLICY "avatars_insert_owner" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_update_owner" ON storage.objects;
CREATE POLICY "avatars_update_owner" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_delete_owner" ON storage.objects;
CREATE POLICY "avatars_delete_owner" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read (bucket is already public, but explicit policy for clarity)
DROP POLICY IF EXISTS "avatars_read_public" ON storage.objects;
CREATE POLICY "avatars_read_public" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');
