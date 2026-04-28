import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Credential from '@/models/Credential';

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;
    await dbConnect();
    
    const credential = await Credential.findOne({ id }).lean();
    
    if (!credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    return NextResponse.json({
      item: {
        _id: credential._id.toString(),
        id: credential.id,
        src: credential.src || '',
        brand: credential.brand || '',
        title: credential.title || '',
        subtitle: credential.subtitle || '',
        num: credential.num || '',
        medal: credential.medal || false,
        pdfPath: credential.pdfPath || '',
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching credential:', error);
    return NextResponse.json({ error: 'Failed to fetch credential' }, { status: 500 });
  }
}
