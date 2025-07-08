import { NextRequest, NextResponse } from 'next/server';
import { stcPayService } from '@/lib/stc-pay';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transaction_id');

    if (!transactionId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Transaction ID is required',
          messageAr: 'معرف المعاملة مطلوب'
        },
        { status: 400 }
      );
    }

    // التحقق من حالة الدفع
    const paymentStatus = await stcPayService.checkPaymentStatus(transactionId);

    return NextResponse.json({
      success: true,
      data: paymentStatus
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check payment status',
        messageAr: 'فشل في التحقق من حالة الدفع',
        errorCode: 'STATUS_CHECK_FAILED'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Transaction ID is required',
          messageAr: 'معرف المعاملة مطلوب'
        },
        { status: 400 }
      );
    }

    // التحقق من حالة الدفع
    const paymentStatus = await stcPayService.checkPaymentStatus(transactionId);

    return NextResponse.json({
      success: true,
      data: paymentStatus
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check payment status',
        messageAr: 'فشل في التحقق من حالة الدفع',
        errorCode: 'STATUS_CHECK_FAILED'
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
