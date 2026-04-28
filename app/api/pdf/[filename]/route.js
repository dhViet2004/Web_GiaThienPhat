import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  // Await params in Next.js 15+
  const { filename } = await params;
  
  // Decode URL-encoded characters
  const decodedFilename = decodeURIComponent(filename);
  
  // Security: prevent directory traversal attacks
  if (decodedFilename.includes('..') || decodedFilename.includes('/') || decodedFilename.includes('\\')) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }
  
  // Point to uploads directory at project root
  const filePath = path.join(process.cwd(), 'uploads', decodedFilename);

  try {
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${decodedFilename}"`,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } else {
      console.error('PDF not found at path:', filePath);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error reading PDF file:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
