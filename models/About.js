import mongoose from 'mongoose';

const AboutSchema = new mongoose.Schema({
  // Profile section
  profile: {
    title: { type: String, default: 'GTP' },
    subtitle: { type: String, default: 'Profile' },
    vi: {
      fedl: { type: String, default: 'FEDL = Far East Design Lab.' },
      paragraph1: { type: String, default: '' },
      paragraph2: { type: String, default: '' },
    },
    en: {
      fedl: { type: String, default: '' },
      paragraph1: { type: String, default: '' },
      paragraph2: { type: String, default: '' },
    },
  },

  // Business section
  business: {
    domains: [{ type: String, default: '' }],
    description: { type: String, default: '' },
  },

  // People section
  people: [{
    name: { type: String, default: '' },
    role: { type: String, default: '' },
    image: { type: String, default: '' },
    bio: { type: String, default: '' },
    category: { type: String, default: '' },
    order: { type: Number, default: 0 },
  }],

  // Office section
  office: {
    companyName: { type: String, default: 'Far East Design Lab.' },
    capital: { type: String, default: '4,000,000 JPY' },
    registration: { type: String, default: '' },
    address: { type: String, default: '' },
    mapUrl: { type: String, default: '' },
    tel: { type: String, default: '' },
    fax: { type: String, default: '' },
    stationAccess: [{ type: String, default: '' }],
  },

  // Footer
  footer: {
    socials: [{ name: { type: String, default: '' }, url: { type: String, default: '#' } }],
    copyright: { type: String, default: 'Far East Design Lab.' },
  },

  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.About || mongoose.model('About', AboutSchema);
