-- COLE ISSO NO SQL EDITOR E EXECUTE

-- 1. Deleta trigger e funcao antigos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user;

-- 2. Recria a funcao (SEM erros)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    (SELECT COUNT(*) FROM public.profiles) = 0
  );
  RETURN NEW;
END;
$$;

-- 3. Recria o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. Teste: veja se o trigger existe
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
