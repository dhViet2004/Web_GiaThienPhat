import mongoose from 'mongoose';

const CredentialSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  src: { type: String, default: '' },
  brand: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  num: { type: String, default: '' },
  medal: { type: Boolean, default: false },
  pdfPath: { type: String, default: '' }
}, { timestamps: true });

if (mongoose.models.Credential) {
  delete mongoose.models.Credential;
}

const Credential = mongoose.model('Credential', CredentialSchema);

export default Credential;
