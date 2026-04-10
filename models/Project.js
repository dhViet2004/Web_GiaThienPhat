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

// 定义项目分类枚举
const CATEGORY_ENUM = ['Landscape', 'Engineering', 'Architecture', 'Products'];

// Định nghĩa Mixed Schema cho các Block ngang bất kỳ (Schema-less linh hoạt cho Block)
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

// ProjectSchema 定义（每次导出时重新定义以确保最新）
const ProjectSchema = new mongoose.Schema({
  // category 字段用于分类筛选：Landscape, Engineering, Architecture, Products
  category: { 
    type: String, 
    enum: CATEGORY_ENUM, 
    default: 'Architecture' 
  },
  // subcategory: Danh mục con - Public Space, Parks, Planning, Structural, BIM, Green Tech, Cultural, Residential, Office, Hospitality, Furniture, Lighting, Installation
  subcategory: { 
    type: String, 
    default: '' 
  },
  general: GeneralSchema,
  blocks: [BlockSchema]
}, { timestamps: true });

// 强制删除缓存的模型，确保使用最新 schema
if (mongoose.models.Project) {
  delete mongoose.models.Project;
}

const Project = mongoose.model('Project', ProjectSchema);

export default Project;
