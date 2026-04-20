import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

async function seedAdmin() {
  await dbConnect();

  const existingAdmin = await Admin.findOne({ email: 'phamchanhthienn@gmail.com' });
  
  if (!existingAdmin) {
    const admin = new Admin({
      email: 'phamchanhthienn@gmail.com',
      password: 'Thien12@',
      name: 'Admin'
    });
    await admin.save();
    console.log('Default admin created successfully');
  } else {
    console.log('Admin already exists');
  }
}

seedAdmin().catch((err) => {
  console.error('Error seeding admin:', err);
  process.exit(1);
});
