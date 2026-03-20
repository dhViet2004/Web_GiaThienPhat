import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Project from '../../../../models/Project';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const project = await Project.findById(params.id);
    
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
    const deletedProject = await Project.findByIdAndDelete(params.id);
    
    if (!deletedProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, id: params.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const payload = await req.json();
    
    const updatedProject = await Project.findByIdAndUpdate(params.id, payload, {
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
