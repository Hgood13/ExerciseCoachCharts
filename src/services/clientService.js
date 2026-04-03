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
          sessions,
          exercises,
          created_at,
          updated_at
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
export async function createChart(clientId, recordNumber, chartData = {}) {
  try {
    const { data, error } = await supabase
      .from('charts')
      .insert({
        client_id: clientId,
        record_number: recordNumber,
        sessions: chartData.sessions || [],
        exercises: chartData.exercises || [],
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
 * Update an existing chart
 * @param {string} chartId - The UUID of the chart
 * @param {Object} chartData - Updated chart data (sessions and/or exercises)
 * @returns {Promise<Object>} Updated chart object
 */
export async function updateChart(chartId, chartData) {
  try {
    const { data, error } = await supabase
      .from('charts')
      .update(chartData)
      .eq('id', chartId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error updating chart:', error)
    throw error
  }
}

/**
 * Fetch all active exercise definitions grouped by category
 * @returns {Promise<Array>} Array of exercise definition objects
 */
export async function fetchExerciseDefinitions() {
  try {
    const { data, error } = await supabase
      .from('exercise_definitions')
      .select('id, code, name, category')
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
