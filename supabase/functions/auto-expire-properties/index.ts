import { createClient } from '@supabase/supabase-js'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  try {
    // Get all occupied properties that are older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: occupiedProperties, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'occupied')
      .lt('first_tenant_date', thirtyDaysAgo.toISOString())

    if (fetchError) {
      throw fetchError
    }

    // Update properties to pending_review status
    if (occupiedProperties && occupiedProperties.length > 0) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ 
          status: 'pending_review',
          last_verified_at: new Date().toISOString()
        })
        .in('id', occupiedProperties.map(p => p.id))

      if (updateError) {
        throw updateError
      }

      console.log(`Updated ${occupiedProperties.length} properties to pending_review status`)
    }

    // Get all available properties that haven't been verified in 30 days
    const { data: unverifiedProperties, error: unverifiedError } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'available')
      .or(`last_verified_at.is.null,last_verified_at.lt.${thirtyDaysAgo.toISOString()}`)

    if (unverifiedError) {
      throw unverifiedError
    }

    // Update last_verified_at for unverified properties
    if (unverifiedProperties && unverifiedProperties.length > 0) {
      const { error: verifyError } = await supabase
        .from('properties')
        .update({ 
          last_verified_at: new Date().toISOString()
        })
        .in('id', unverifiedProperties.map(p => p.id))

      if (verifyError) {
        throw verifyError
      }

      console.log(`Updated verification timestamp for ${unverifiedProperties.length} properties`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${occupiedProperties?.length || 0} occupied properties and ${unverifiedProperties?.length || 0} unverified properties`
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in auto-expire function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
