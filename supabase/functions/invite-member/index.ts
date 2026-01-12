import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteMemberRequest {
  email: string;
  full_name: string;
  public_role: string;
  phone?: string;
  state?: string;
  organization?: string;
  current_projects?: string;
  duties_and_responsibilities?: string;
  biography?: string;
  linkedin?: string;
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
    
    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await supabaseAdmin
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Only admins can invite members" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: InviteMemberRequest = await req.json();
    console.log("Inviting member:", body.email);

    // Store pending invitation data
    const { error: inviteDataError } = await supabaseAdmin
      .from('pending_invitations')
      .upsert({
        email: body.email.toLowerCase(),
        full_name: body.full_name,
        public_role: body.public_role,
        phone: body.phone || null,
        state: body.state || null,
        organization: body.organization || null,
        current_projects: body.current_projects || null,
        duties_and_responsibilities: body.duties_and_responsibilities || null,
        biography: body.biography || null,
        linkedin: body.linkedin || null,
        invited_by: user.id,
      }, { onConflict: 'email' });

    if (inviteDataError) {
      console.error("Error storing invitation data:", inviteDataError);
      return new Response(
        JSON.stringify({ error: "Failed to store invitation data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send invitation email using Supabase Auth Admin API
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      body.email,
      {
        redirectTo: "https://member.ngtsab.org/set-password",
        data: {
          full_name: body.full_name,
          public_role: body.public_role,
        }
      }
    );

    if (inviteError) {
      console.error("Error sending invite:", inviteError);
      // Clean up pending invitation if email fails
      await supabaseAdmin
        .from('pending_invitations')
        .delete()
        .eq('email', body.email.toLowerCase());
      
      return new Response(
        JSON.stringify({ error: inviteError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Invitation sent successfully to:", body.email);

    return new Response(
      JSON.stringify({ success: true, user: inviteData.user }),
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
