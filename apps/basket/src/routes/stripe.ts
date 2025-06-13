import { Elysia } from "elysia";
import Stripe from 'stripe'
import { db, userStripeConfig, eq } from '@databuddy/db'
import { clickHouse } from '@databuddy/db'

/**
 * STRIPE CHECKOUT SETUP GUIDE
 * 
 * To properly track revenue analytics, you MUST include client_id and session_id 
 * when creating Stripe Checkout sessions server-side:
 * 
 * Example:
 * ```typescript
 * const session = await stripe.checkout.sessions.create({
 *   payment_method_types: ['card'],
 *   mode: 'payment',
 *   line_items: [{ price: 'price_abc123', quantity: 1 }],
 *   success_url: 'https://yourapp.com/success',
 *   cancel_url: 'https://yourapp.com/cancel',
 *   client_reference_id: 'session_id',  // REQUIRED: Pass your analytics session_id here
 *   metadata: {
 *     client_id: 'your_website_id',          // REQUIRED: Website/client identifier
 *   }
 * });
 * ```
 * 
 * IMPORTANT:
 * - client_reference_id should contain your analytics session_id (anonymous user ID)
 * - metadata.client_id should contain your website/client identifier
 * - This links Stripe payments to your analytics events automatically
 */

const app = new Elysia()

