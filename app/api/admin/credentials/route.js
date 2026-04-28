import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Credential from '@/models/Credential';
import { promises as fs } from 'fs';
import path from 'path';

const PDF_UPLOAD_DIR = path.join(process.cwd(), 'uploads');

async function ensureUploadDir() {
  try {
    await fs.access(PDF_UPLOAD_DIR);
  } catch {
    await fs.mkdir(PDF_UPLOAD_DIR, { recursive: true });
  }
}

async function savePdfFile(pdfFile) {
  if (!pdfFile || pdfFile.size === 0) {
    console.log('savePdfFile: No file provided');
    return '';
  }

  await ensureUploadDir();

  const timestamp = Date.now();
  const originalName = pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${timestamp}-${originalName}`;
  const filePath = path.join(PDF_UPLOAD_DIR, fileName);

  console.log('savePdfFile: Saving to', filePath);

  const arrayBuffer = await pdfFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  console.log('savePdfFile: Saved successfully');
  return `/api/pdf/${fileName}`;
}

async function deletePdfFile(pdfPath) {
  if (!pdfPath) return;
  
  // Extract filename from /api/pdf/filename format
  const filename = pdfPath.split('/api/pdf/').pop();
  if (!filename) return;
  
  const filePath = path.join(process.cwd(), 'uploads', filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting PDF file:', error);
  }
}

const DEFAULT_CREDENTIALS = [
  {
    id: "sk-telecom-1",
    src: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop",
    brand: "SK Telecom",
    title: "SK Telecom : AI Help you?",
    subtitle: "한국디지털광고협회 크리에이티브 디지털영상부문 은상",
    num: "(01)",
    medal: false,
    pdfPath: ''
  },
  {
    id: "sk-telecom-2",
    src: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=800&auto=format&fit=crop",
    brand: "SK Telecom",
    title: "SK Telecom : AI Help you?",
    subtitle: "한국디지털광고협회 크리에이티브 디지털영상부문 은상",
    num: "(02)",
    medal: true,
    pdfPath: ''
  },
  {
    id: "aestura-popup",
    src: "https://images.unsplash.com/photo-1611042553365-9b101441c135?w=800&q=80",
    brand: "Aestura",
    title: "Aestura Pop-Up Store",
    subtitle: "Beauty and cosmetics experience",
    num: "(03)",
    medal: false,
    pdfPath: ''
  },
  {
    id: "nike-just-do-it",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    brand: "Nike",
    title: "Just Do It",
    subtitle: "Inspirational campaign 2024",
    num: "(04)",
    medal: true,
    pdfPath: ''
  },
  {
    id: "apple-vision-pro",
    src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80",
    brand: "Apple",
    title: "Vision Pro",
    subtitle: "Spatial computing era",
    num: "(05)",
    medal: false,
    pdfPath: ''
  },
  {
    id: "google-gemini",
    src: "https://images.unsplash.com/photo-1522083165195-3424ed129620?q=80&w=800&auto=format&fit=crop",
    brand: "Google",
    title: "Gemini AI",
    subtitle: "Next gen intelligence",
    num: "(06)",
    medal: true,
    pdfPath: ''
  },
  {
    id: "tesla-model-3",
    src: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80",
    brand: "Tesla",
    title: "Model 3 Highland",
    subtitle: "The electric revolution",
    num: "(07)",
    medal: false,
    pdfPath: ''
  },
  {
    id: "sk-telecom-3",
    src: "https://images.rawpixel.com/image_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTExL3BkbWlzY3Byb2plY3QyOC1wZGhmbGF0b3VyMDAxMjYtaW1hZ2VfMi5qcGc.jpg",
    brand: "SK Telecom",
    title: "SK Telecom : AI Help you?",
    subtitle: "한국디지털광고협회 크리에이티브 디지털영상부문 은상",
    num: "(08)",
    medal: true,
    pdfPath: ''
  },
  {
    id: "samsung-innovation",
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    brand: "Samsung",
    title: "Innovation Forward",
    subtitle: "Technology excellence award 2024",
    num: "(09)",
    medal: true,
    pdfPath: ''
  },
  {
    id: "meta-metaverse",
    src: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80",
    brand: "Meta",
    title: "Metaverse Experience",
    subtitle: "Digital world innovation",
    num: "(10)",
    medal: false,
    pdfPath: ''
  },
];

function formatCredential(c) {
  return {
    id: c.id,
    src: c.src,
    brand: c.brand,
    title: c.title,
    subtitle: c.subtitle,
    num: c.num,
    medal: c.medal,
    pdfPath: c.pdfPath || ''
  };
}

export async function GET() {
  try {
    await dbConnect();
    let credentials = await Credential.find({}).sort({ createdAt: 1 }).lean();

    if (credentials.length === 0) {
      await Credential.insertMany(DEFAULT_CREDENTIALS);
      credentials = await Credential.find({}).sort({ createdAt: 1 }).lean();
    }

    const formattedCredentials = credentials.map(formatCredential);
    return NextResponse.json({ items: formattedCredentials });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'reset') {
      await Credential.deleteMany({});
      await Credential.insertMany(DEFAULT_CREDENTIALS);
      const credentials = await Credential.find({}).sort({ createdAt: 1 }).lean();
      const formattedCredentials = credentials.map(formatCredential);
      return NextResponse.json({ 
        success: true, 
        message: 'Credentials reset successfully',
        items: formattedCredentials 
      });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const deleted = await Credential.findOneAndDelete({ id });
    if (!deleted) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    if (deleted.pdfPath) {
      await deletePdfFile(deleted.pdfPath);
    }

    return NextResponse.json({ success: true, message: 'Credential deleted' });
  } catch (error) {
    console.error('Error deleting credential:', error);
    return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const formData = await request.formData();
    
    const id = formData.get('id') || `credential-${Date.now()}`;
    const brand = formData.get('brand');
    const title = formData.get('title');
    const subtitle = formData.get('subtitle') || '';
    const src = formData.get('src') || '';
    const num = formData.get('num');
    const medal = formData.get('medal') === 'true';
    const pdfFile = formData.get('pdf');

    console.log('POST received:', { id, brand, title, pdfFileName: pdfFile?.name, pdfFileSize: pdfFile?.size });

    if (!brand || !title || !num) {
      return NextResponse.json({ error: 'Brand, title, and num are required' }, { status: 400 });
    }

    let pdfPath = '';
    if (pdfFile && pdfFile.size > 0) {
      pdfPath = await savePdfFile(pdfFile);
      console.log('pdfPath saved:', pdfPath);
    }

    const newCredential = await Credential.create({
      id,
      brand,
      title,
      subtitle,
      src,
      num,
      medal,
      pdfPath
    });

    return NextResponse.json({
      success: true,
      item: formatCredential(newCredential)
    });
  } catch (error) {
    console.error('Error creating credential:', error);
    return NextResponse.json({ error: 'Failed to create credential' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const formData = await request.formData();
    
    const id = formData.get('id');
    const index = formData.get('index') !== null ? parseInt(formData.get('index')) : null;
    const field = formData.get('field');
    const value = formData.get('value');
    const pdfFile = formData.get('pdf');
    const pdfPathFromClient = formData.get('pdfPath');
    const keepExistingPdf = formData.get('keepExistingPdf') === 'true';
    const deletePdf = formData.get('deletePdf') === 'true';

    let credential;
    
    if (id) {
      const updateData = {};
      
      if (field && value !== null) {
        updateData[field] = value;
      }
      
      if (pdfFile && pdfFile.size > 0) {
        const existing = await Credential.findOne({ id });
        if (existing?.pdfPath) {
          await deletePdfFile(existing.pdfPath);
        }
        updateData.pdfPath = await savePdfFile(pdfFile);
      } else if (deletePdf) {
        const existing = await Credential.findOne({ id });
        if (existing?.pdfPath) {
          await deletePdfFile(existing.pdfPath);
        }
        updateData.pdfPath = '';
      } else if (keepExistingPdf && pdfPathFromClient !== undefined) {
        updateData.pdfPath = pdfPathFromClient;
      }
      
      credential = await Credential.findOneAndUpdate(
        { id },
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } else if (typeof index === 'number') {
      const allCredentials = await Credential.find({}).sort({ createdAt: 1 });
      if (index < 0 || index >= allCredentials.length) {
        return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
      }
      
      const updateData = {};
      
      if (field && value !== null) {
        updateData[field] = value;
      }
      
      if (pdfFile && pdfFile.size > 0) {
        const existing = allCredentials[index];
        if (existing?.pdfPath) {
          await deletePdfFile(existing.pdfPath);
        }
        updateData.pdfPath = await savePdfFile(pdfFile);
      } else if (deletePdf) {
        const existing = allCredentials[index];
        if (existing?.pdfPath) {
          await deletePdfFile(existing.pdfPath);
        }
        updateData.pdfPath = '';
      } else if (keepExistingPdf && pdfPathFromClient !== undefined) {
        updateData.pdfPath = pdfPathFromClient;
      }
      
      credential = await Credential.findOneAndUpdate(
        { _id: allCredentials[index]._id },
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } else {
      return NextResponse.json({ error: 'ID or index is required' }, { status: 400 });
    }

    if (!credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      item: formatCredential(credential)
    });
  } catch (error) {
    console.error('Error updating credential:', error);
    return NextResponse.json({ error: 'Failed to update credential' }, { status: 500 });
  }
}
