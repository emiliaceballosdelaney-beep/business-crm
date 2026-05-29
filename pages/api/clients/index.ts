import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { createClientSchema, clientQuerySchema, validateRequest } from '../../../lib/validations'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getClients(req, res)
    case 'POST':
      return createClient(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

// GET /api/clients - Get all clients, optionally filtered by startup_id
async function getClients(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate query parameters
    const queryValidation = validateRequest(clientQuerySchema, req.query, 'query parameters')
    if (!queryValidation.success) {
      return res.status(400).json({ error: queryValidation.error })
    }

    const { startup_id } = queryValidation.data

    let query = supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (startup_id) {
      query = query.eq('startup_id', startup_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching clients:', error)
      return res.status(500).json({ error: 'Failed to fetch clients' })
    }

    res.status(200).json({ clients: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/clients - Create a new client
async function createClient(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate request body
    const bodyValidation = validateRequest(createClientSchema, req.body, 'request body')
    if (!bodyValidation.success) {
      return res.status(400).json({ error: bodyValidation.error })
    }

    const validatedData = bodyValidation.data

    const { data, error } = await supabase
      .from('clients')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return res.status(500).json({ error: 'Failed to create client' })
    }

    res.status(201).json({ client: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