interface StripeConfig {
    webhookSecret: string
    userId: string
    webhookToken: string
    isLiveMode: boolean
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const ENABLE_IP_VALIDATION = process.env.ENABLE_IP_VALIDATION === 'true' || IS_PRODUCTION
const ENABLE_MODE_VALIDATION = process.env.ENABLE_MODE_VALIDATION === 'true' || IS_PRODUCTION

const STRIPE_WEBHOOK_IPS = [
    "13.112.224.240",
    "13.115.13.148",
    "13.210.129.177",
    "13.210.176.167",
    "13.228.126.182",
    "13.228.224.121",
    "13.230.11.13",
    "13.230.90.110",
    "13.55.153.188",
    "13.55.5.15",
    "13.56.126.253",
    "13.56.173.200",
    "13.56.173.232",
    "13.57.108.134",
    "13.57.155.157",
    "13.57.156.206",
    "13.57.157.116",
    "13.57.90.254",
    "13.57.98.27",
    "18.194.147.12",
    "18.195.120.229",
    "18.195.125.165",
    "34.200.27.109",
    "34.200.47.89",
    "34.202.153.183",
    "34.204.109.15",
    "34.213.149.138",
    "34.214.229.69",
    "34.223.201.215",
    "34.237.201.68",
    "34.237.253.141",
    "34.238.187.115",
    "34.239.14.72",
    "34.240.123.193",
    "34.241.202.139",
    "34.241.54.72",
    "34.241.59.225",
    "34.250.29.31",
    "34.250.89.120",
    "35.156.131.6",
    "35.156.194.238",
    "35.157.227.67",
    "35.158.254.198",
    "35.163.82.19",
    "35.164.105.206",
    "35.164.124.216",
    "50.16.2.231",
    "50.18.212.157",
    "50.18.212.223",
    "50.18.219.232",
    "52.1.23.197",
    "52.196.53.105",
    "52.196.95.231",
    "52.204.6.233",
    "52.205.132.193",
    "52.211.198.11",
    "52.212.99.37",
    "52.213.35.125",
    "52.22.83.139",
    "52.220.44.249",
    "52.25.214.31",
    "52.26.11.205",
    "52.26.132.102",
    "52.26.14.11",
    "52.36.167.221",
    "52.53.133.6",
    "52.54.150.82",
    "52.57.221.37",
    "52.59.173.230",
    "52.62.14.35",
    "52.62.203.73",
    "52.63.106.9",
    "52.63.119.77",
    "52.65.161.237",
    "52.73.161.98",
    "52.74.114.251",
    "52.74.98.83",
    "52.76.14.176",
    "52.76.156.251",
    "52.76.174.156",
    "52.77.80.43",
    "52.8.19.58",
    "52.8.8.189",
    "54.149.153.72",
    "54.152.36.104",
    "54.183.95.195",
    "54.187.182.230",
    "54.187.199.38",
    "54.187.208.163",
    "54.238.140.239",
    "54.65.115.204",
    "54.65.97.98",
    "54.67.48.128",
    "54.67.52.245",
    "54.68.165.206",
    "54.68.183.151",
    "107.23.48.182",
    "107.23.48.232",
    "198.137.150.21",
    "198.137.150.22",
    "198.137.150.23",
    "198.137.150.24",
    "198.137.150.25",
    "198.137.150.26",
    "198.137.150.27",
    "198.137.150.28",
    "198.137.150.101",
    "198.137.150.102",
    "198.137.150.103",
    "198.137.150.104",
    "198.137.150.105",
    "198.137.150.106",
    "198.137.150.107",
    "198.137.150.108",
    "198.137.150.171",
    "198.137.150.172",
    "198.137.150.173",
    "198.137.150.174",
    "198.137.150.175",
    "198.137.150.176",
    "198.137.150.177",
    "198.137.150.178",
    "198.137.150.221",
    "198.137.150.222",
    "198.137.150.223",
    "198.137.150.224",
    "198.137.150.225",
    "198.137.150.226",
    "198.137.150.227",
    "198.137.150.228",
    "198.202.176.21",
    "198.202.176.22",
    "198.202.176.23",
    "198.202.176.24",
    "198.202.176.25",
    "198.202.176.26",
    "198.202.176.27",
    "198.202.176.28",
    "198.202.176.101",
    "198.202.176.102",
    "198.202.176.103",
    "198.202.176.104",
    "198.202.176.105",
    "198.202.176.106",
    "198.202.176.107",
    "198.202.176.108",
    "198.202.176.171",
    "198.202.176.172",
    "198.202.176.173",
    "198.202.176.174",
    "198.202.176.175",
    "198.202.176.176",
    "198.202.176.177",
    "198.202.176.178",
    "198.202.176.221",
    "198.202.176.222",
    "198.202.176.223",
    "198.202.176.224",
    "198.202.176.225",
    "198.202.176.226",
    "198.202.176.227",
    "198.202.176.228",
]

// Secure webhook endpoint using webhook token: /stripe/webhook/{webhookToken}
app.post('/stripe/webhook/:webhookToken', async ({ params, request, set }) => {
    const clientIp = getClientIp(request)

    // IP validation (conditional)
    if (ENABLE_IP_VALIDATION && !isStripeIp(clientIp)) {
        logSecurityEvent('invalid_source_ip', params.webhookToken, clientIp)
        set.status = 403
        return { error: 'Request not from Stripe' }
    }

    const config = await getStripeConfigByToken(params.webhookToken)
    if (!config) {
        logSecurityEvent('invalid_webhook_token', params.webhookToken, clientIp)
        set.status = 404
        return { error: 'Webhook endpoint not found' }
    }
    
    return handleWebhook(request, set, config)
})

// Legacy global endpoint
app.post('/stripe', async ({ request, set }) => {
    const clientIp = getClientIp(request)
    
    // IP validation (conditional)
    if (ENABLE_IP_VALIDATION && !isStripeIp(clientIp)) {
        logSecurityEvent('invalid_source_ip', 'global', clientIp)
        set.status = 403
        return { error: 'Request not from Stripe' }
    }

    const config = getGlobalStripeConfig()
    if (!config) {
        set.status = 500
        return { error: 'Global Stripe configuration not found' }
    }
    
    return handleWebhook(request, set, config)
})

/**
 * Get client IP address from request
 */
function getClientIp(request: Request): string {
    return request.headers.get('cf-connecting-ip') || 
           request.headers.get('x-forwarded-for')?.split(',')[0] || 
           request.headers.get('x-real-ip') || 
           'unknown'
}

/**
 * Check if IP is from Stripe's official webhook IP list
 */
function isStripeIp(clientIp: string): boolean {
    // Allow localhost for development
    if (clientIp === '127.0.0.1' || clientIp === 'localhost' || clientIp === '::1') {
        return true
    }
    
    return STRIPE_WEBHOOK_IPS.includes(clientIp)
}

/**
 * Get Stripe configuration by webhook token
 */
async function getStripeConfigByToken(webhookToken: string): Promise<StripeConfig | null> {
    try {
        const userConfig = await db
            .select({
                webhookSecret: userStripeConfig.webhookSecret,
                userId: userStripeConfig.userId,
                isLiveMode: userStripeConfig.isLiveMode,
                isActive: userStripeConfig.isActive
            })
            .from(userStripeConfig)
            .where(eq(userStripeConfig.webhookToken, webhookToken))
            .limit(1)

        if (!userConfig.length || !userConfig[0].isActive) {
            return null
        }

        const config = userConfig[0]
        return {
            webhookSecret: config.webhookSecret,
            userId: config.userId,
            webhookToken: webhookToken,
            isLiveMode: config.isLiveMode
        }
    } catch (error) {
        console.error(`Error fetching Stripe config for token ${webhookToken}:`, error)
        return null
    }
}

/**
 * Get global Stripe configuration from environment
 */
function getGlobalStripeConfig(): StripeConfig | null {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
        return null
    }

