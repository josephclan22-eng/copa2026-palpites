-- Delete test users from auth and public tables
-- Cole no SQL Editor e execute

DELETE FROM public.predictions
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%teste%'
);

DELETE FROM public.profiles
WHERE email LIKE '%teste%';

DELETE FROM auth.users
WHERE email LIKE '%teste%';
