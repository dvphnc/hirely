
// Follow this setup guide to integrate the Deno runtime into your Next.js app:
// https://deno.com/manual@v1.36.0/getting_started/nextjs
// This function deletes a user by ID
// Only administrators can use this function

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

console.log("Delete user function started");

serve(async (req) => {
  try {
    // Create admin client with service role key
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header was found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get the user
    const { data: { user: callerUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !callerUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized request', details: authError }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the caller is an admin
    const { data: callerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single();
      
    if (profileError || !callerProfile || callerProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only administrators can delete users' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body to get the user ID to delete
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing user ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Preventing admin from deleting themselves
    if (userId === callerUser.id) {
      return new Response(
        JSON.stringify({ error: 'You cannot delete your own account' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Delete the user's profile record first
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      // Delete user permissions
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId);
      
      // Finally delete the user from auth.users table
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error("Error deleting user:", deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete user', details: deleteError }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (err) {
      console.error("Error in deletion process:", err);
      return new Response(
        JSON.stringify({ error: 'Error in deletion process', details: err.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
