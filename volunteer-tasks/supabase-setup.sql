-- ============================================
-- VOLUNTEER TASK MANAGER - Supabase Setup
-- Rulează acest script în Supabase SQL Editor
-- ============================================

-- 1. Tabela de profiluri (utilizatori)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'volunteer' CHECK (role IN ('admin', 'volunteer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de taskuri
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_number SERIAL,
  description TEXT NOT NULL,
  link TEXT DEFAULT '',
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'in_lucru' CHECK (status IN ('in_lucru', 'terminata')),
  observations TEXT DEFAULT '',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Activează Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 4. Politici pentru profiles
-- Toți utilizatorii autentificați pot vedea toate profilurile (necesar pentru dropdown-uri)
CREATE POLICY "Profiles sunt vizibile pentru utilizatori autentificați"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Fiecare user își poate actualiza propriul profil
CREATE POLICY "Utilizatorii își pot actualiza propriul profil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Adminii pot șterge profiluri (kick member)
CREATE POLICY "Adminii pot șterge profiluri"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Oricine autentificat își poate crea profilul
CREATE POLICY "Utilizatorii își pot crea profilul"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 5. Politici pentru tasks
-- Adminii văd toate taskurile, voluntarii doar pe ale lor
CREATE POLICY "Vizibilitate taskuri"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doar adminii pot crea taskuri
CREATE POLICY "Adminii pot crea taskuri"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Adminii pot modifica orice task; voluntarii pot modifica doar statusul și observațiile propriilor taskuri
CREATE POLICY "Modificare taskuri"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doar adminii pot șterge taskuri
CREATE POLICY "Adminii pot șterge taskuri"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Funcție pentru a actualiza updated_at automat
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 7. Funcție pentru a crea profilul automat la signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'volunteer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 8. Activează Realtime pentru ambele tabele
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
