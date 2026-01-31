// app/api/payments/stripe/create-session/route.ts
import { NextResponse } from 'next/server'
import payload from 'payload'
import Stripe from 'stripe'
import { getPayload } from 'payload'

const stripe = new Stripe(process.env.STRIPE_API_KEY as string)

interface RequestBody {
  courseId: string
  userId: string // From authenticated session (add auth middleware later)
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json()

    if (!body.courseId || !body.userId) {
      return NextResponse.json({ error: 'Missing courseId or userId' }, { status: 400 })
    }

    // Initialize Payload (server-side)
    const payloadInstance = await getPayload({ config: (await import('@payload-config')).default })

    // Fetch course + verify published & price
    const course = await payloadInstance.findByID({
      collection: 'courses',
      id: body.courseId,
      depth: 0,
    })

    if (!course || !course.isPublished || course.price <= 0) {
      return NextResponse.json({ error: 'Invalid or unavailable course' }, { status: 400 })
    }

    // Create pending purchase record
    // const purchase = await payloadInstance.create({
    //   collection: 'course-purchases',
    //   data: {
    //     user: body?.userId,
    //     course: body?.courseId,
    //     amount: course?.price, // Assumes price in cents (number)
    //     currency: 'NGN',
    //     status: 'pending',
    //     orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    //   },
    // })

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'ngn',
            product_data: {
              name: course.title,
              description: course.excerpt,
              // Optional: images: [course.thumbnail.url],
            },
            unit_amount: course.price, // In cents (e.g., 99900 for ₦999.00)
          },
          quantity: 1,
        },
      ],
      metadata: {
        // purchaseId: purchase.id,
        courseId: course.id,
        userId: body.userId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/courses/${course.slug}?purchase=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/courses/${course.slug}?purchase=cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe session creation error:', error)
    return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 })
  }
}
