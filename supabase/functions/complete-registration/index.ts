import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CompleteRegistrationRequest {
  email: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const body: CompleteRegistrationRequest = await req.json();
    const email = body.email.toLowerCase().trim();
    
    console.log("Completing registration for:", email);

    // Get the pending invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('pending_invitations')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (inviteError) {
      console.error("Error fetching invitation:", inviteError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch invitation data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!invitation) {
      return new Response(
        JSON.stringify({ error: "No pending invitation found for this email" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the user by email
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error listing users:", usersError);
      return new Response(
        JSON.stringify({ error: "Failed to find user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = users.find(u => u.email?.toLowerCase() === email);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found. Please complete signup first." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create profile from invitation data
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        full_name: invitation.full_name,
        email: email,
        public_role: invitation.public_role,
        phone: invitation.phone,
        state: invitation.state,
        organization: invitation.organization,
        current_projects: invitation.current_projects,
        duties_and_responsibilities: invitation.duties_and_responsibilities,
        biography: invitation.biography,
        linkedin: invitation.linkedin,
      });

    if (profileError) {
      // Profile might already exist, try to update instead
      if (profileError.code === '23505') {
        console.log("Profile already exists, updating...");
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            full_name: invitation.full_name,
            public_role: invitation.public_role,
            phone: invitation.phone,
            state: invitation.state,
            organization: invitation.organization,
            current_projects: invitation.current_projects,
            duties_and_responsibilities: invitation.duties_and_responsibilities,
            biography: invitation.biography,
            linkedin: invitation.linkedin,
          })
          .eq('id', user.id);
          
        if (updateError) {
          console.error("Error updating profile:", updateError);
          return new Response(
            JSON.stringify({ error: "Failed to update profile" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        console.error("Error creating profile:", profileError);
        return new Response(
          JSON.stringify({ error: "Failed to create profile" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create member role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: 'member',
      });

    if (roleError && roleError.code !== '23505') {
      console.error("Error creating role:", roleError);
      // Non-critical, continue anyway
    }

    // Delete the pending invitation
    const { error: deleteError } = await supabaseAdmin
      .from('pending_invitations')
      .delete()
      .eq('id', invitation.id);

    if (deleteError) {
      console.error("Error deleting invitation:", deleteError);
      // Non-critical, continue anyway
    }

    console.log("Registration completed successfully for:", email);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
