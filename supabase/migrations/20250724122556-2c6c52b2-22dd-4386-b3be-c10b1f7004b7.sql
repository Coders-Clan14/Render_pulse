-- Fix the function search path issue
CREATE OR REPLACE FUNCTION public.set_expires_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.expires_at = NEW.created_at + (NEW.duration * INTERVAL '1 minute');
  RETURN NEW;
END;
$$;