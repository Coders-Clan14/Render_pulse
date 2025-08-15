import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

async function pingUrl(url: string): Promise<{ status: number; success: boolean }> {
  try {
    console.log(`Attempting to ping: ${url}`)
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'RenderPulse-KeepAlive/1.0',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })
    
    console.log(`Ping response for ${url}: ${response.status}`)
    return {
      status: response.status,
      success: response.ok
    }
  } catch (error) {
    console.error(`Failed to ping ${url}:`, error)
    return {
      status: 0,
      success: false
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const method = req.method

    // GET /ping-urls/:client_id - Get all URLs for a client
    if (method === 'GET') {
      const clientId = url.pathname.split('/').pop()
      
      if (!clientId) {
        return new Response(
          JSON.stringify({ error: 'Client ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabase
        .from('ping_urls')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /ping-urls - Add new URL and perform immediate ping
    if (method === 'POST') {
      const body = await req.json()
      const { client_id, url: pingUrl, duration } = body

      // Validation
      if (!client_id || !pingUrl || !duration) {
        return new Response(
          JSON.stringify({ error: 'client_id, url, and duration are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validate URL format
      try {
        new URL(pingUrl)
        if (!pingUrl.startsWith('https://')) {
          throw new Error('URL must use HTTPS protocol')
        }
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid HTTPS URL format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validate duration
      if (duration < 1 || duration > 720) {
        return new Response(
          JSON.stringify({ error: 'Duration must be between 1 and 720 minutes' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if client already has 3 active URLs
      const { data: existingUrls, error: countError } = await supabase
        .from('ping_urls')
        .select('id')
        .eq('client_id', client_id)
        .eq('is_active', true)

      if (countError) {
        return new Response(
          JSON.stringify({ error: countError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (existingUrls.length >= 3) {
        return new Response(
          JSON.stringify({ error: 'Maximum of 3 active URLs allowed per user' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Perform immediate ping to test the URL
      console.log(`Performing immediate ping for new URL: ${pingUrl}`)
      const initialPing = await pingUrl(pingUrl)

      // Insert new URL with initial ping data
      const { data, error } = await supabase
        .from('ping_urls')
        .insert([{ 
          client_id, 
          url: pingUrl, 
          duration,
          last_ping_at: new Date().toISOString(),
          last_ping_status: initialPing.status,
          ping_count: 1
        }])
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /ping-urls/:id - Mark URL as inactive
    if (method === 'DELETE') {
      const urlId = url.pathname.split('/').pop()
      
      if (!urlId) {
        return new Response(
          JSON.stringify({ error: 'URL ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabase
        .from('ping_urls')
        .update({ is_active: false })
        .eq('id', urlId)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: 'URL not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'URL deactivated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in ping-urls function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})