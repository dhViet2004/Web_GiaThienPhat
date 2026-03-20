import mongoose from 'mongoose';

async function test() {
  try {
    await mongoose.connect('mongodb://admin:secure_password_gtp@127.0.0.1:27017/gtp_db?authSource=admin');
    console.log("SUCCESS WITH AUTH");
  } catch(e) {
    console.log("FAIL WITH AUTH:", e.message);
  }
  
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/gtp_db');
    console.log("SUCCESS WITHOUT AUTH");
  } catch(e) {
    console.log("FAIL WITHOUT AUTH:", e.message);
  }
  process.exit(0);
}
test();
