import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Project from '../../../models/Project';

export async function GET() {
  try {
    await dbConnect();
    // Sort projects descending by creation date (newest first)
    const projects = await Project.find({}).sort({ createdAt: -1 });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const payload = await req.json();
    
    // Create new project document
    const project = await Project.create(payload);
    
    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo dự án DB:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    await dbConnect();
    const result = await Project.deleteMany({});
    return NextResponse.json({ 
      success: true, 
      message: `Đã xóa ${result.deletedCount} projects` 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
