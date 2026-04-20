-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TYPE public.health_status AS ENUM ('Good','Monitor','Attention');

CREATE TABLE public.trees (
  id text PRIMARY KEY,
  line text NOT NULL,
  position int NOT NULL,
  line_position text NOT NULL,
  variety text NOT NULL DEFAULT 'Tom JC',
  planting_date date NOT NULL DEFAULT '2025-08-28',
  health_status health_status NOT NULL DEFAULT 'Good',
  height text,
  canopy_diameter text,
  last_fertilization date,
  last_pruning date,
  pest_observations text,
  flowering_date date,
  harvest_date date,
  actual_yield int,
  yield_expectation text NOT NULL DEFAULT '300 mangoes (500g–600g)',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view trees" ON public.trees FOR SELECT USING (true);
CREATE POLICY "Admins update trees" ON public.trees FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert trees" ON public.trees FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.tree_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id text NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  update_type text NOT NULL DEFAULT 'note',
  note text,
  photo_url text,
  photo_date date,
  metadata jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tree_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view updates" ON public.tree_updates FOR SELECT USING (true);
CREATE POLICY "Admins insert updates" ON public.tree_updates FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update updates" ON public.tree_updates FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete updates" ON public.tree_updates FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_tree_updates_tree ON public.tree_updates(tree_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trees_updated BEFORE UPDATE ON public.trees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO storage.buckets (id, name, public) VALUES ('tree-photos','tree-photos', true);
CREATE POLICY "Public read tree photos" ON storage.objects FOR SELECT USING (bucket_id = 'tree-photos');
CREATE POLICY "Admins upload tree photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tree-photos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update tree photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'tree-photos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete tree photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'tree-photos' AND public.has_role(auth.uid(),'admin'));

DO $$
DECLARE
  lines text[] := ARRAY['A1','A2','A3','A4','A5','A6','A7'];
  counts int[] := ARRAY[14,13,16,16,15,15,15];
  starts int[] := ARRAY[1501,1515,1528,1544,1560,1575,1590];
  i int; j int; tid text; ln text; pos int; lp text;
BEGIN
  FOR i IN 1..7 LOOP
    FOR j IN 1..counts[i] LOOP
      tid := 'RAMG-' || (starts[i] + j - 1)::text;
      ln := lines[i];
      pos := j;
      lp := ln || '-' || lpad(j::text, 2, '0');
      INSERT INTO public.trees (id, line, position, line_position) VALUES (tid, ln, pos, lp);
    END LOOP;
  END LOOP;
END $$;

UPDATE public.trees SET height = '1''9" (54cm)' WHERE id = 'RAMG-1501';
INSERT INTO public.tree_updates (tree_id, update_type, note, photo_date)
VALUES ('RAMG-1501', 'measurement', 'Initial documentation: height 1''9" (54cm). Tree healthy and establishing well.', '2026-02-05');