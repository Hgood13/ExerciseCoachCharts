import { supabase } from './supabase'

/**
 * Fetch all clients from the database
 * @returns {Promise<Array>} Array of client objects
 */
export async function fetchClients() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, pin, phone_number, goals, injuries, protocol')
      .order('name', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching clients:', error)
    throw error
  }
}

/**
 * Create a new client in the database
 * @param {Object} clientData - Client data (name, pin, goals, injuries, protocol)
 * @returns {Promise<Object>} Created client object
 */
export async function createClient(clientData) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
}


/**
 * Fetch a single client by ID with all their charts
 * @param {string} clientId - The UUID of the client
 * @returns {Promise<Object>} Client object with charts
 */
export async function fetchClientWithCharts(clientId) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        pin,
        phone_number,
        goals,
        injuries,
        protocol,
        created_at,
        updated_at,
        charts (
          id,
          record_number,
          created_at,
          updated_at,
          chart_sessions ( session_index, date, trainer, routine ),
          chart_exercises ( exercise_index, routine_a, routine_b ),
          chart_session_exercises ( session_index, exercise_index, checked, note )
        )
      `)
      .eq('id', clientId)
      .order('record_number', { ascending: false, referencedTable: 'charts' })
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching client with charts:', error)
    throw error
  }
}

/**
 * Create a new chart for a client
 * @param {string} clientId - The UUID of the client
 * @param {number} recordNumber - Record number for this chart
 * @param {Object} chartData - Chart data (sessions and exercises)
 * @returns {Promise<Object>} Created chart object
 */
export async function createChart(clientId, recordNumber) {
  try {
    const { data, error } = await supabase
      .from('charts')
      .insert({
        client_id: clientId,
        record_number: recordNumber,
      })
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error creating chart:', error)
    throw error
  }
}

/**
 * Save chart session and exercise data to the normalized tables
 * @param {string} chartId - The UUID of the chart
 * @param {Object} data - { sessions, exercises, sessionExercises } arrays
 */
export async function saveChartData(chartId, { sessions, exercises, sessionExercises }) {
  try {
    const ops = []

    if (sessions) {
      const rows = sessions.map(s => ({ chart_id: chartId, ...s }))
      ops.push(
        supabase.from('chart_sessions').upsert(rows, { onConflict: 'chart_id,session_index' })
      )
    }

    if (exercises) {
      const rows = exercises.map(e => ({ chart_id: chartId, ...e }))
      ops.push(
        supabase.from('chart_exercises').upsert(rows, { onConflict: 'chart_id,exercise_index' })
      )
    }

    if (sessionExercises) {
      const rows = sessionExercises.map(se => ({ chart_id: chartId, ...se }))
      ops.push(
        supabase.from('chart_session_exercises').upsert(rows, { onConflict: 'chart_id,session_index,exercise_index' })
      )
    }

    const results = await Promise.all(ops)
    for (const { error } of results) {
      if (error) throw error
    }
  } catch (error) {
    console.error('Error saving chart data:', error)
    throw error
  }
}

/**
 * Update an existing client's info
 * @param {string} clientId - The UUID of the client
 * @param {Object} clientData - Updated client data (goals, injuries, protocol)
 * @returns {Promise<Object>} Updated client object
 */
export async function updateClient(clientId, clientData) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', clientId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error updating client:', error)
    throw error
  }
}
 
/**
 * Fetch all active exercise definitions
 * @returns {Promise<Array>} Array of exercise definition objects
 */
export async function fetchExerciseDefinitions() {
  try {
    const { data, error } = await supabase
      .from('exercise_definitions')
      .select('id, code, name, category, subcategory')
      .eq('is_active', true)
      .order('category')
      .order('sort_order')
      .order('code')

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching exercise definitions:', error)
    throw error
  }
}
