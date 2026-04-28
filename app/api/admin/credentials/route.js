import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Credential from '@/models/Credential';

const DEFAULT_CREDENTIALS = [
  {
    id: "sk-telecom-1",
    src: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop",
    brand: "SK Telecom",
    title: "SK Telecom : AI Help you?",
    subtitle: "한국디지털광고협회 크리에이티브 디지털영상부문 은상",
    num: "(01)",
    medal: false
  },
  {
    id: "sk-telecom-2",
    src: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=800&auto=format&fit=crop",
    brand: "SK Telecom",
    title: "SK Telecom : AI Help you?",
    subtitle: "한국디지털광고협회 크리에이티브 디지털영상부문 은상",
    num: "(02)",
    medal: true
  },
  {
    id: "aestura-popup",
    src: "https://images.unsplash.com/photo-1611042553365-9b101441c135?w=800&q=80",
    brand: "Aestura",
    title: "Aestura Pop-Up Store",
    subtitle: "Beauty and cosmetics experience",
    num: "(03)",
    medal: false
  },
  {
    id: "nike-just-do-it",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    brand: "Nike",
    title: "Just Do It",
    subtitle: "Inspirational campaign 2024",
    num: "(04)",
    medal: true
  },
  {
    id: "apple-vision-pro",
    src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80",
    brand: "Apple",
    title: "Vision Pro",
    subtitle: "Spatial computing era",
    num: "(05)",
    medal: false
  },
  {
    id: "google-gemini",
    src: "https://images.unsplash.com/photo-1522083165195-3424ed129620?q=80&w=800&auto=format&fit=crop",
    brand: "Google",
    title: "Gemini AI",
    subtitle: "Next gen intelligence",
    num: "(06)",
    medal: true
  },
  {
    id: "tesla-model-3",
    src: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80",
    brand: "Tesla",
    title: "Model 3 Highland",
    subtitle: "The electric revolution",
    num: "(07)",
    medal: false
  },
  {
    id: "sk-telecom-3",
    src: "https://images.rawpixel.com/image_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTExL3BkbWlzY3Byb2plY3QyOC1wZGhmbGF0b3VyMDAxMjYtaW1hZ2VfMi5qcGc.jpg",
    brand: "SK Telecom",
    title: "SK Telecom : AI Help you?",
    subtitle: "한국디지털광고협회 크리에이티브 디지털영상부문 은상",
    num: "(08)",
    medal: true
  },
  {
    id: "samsung-innovation",
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    brand: "Samsung",
    title: "Innovation Forward",
    subtitle: "Technology excellence award 2024",
    num: "(09)",
    medal: true
  },
  {
    id: "meta-metaverse",
    src: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80",
    brand: "Meta",
    title: "Metaverse Experience",
    subtitle: "Digital world innovation",
    num: "(10)",
    medal: false
  },
];

export async function GET() {
  try {
    await dbConnect();
    let credentials = await Credential.find({}).sort({ createdAt: 1 }).lean();

    if (credentials.length === 0) {
      await Credential.insertMany(DEFAULT_CREDENTIALS);
      credentials = await Credential.find({}).sort({ createdAt: 1 }).lean();
    }

    const formattedCredentials = credentials.map(c => ({
      id: c.id,
      src: c.src,
      brand: c.brand,
      title: c.title,
      subtitle: c.subtitle,
      num: c.num,
      medal: c.medal
    }));

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
      const formattedCredentials = credentials.map(c => ({
        id: c.id,
        src: c.src,
        brand: c.brand,
        title: c.title,
        subtitle: c.subtitle,
        num: c.num,
        medal: c.medal
      }));
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

    return NextResponse.json({ success: true, message: 'Credential deleted' });
  } catch (error) {
    console.error('Error deleting credential:', error);
    return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, brand, title, subtitle, src, num, medal } = body;

    if (!brand || !title || !num) {
      return NextResponse.json({ error: 'Brand, title, and num are required' }, { status: 400 });
    }

    const newCredential = await Credential.create({
      id: id || `credential-${Date.now()}`,
      brand,
      title,
      subtitle: subtitle || '',
      src: src || '',
      num,
      medal: medal || false
    });

    return NextResponse.json({
      success: true,
      item: {
        id: newCredential.id,
        src: newCredential.src,
        brand: newCredential.brand,
        title: newCredential.title,
        subtitle: newCredential.subtitle,
        num: newCredential.num,
        medal: newCredential.medal
      }
    });
  } catch (error) {
    console.error('Error creating credential:', error);
    return NextResponse.json({ error: 'Failed to create credential' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, index, field, value } = body;

    let credential;
    
    if (id) {
      credential = await Credential.findOneAndUpdate(
        { id },
        { $set: { [field]: value } },
        { new: true, runValidators: true }
      );
    } else if (typeof index === 'number') {
      const allCredentials = await Credential.find({}).sort({ createdAt: 1 });
      if (index < 0 || index >= allCredentials.length) {
        return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
      }
      credential = await Credential.findOneAndUpdate(
        { _id: allCredentials[index]._id },
        { $set: { [field]: value } },
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
      item: {
        id: credential.id,
        src: credential.src,
        brand: credential.brand,
        title: credential.title,
        subtitle: credential.subtitle,
        num: credential.num,
        medal: credential.medal
      }
    });
  } catch (error) {
    console.error('Error updating credential:', error);
    return NextResponse.json({ error: 'Failed to update credential' }, { status: 500 });
  }
}