    return {
        webhookSecret,
        userId: 'global',
        webhookToken: 'global',
        isLiveMode: false
    }
}

/**
 * Webhook handler with conditional security
 */
async function handleWebhook(request: Request, set: any, config: StripeConfig) {
    const sig = request.headers.get('stripe-signature')
    const body = await request.text()

    if (!sig) {
        set.status = 400
        return { error: 'Missing stripe-signature header' }
    }

    try {
        const event = await Stripe.webhooks.constructEventAsync(body, sig, config.webhookSecret)

        // Validate live/test mode consistency (conditional)
        if (ENABLE_MODE_VALIDATION && event.livemode !== config.isLiveMode) {
            logSecurityEvent('livemode_mismatch', config.webhookToken, getClientIp(request), {
                eventLivemode: event.livemode,
                configLivemode: config.isLiveMode,
                eventType: event.type
            })
            set.status = 400
            return { error: 'Live/test mode mismatch' }
        }

        console.log(`📦 Stripe webhook received for user ${config.userId}:`, {
            type: event.type,
            id: event.id,
            livemode: event.livemode
        })

        // Process the event with error handling
        try {
            await processWebhookEvent(event, config)
            // updateWebhookSuccess(config.webhookToken) // Commented out - no DB fields yet
            console.log(`✅ Successfully processed ${event.type}`)
        } catch (processingError) {
            console.error(`❌ Error processing webhook event:`, processingError)
            // updateWebhookFailure(config.webhookToken) // Commented out - no DB fields yet
            // Still return 200 to prevent Stripe retries
        }

        set.status = 200
        return { received: true, eventType: event.type }

    } catch (err) {
        console.error(`⚠️ Webhook signature verification failed:`, err)
        logSecurityEvent('signature_verification_failed', config.webhookToken, getClientIp(request))
        // updateWebhookFailure(config.webhookToken) // Commented out - no DB fields yet
        
        set.status = 400
        return { error: 'Invalid signature' }
    }
}

/**
 * Process webhook events and store data
 */
async function processWebhookEvent(event: Stripe.Event, config: StripeConfig) {
    const handlers: Record<string, (data: any) => Promise<void>> = {
        'payment_intent.succeeded': (pi: Stripe.PaymentIntent) => insertPaymentIntent(pi, config),
        'payment_intent.created': (pi: Stripe.PaymentIntent) => insertPaymentIntent(pi, config),
        'payment_intent.canceled': (pi: Stripe.PaymentIntent) => insertPaymentIntent(pi, config),
        'payment_intent.payment_failed': (pi: Stripe.PaymentIntent) => insertPaymentIntent(pi, config),
        'payment_intent.requires_action': (pi: Stripe.PaymentIntent) => insertPaymentIntent(pi, config),
        'charge.succeeded': (charge: Stripe.Charge) => insertCharge(charge, config),
        'charge.failed': (charge: Stripe.Charge) => insertCharge(charge, config),
        'charge.captured': (charge: Stripe.Charge) => insertCharge(charge, config),
        'charge.dispute.created': (charge: Stripe.Charge) => insertCharge(charge, config),
        'refund.created': (refund: Stripe.Refund) => insertRefund(refund, config),
        'refund.updated': (refund: Stripe.Refund) => insertRefund(refund, config),
        'refund.failed': (refund: Stripe.Refund) => insertRefund(refund, config),
    }

    const handler = handlers[event.type]
    if (handler) {
        await handler(event.data.object as any)
    } else {
        console.log(`🔄 Unhandled event type: ${event.type}`)
    }
}

