
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the auth.users table
    const { data: users, error } = await supabaseClient.auth.admin.listUsers()
    
    if (error) {
      throw error
    }

    // Create a map of user IDs to email addresses
    const userEmailMap: Record<string, string> = {}
    users.users.forEach(user => {
      userEmailMap[user.id] = user.email || 'unknown'
    })

    // Add known admin emails
    const adminEmails = {
      "16b7d447-a1ce-4ee2-843f-ca8f7d4e1a24": "jdsoffcl@gmail.com",
      "kennethadmin": "kennethroyvillamayor57000@gmail.com"
    };
    
    // Add known employee emails - removed regularuser@example.com
    const employeeEmails = {
      "71fe4204-78d7-45b7-9180-f8d61ca5f4d9": "employee1@example.com",
      "7b926c51-4a5f-4229-8e6a-1d2c09ba3a9b": "employee2@example.com",
      "f9934772-8419-43a2-b3c1-ea8e8fc5a41d": "employee3@example.com",
      "cb9ae36a-a1db-489f-9379-523c9187b92b": "employee4@example.com",
      // Removed regularuser@example.com entry
    };
    
    // Override with known emails
    Object.entries(adminEmails).forEach(([id, email]) => {
      userEmailMap[id] = email;
    });
    
    Object.entries(employeeEmails).forEach(([id, email]) => {
      userEmailMap[id] = email;
    });

    return new Response(
      JSON.stringify(userEmailMap),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
