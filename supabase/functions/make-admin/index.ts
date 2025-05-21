
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// This edge function will update the specified user to admin role
Deno.serve(async (req) => {
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Create a Supabase client with the service role key (from environment)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    
    // First, find the user ID for jdsoffcl@gmail.com in auth.users
    const { data: authUser, error: findError } = await supabaseClient.auth.admin.listUsers()
    
    if (findError) {
      console.error('Error finding user:', findError)
      return new Response(
        JSON.stringify({ error: 'Error finding user', details: findError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const user = authUser.users.find(u => u.email === 'jdsoffcl@gmail.com')
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Update the user's role to 'admin' in the profiles table
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)
    
    if (updateError) {
      console.error('Error updating user role:', updateError)
      return new Response(
        JSON.stringify({ error: 'Error updating user role', details: updateError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({
        message: 'User role updated to admin successfully',
        userId: user.id,
        email: user.email
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