/**
 * Extract client ID from Stripe metadata
 */
function extractClientId(stripeObject: any): string | null {
    try {
        // Try metadata first (recommended approach)
        if (stripeObject.metadata?.client_id) {
            return stripeObject.metadata.client_id
        }
        
        // Fallback to other possible fields
        if (stripeObject.metadata?.website_id) {
            return stripeObject.metadata.website_id
        }
    } catch (error) {
        console.warn('Error extracting client ID:', error)
    }
    
    return null
}

/**
 * Extract session ID from Stripe client_reference_id (recommended) or metadata fallback
 */
function extractSessionId(stripeObject: any): string | null {
    try {
        // Primary: client_reference_id (recommended - most reliable)
        if (stripeObject.client_reference_id) {
            return stripeObject.client_reference_id
        }
        
        // Fallback: metadata.session_id
        if (stripeObject.metadata?.session_id) {
            return stripeObject.metadata.session_id
        }

    } catch (error) {
        console.warn('Error extracting session ID:', error)
    }
    
    return null
}

/**
 * Insert Payment Intent data
 */
async function insertPaymentIntent(pi: Stripe.PaymentIntent, config: StripeConfig) {
    try {
        const clientId = extractClientId(pi)
        const sessionId = extractSessionId(pi)
        
        if (!clientId) {
            console.error('❌ REQUIRED: client_id not found in PaymentIntent metadata:', pi.id)
            throw new Error(`Missing required client_id in PaymentIntent ${pi.id} metadata. Please include client_id in your Stripe Checkout session metadata.`)
        }

        await clickHouse.insert({
            table: 'analytics.stripe_payment_intents',
            values: [{
                id: pi.id,
                client_id: clientId,
                webhook_token: config.webhookToken,
                created: new Date(pi.created * 1000).toISOString().replace('T', ' ').replace('Z', ''),
                status: pi.status,
                currency: pi.currency,
                amount: pi.amount,
                amount_received: pi.amount_received,
                amount_capturable: pi.amount_capturable,
                customer_id: pi.customer as string || null,
                livemode: pi.livemode ? 1 : 0,
                metadata: pi.metadata,
                payment_method_types: pi.payment_method_types,
                failure_reason: pi.last_payment_error?.message || null,
                canceled_at: pi.canceled_at ? new Date(pi.canceled_at * 1000).toISOString().replace('T', ' ').replace('Z', '') : null,
                cancellation_reason: pi.cancellation_reason,
                description: pi.description,
                application_fee_amount: pi.application_fee_amount,
                setup_future_usage: pi.setup_future_usage,
                session_id: sessionId
            }],
            format: 'JSONEachRow'
        })
        
        console.log(`✅ Inserted PaymentIntent ${pi.id} for client ${clientId} with session ${sessionId} via webhook ${config.webhookToken}`)
    } catch (error) {
        console.error('Error inserting payment intent:', error)
        throw error
    }
}

/**
 * Insert Charge data
 */
