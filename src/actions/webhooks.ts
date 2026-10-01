'use server'

import { auth } from '@/lib/auth'
import { writeAudit } from '@/lib/audit'

export type WebhookTestResult = {
  success: boolean
  statusCode?: number
  message: string
  payload?: Record<string, any>
  error?: string
}

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin only')
  }
  return session
}

export async function testWebhookEndpoint(endpointUrl: string, eventType: string): Promise<WebhookTestResult> {
  try {
    const session = await requireAdmin()

    if (!endpointUrl || !endpointUrl.startsWith('http')) {
      return { success: false, message: 'Invalid URL. Must begin with http:// or https://' }
    }

    const testPayload = {
      event: eventType || 'SYSTEM_TEST',
      timestamp: new Date().toISOString(),
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

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FacultyConnect-Webhook/1.0',
      },
      body: JSON.stringify(testPayload),
    }).catch((err) => {
      throw new Error(`Connection failed: ${err.message}`)
    })

    await writeAudit({
      actorId: session.user.id,
      action: 'WEBHOOK_TEST_DISPATCHED',
      entityType: 'Webhook',
      entityId: endpointUrl.slice(0, 50),
      afterState: { endpointUrl, eventType, status: response.status },
    })

    return {
      success: response.ok,
      statusCode: response.status,
      message: response.ok
        ? `Webhook endpoint accepted delivery (HTTP ${response.status}).`
        : `Endpoint returned HTTP status ${response.status}.`,
      payload: testPayload,
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Webhook dispatch failed',
      error: err.message,
    }
  }
}
