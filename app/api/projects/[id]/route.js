import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Project from '../../../../models/Project';

export async function GET(req, { params }) {
  try {
    await dbConnect();

    // FIX TẠI ĐÂY: Mở khóa params bằng await trước khi sử dụng
    const { id } = await params;

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    // FIX TẠI ĐÂY
    const { id } = await params;

    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    // FIX TẠI ĐÂY
    const { id } = await params;
    const payload = await req.json();

    const updatedProject = await Project.findByIdAndUpdate(id, payload, {
      new: true, // Return updated document
      runValidators: true // Enforce schema validations on update
    });

    if (!updatedProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}