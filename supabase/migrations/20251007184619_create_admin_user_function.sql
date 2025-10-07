/*
  # Create Admin Function for User Creation

  This function allows programmatic user creation with proper auth setup.
*/

-- Create a function to create users programmatically
CREATE OR REPLACE FUNCTION create_app_user(
  p_email text,
  p_password text,
  p_name text,
  p_role text,
  p_store_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Insert into users table (auth.users will be handled by Supabase Auth SDK)
  INSERT INTO users (email, name, role, store_id, is_active)
  VALUES (p_email, p_name, p_role, p_store_id, true)
  RETURNING id INTO v_user_id;
  
  RETURN v_user_id;
END;
$$;
