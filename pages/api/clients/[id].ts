import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { updateClientSchema, validateRequest } from '../../../lib/validations'
import { PROSPER_STARTUP_ID } from '../../../lib/constants'
import { onStageChange } from '../../../lib/email/scheduler'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Client ID is required' })
  }

  switch (req.method) {
    case 'GET':
      return getClient(req, res, id)
    case 'PUT':
    case 'PATCH':
      return updateClient(req, res, id)
    case 'DELETE':
      return deleteClient(req, res, id)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE'])
      res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

// GET /api/clients/[id] - Get a specific client by ID
async function getClient(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Client not found' })
      }
      console.error('Error fetching client:', error)
      return res.status(500).json({ error: 'Failed to fetch client' })
    }

    res.status(200).json({ client: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// PUT /api/clients/[id] - Update a specific client
async function updateClient(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Validate request body
    const bodyValidation = validateRequest(updateClientSchema, req.body, 'request body')
    if (!bodyValidation.success) {
      return res.status(400).json({ error: bodyValidation.error })
    }

    const validatedData = bodyValidation.data

    // Capture previous lead_stage before update (for automation triggers)
    const { data: prevClient } = await supabase
      .from('clients')
      .select('lead_stage')
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .single()

    const { data, error } = await supabase
      .from('clients')
      .update(validatedData)
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Client not found' })
      }
      console.error('Error updating client:', error)
      return res.status(500).json({ error: 'Failed to update client' })
    }

    // Fire stage-change automation — non-blocking, failure doesn't affect the response
    if (prevClient && validatedData.lead_stage && prevClient.lead_stage !== validatedData.lead_stage) {
      onStageChange(id, prevClient.lead_stage ?? '', validatedData.lead_stage as string)
        .catch(err => console.error('[automation] onStageChange error:', err))
    }

    res.status(200).json({ client: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE /api/clients/[id] - Delete a specific client
async function deleteClient(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('startup_id', PROSPER_STARTUP_ID)

    if (error) {
      console.error('Error deleting client:', error)
      return res.status(500).json({ error: 'Failed to delete client' })
    }

    res.status(200).json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

