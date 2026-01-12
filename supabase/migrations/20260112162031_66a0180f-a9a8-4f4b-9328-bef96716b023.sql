-- Modify the handle_new_user function to NOT create profile for invited users
-- They will complete registration after setting their password
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  pending_invite pending_invitations%ROWTYPE;
BEGIN
  -- Check for pending invitation
  SELECT * INTO pending_invite 
  FROM public.pending_invitations 
  WHERE email = NEW.email;
  
  IF pending_invite.id IS NOT NULL THEN
    -- User was invited - DO NOT create profile yet
    -- Profile will be created when they complete registration (set password)
    -- Keep the pending invitation for now
    RETURN NEW;
  ELSE
    -- Default profile creation for regular signups (non-invited users)
    INSERT INTO public.profiles (id, full_name, email, public_role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New Member'),
      NEW.email,
      COALESCE((NEW.raw_user_meta_data ->> 'public_role')::public_role, 'alumni')
    );
    
    -- Create member role by default for non-invited users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'member');
  END IF;
  
  RETURN NEW;
END;
$function$;