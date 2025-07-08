import { NextRequest, NextResponse } from 'next/server';
import { stcPayService } from '@/lib/stc-pay';
import { STCPaymentRequest } from '@/types/subscription';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من صحة البيانات المطلوبة
    const requiredFields = ['amount', 'currency', 'customerEmail', 'planId', 'userId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Missing required field: ${field}`,
            messageAr: `حقل مطلوب مفقود: ${field}`
          },
          { status: 400 }
        );
      }
    }

    // إنشاء طلب الدفع
    const paymentRequest: STCPaymentRequest = {
      amount: parseFloat(body.amount),
      currency: body.currency || 'SAR',
      description: body.description || `Subscription payment`,
      descriptionAr: body.descriptionAr || `دفع اشتراك`,
      customerEmail: body.customerEmail,
      customerName: body.customerName || body.customerEmail,
      planId: body.planId,
      userId: body.userId,
      returnUrl: body.returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success`,
      cancelUrl: body.cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/cancel`
    };

    // إنشاء الدفع مع STC Pay
    const response = await stcPayService.createPayment(paymentRequest);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Payment creation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        messageAr: 'خطأ في الخادم الداخلي',
        errorCode: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
