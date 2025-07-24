import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

async function pingUrl(url: string): Promise<{ status: number; success: boolean }> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'RenderPulse-KeepAlive/1.0',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })
    
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

async function processActivePings() {
  console.log('Processing active pings...')
  
  // Get all active URLs that haven't expired
  const { data: activeUrls, error } = await supabase
    .from('ping_urls')
    .select('*')
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())

  if (error) {
    console.error('Error fetching active URLs:', error)
    return
  }

  console.log(`Found ${activeUrls.length} active URLs to ping`)

  for (const urlRecord of activeUrls) {
    console.log(`Pinging: ${urlRecord.url}`)
    
    const pingResult = await pingUrl(urlRecord.url)
    
    // Update the ping record
    const { error: updateError } = await supabase
      .from('ping_urls')
      .update({
        last_ping_at: new Date().toISOString(),
        last_ping_status: pingResult.status,
        ping_count: urlRecord.ping_count + 1
      })
      .eq('id', urlRecord.id)

    if (updateError) {
      console.error(`Error updating ping record for ${urlRecord.url}:`, updateError)
    } else {
      console.log(`Successfully pinged ${urlRecord.url} - Status: ${pingResult.status}`)
    }
  }

  // Deactivate expired URLs
  const { error: expiredError } = await supabase
    .from('ping_urls')
    .update({ is_active: false })
    .eq('is_active', true)
    .lt('expires_at', new Date().toISOString())

  if (expiredError) {
    console.error('Error deactivating expired URLs:', expiredError)
  } else {
    console.log('Deactivated expired URLs')
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // This function can be called manually or via cron
    await processActivePings()
    
    return new Response(
      JSON.stringify({ message: 'Ping service completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in ping service:', error)
    return new Response(
      JSON.stringify({ error: 'Ping service failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})