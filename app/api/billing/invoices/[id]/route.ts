import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
import Patient from '@/models/Patient';
import { logActivity } from '@/lib/activity-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const invoice = await Invoice.findById(id).lean();
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Fetch the patient's hospital ID
    let hospitalPatientId = invoice.patientId;
    try {
      const patient = await Patient.findById(invoice.patientId).select('patientId').lean();
      if (patient && patient.patientId) {
        hospitalPatientId = patient.patientId;
      }
    } catch {
      // If patient lookup fails, use the stored patientId as fallback
    }

    // Get payment history for this invoice
    const payments = await Payment.find({ invoiceId: id })
      .sort({ paymentDate: -1 })
      .lean();

    const totalPaid = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      invoice: {
        ...invoice,
        hospitalPatientId
      },
      payments,
      totalPaid,
      remaining: invoice.total - totalPaid,
    });
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const body = await request.json();
    const {
      items,
      subtotal,
      tax,
      discount,
      total,
      status,
      dueDate,
      notes,
    } = body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Calculate totals if items are updated
    if (items && Array.isArray(items)) {
      const calculatedSubtotal = items.reduce((sum: number, item: any) => {
        const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
        return sum + itemTotal;
      }, 0);

      invoice.items = items.map((item: any) => ({
        ...item,
        total: (item.quantity || 1) * (item.unitPrice || 0),
      }));
      invoice.subtotal = subtotal || calculatedSubtotal;
      invoice.tax = tax || 0;
      invoice.discount = discount || 0;
      invoice.total = total || (invoice.subtotal + invoice.tax - invoice.discount);
    }

    if (status !== undefined) invoice.status = status;
    if (dueDate !== undefined) invoice.dueDate = dueDate ? new Date(dueDate) : null;
    if (notes !== undefined) invoice.notes = notes;

    await invoice.save();

    // Log activity — detect pay vs update
    const isPay = body.status === 'paid' || (body.paymentMethod);
    const action: 'update_invoice' | 'pay_invoice' = isPay ? 'pay_invoice' : 'update_invoice';
    await logActivity({
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name,
      action,
      target: id,
      targetType: 'invoice',
      details: {
        invoiceNumber: invoice.invoiceNumber,
        patientName: invoice.patientName,
        total: invoice.total,
        newStatus: invoice.status,
      },
      status: 'success',
      req: request,
    });

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error('Error updating invoice:', error);

    // Log failed activity
    try {
      const session = await getServerSession(authOptions);
      const { id: failId } = await params;
      await logActivity({
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userName: session?.user?.name,
        action: 'update_invoice',
        target: failId,
        targetType: 'invoice',
        status: 'failed',
        error: error.message,
        req: request,
      });
    } catch {
      // ignore logging failure
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if there are any payments
    const payments = await Payment.find({ invoiceId: id });
    if (payments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete invoice with existing payments' },
        { status: 400 }
      );
    }

    await Invoice.findByIdAndDelete(id);

    // Log activity
    await logActivity({
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name,
      action: 'delete_invoice',
      target: id,
      targetType: 'invoice',
      details: {
        invoiceNumber: invoice.invoiceNumber,
        patientName: invoice.patientName,
        total: invoice.total,
      },
      status: 'success',
      req: request,
    });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);

    // Log failed activity
    try {
      const session = await getServerSession(authOptions);
      const { id: failId } = await params;
      await logActivity({
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userName: session?.user?.name,
        action: 'delete_invoice',
        target: failId,
        targetType: 'invoice',
        status: 'failed',
        error: error.message,
        req: request,
      });
    } catch {
      // ignore logging failure
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
