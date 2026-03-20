import mongoose from 'mongoose';

// Schema cho General Info
const GeneralSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, default: '' },
  client: { type: String, default: '' },
  typology: { type: String, default: '' },
  status: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  icon: { type: String, default: 'Building2' }
}, { _id: false });

// Định nghĩa Mixed Schema cho các Block ngang bất kỳ (Schema-less linh hoạt cho Block)
// Cách tiếp cận này giúp thêm/bớt type dễ dàng trên UI mà không cần sửa cứng Schema
const BlockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true, enum: ['text', 'image', 'slider', 'video', 'credits'] },
  
  // Text block
  content: { type: String },

  // Image block
  url: { type: String },
  caption: { type: String },

  // Slider block
  slides: [{
    url: { type: String },
    caption: { type: String }
  }],

  // Video block
  iframeUrl: { type: String },

  // Credits block
  roles: [{
    roleName: { type: String },
    people: { type: String }
  }]
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  general: GeneralSchema,
  blocks: [BlockSchema]
}, { timestamps: true });

// Ngăn Mongoose build đè Schema nếu gọi nhiều lần trong Next.js API Routes (hot reload)
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

export default Project;
