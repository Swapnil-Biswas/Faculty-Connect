'use server'

import crypto from 'crypto'
import { auth } from '@/lib/auth'
import { writeAudit } from '@/lib/audit'

export type WebhookTestResult = {
  success: boolean
  statusCode?: number
  message: string
  payload?: Record<string, any>
  headersSent?: Record<string, string>
  hasSignature: boolean
  timestamp: string
  durationMs?: number
  error?: string
}

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin only')
  }
  return session
}

export async function testWebhookEndpoint(
  endpointUrl: string,
  eventType: string,
  secretToken?: string
): Promise<WebhookTestResult> {
  const startTime = performance.now()
  const timestamp = new Date().toISOString()

  try {
    const session = await requireAdmin()

    if (!endpointUrl || !endpointUrl.startsWith('http')) {
      return {
        success: false,
        message: 'Invalid URL. Must begin with http:// or https://',
        hasSignature: false,
        timestamp,
      }
    }

    const testPayload = {
      event: eventType || 'SYSTEM_TEST',
      timestamp,
      institution: 'Faculty Connect Platform',
      sender: {
        adminId: session.user.id,
        email: session.user.email,
      },
      data: {
        message: 'Ping from Faculty Connect Webhook Engine',
        status: 'OK',
      },
    }

    // Exact stringified body passed to fetch and signed
    const bodyString = JSON.stringify(testPayload)

    // Compute HMAC signature only if non-empty secret is provided
    const trimmedSecret = secretToken?.trim()
    let signature: string | undefined = undefined

    if (trimmedSecret) {
      signature = crypto
        .createHmac('sha256', trimmedSecret)
        .update(bodyString)
        .digest('hex')
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'FacultyConnect-Webhook/1.0',
      'X-FC-Timestamp': timestamp,
    }

    if (signature) {
      headers['X-Hub-Signature-256'] = `sha256=${signature}`
      headers['X-FC-Signature'] = signature
    }

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers,
      body: bodyString,
    }).catch((err) => {
      throw new Error(`Connection failed: ${err.message}`)
    })

    const durationMs = Math.round(performance.now() - startTime)

    // Audit log records execution metadata; never stores the secretToken
    await writeAudit({
      actorId: session.user.id,
      action: 'WEBHOOK_TEST_DISPATCHED',
      entityType: 'Webhook',
      entityId: endpointUrl.slice(0, 50),
      afterState: {
        endpointUrl,
        eventType: eventType || 'SYSTEM_TEST',
        status: response.status,
        hasSignature: Boolean(signature),
        durationMs,
      },
    }).catch(() => {})

    return {
      success: response.ok,
      statusCode: response.status,
      message: response.ok
        ? `Webhook endpoint accepted delivery (HTTP ${response.status}).`
        : `Endpoint returned HTTP status ${response.status}.`,
      payload: testPayload,
      headersSent: headers,
      hasSignature: Boolean(signature),
      timestamp,
      durationMs,
    }
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime)
    return {
      success: false,
      message: err.message || 'Webhook dispatch failed',
      hasSignature: Boolean(secretToken?.trim()),
      timestamp,
      durationMs,
      error: err.message,
    }
  }
}