async function insertCharge(charge: Stripe.Charge, config: StripeConfig) {
    try {
        const clientId = extractClientId(charge)
        const sessionId = extractSessionId(charge)
        const card = charge.payment_method_details?.card

        if (!clientId) {
            console.error('❌ REQUIRED: client_id not found in Charge metadata:', charge.id)
            throw new Error(`Missing required client_id in Charge ${charge.id} metadata. Please include client_id in your Stripe Checkout session metadata.`)
        }

        await clickHouse.insert({
            table: 'analytics.stripe_charges',
            values: [{
                id: charge.id,
                client_id: clientId,
                webhook_token: config.webhookToken,
                created: new Date(charge.created * 1000).toISOString().replace('T', ' ').replace('Z', ''),
                status: charge.status,
                currency: charge.currency,
                amount: charge.amount,
                amount_captured: charge.amount_captured,
                amount_refunded: charge.amount_refunded,
                paid: charge.paid ? 1 : 0,
                refunded: charge.refunded ? 1 : 0,
                failure_code: charge.failure_code,
                failure_message: charge.failure_message,
                outcome_type: charge.outcome?.type || null,
                risk_level: charge.outcome?.risk_level || null,
                card_brand: card?.brand || null,
                payment_intent_id: charge.payment_intent as string || null,
                customer_id: charge.customer as string || null,
                session_id: sessionId
            }],
            format: 'JSONEachRow'
        })
        
        console.log(`✅ Inserted Charge ${charge.id} for client ${clientId} with session ${sessionId} via webhook ${config.webhookToken}`)
    } catch (error) {
        console.error('Error inserting charge:', error)
        throw error
    }
}

/**
 * Insert Refund data
 */
async function insertRefund(refund: Stripe.Refund, config: StripeConfig) {
    try {
        const clientId = extractClientId(refund)
        const sessionId = extractSessionId(refund)
        
        if (!clientId) {
            console.error('❌ REQUIRED: client_id not found in Refund metadata:', refund.id)
            throw new Error(`Missing required client_id in Refund ${refund.id} metadata. Please include client_id in your Stripe Checkout session metadata.`)
        }

        await clickHouse.insert({
            table: 'analytics.stripe_refunds',
            values: [{
                id: refund.id,
                client_id: clientId,
                webhook_token: config.webhookToken,
                created: new Date(refund.created * 1000).toISOString().replace('T', ' ').replace('Z', ''),
                amount: refund.amount,
                status: refund.status,
                reason: refund.reason,
                currency: refund.currency,
                charge_id: refund.charge as string,
                payment_intent_id: refund.payment_intent as string || null,
                metadata: refund.metadata,
                session_id: sessionId
            }],
            format: 'JSONEachRow'
        })
        
        console.log(`✅ Inserted Refund ${refund.id} for client ${clientId} with session ${sessionId} via webhook ${config.webhookToken}`)
    } catch (error) {
        console.error('Error inserting refund:', error)
        throw error
    }
}

/**
 * Log security events for monitoring
 */
function logSecurityEvent(eventType: string, webhookToken: string, ip: string, metadata?: any) {
    if (IS_PRODUCTION) {
        console.warn(`🚨 Security Event: ${eventType}`, {
            webhookToken,
            ip,
            timestamp: new Date().toISOString(),
            metadata
        })
        // In production, send to your security monitoring system
        // await securityLogger.warn(eventType, { webhookToken, ip, metadata })
    } else {
        console.log(`🔍 Security Event (disabled): ${eventType}`, { webhookToken, ip })
    }
}

// Commented out until DB fields are added
// /**
//  * Update webhook success tracking
//  */
// async function updateWebhookSuccess(webhookToken: string) {
//     if (webhookToken === 'global') return
//     
//     try {
//         await db
//             .update(userStripeConfig)
//             .set({
//                 lastWebhookAt: new Date().toISOString(),
//                 webhookFailureCount: 0,
//                 updatedAt: new Date().toISOString()
//             })
//             .where(eq(userStripeConfig.webhookToken, webhookToken))
//     } catch (error) {
//         console.error('Error updating webhook success:', error)
//     }
// }

// /**
//  * Update webhook failure tracking
//  */
// async function updateWebhookFailure(webhookToken: string) {
//     if (webhookToken === 'global') return
//     
//     try {
//         await db
//             .update(userStripeConfig)
//             .set({
//                 webhookFailureCount: sql`${userStripeConfig.webhookFailureCount} + 1`,
//                 updatedAt: new Date().toISOString()
//             })
//             .where(eq(userStripeConfig.webhookToken, webhookToken))
//     } catch (error) {
//         console.error('Error updating webhook failure:', error)
//     }
// }

export default app;