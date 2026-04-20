import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  name: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Remove password from JSON output
AdminSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

if (mongoose.models.Admin) {
  delete mongoose.models.Admin;
}

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;
