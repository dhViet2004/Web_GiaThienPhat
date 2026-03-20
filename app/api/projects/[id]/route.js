import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Project from '../../../../models/Project';

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Build context: get prev/next project relative to this one (sorted newest first)
    const allProjects = await Project.find({}, '_id createdAt').sort({ createdAt: -1 });
    const ids = allProjects.map(p => p._id.toString());

    const currentIdx = ids.indexOf(id);
    const previousProjectId = currentIdx > 0 ? ids[currentIdx - 1] : null;
    const nextProjectId = currentIdx < ids.length - 1 ? ids[currentIdx + 1] : null;

    return NextResponse.json({
      project,
      previousProjectId,
      nextProjectId
    });
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