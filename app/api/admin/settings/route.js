import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET() {
  try {
    await dbConnect();
    const admin = await Admin.findOne({});
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Không tìm thấy tài khoản admin' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, admin: admin.toJSON() });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu không được để trống' },
        { status: 400 }
      );
    }

    const admin = await Admin.findOneAndUpdate(
      {},
      { email, password, name },
      { new: true, upsert: true }
    );

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
