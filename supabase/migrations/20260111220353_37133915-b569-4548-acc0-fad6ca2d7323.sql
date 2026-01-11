-- Create pending_invitations table to store form data until user accepts invite
CREATE TABLE public.pending_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  public_role public_role NOT NULL DEFAULT 'alumni',
  phone text,
  state text,
  organization text,
  current_projects text,
  duties_and_responsibilities text,
  biography text,
  linkedin text,
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;

-- Only admins can manage invitations
CREATE POLICY "Admins can manage invitations"
ON public.pending_invitations
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Update handle_new_user to check for pending invitations
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
    -- Create profile from invitation data
    INSERT INTO public.profiles (
      id, full_name, email, public_role, phone, state, organization,
      current_projects, duties_and_responsibilities, biography, linkedin
    )
    VALUES (
      NEW.id,
      pending_invite.full_name,
      NEW.email,
      pending_invite.public_role,
      pending_invite.phone,
      pending_invite.state,
      pending_invite.organization,
      pending_invite.current_projects,
      pending_invite.duties_and_responsibilities,
      pending_invite.biography,
      pending_invite.linkedin
    );
    
    -- Delete the used invitation
    DELETE FROM public.pending_invitations WHERE id = pending_invite.id;
  ELSE
    -- Default profile creation for regular signups
    INSERT INTO public.profiles (id, full_name, email, public_role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New Member'),
      NEW.email,
      COALESCE((NEW.raw_user_meta_data ->> 'public_role')::public_role, 'alumni')
    );
  END IF;
  
  -- Create member role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$function$;