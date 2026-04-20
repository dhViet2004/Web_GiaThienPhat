import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email và mật khẩu' },
        { status: 400 }
      );
    }

    let admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    // Auto-create default admin if none exists
    if (!admin) {
      const count = await Admin.countDocuments();
      if (count === 0) {
        admin = await Admin.create({
          email: 'phamchanhthienn@gmail.com',
          password: 'Thien12@',
          name: 'Admin'
        });
      } else {
        return NextResponse.json(
          { error: 'Sai thông tin đăng nhập' },
          { status: 401 }
        );
      }
    }

    if (admin.password !== password) {
      return NextResponse.json(
        { error: 'Sai thông tin đăng nhập' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: admin.toJSON()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

// Auto-create default admin if none exists
export async function GET() {
  try {
    await dbConnect();
    const count = await Admin.countDocuments();
    
    if (count === 0) {
      await Admin.create({
        email: 'phamchanhthienn@gmail.com',
        password: 'Thien12@',
        name: 'Admin'
      });
      return NextResponse.json({ message: 'Default admin created' });
    }
    
    return NextResponse.json({ message: 'Admin already exists' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
