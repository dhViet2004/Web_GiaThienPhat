import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import About from '@/models/About';

const DEFAULT_ABOUT = {
  profile: {
    title: 'GTP',
    subtitle: 'Profile',
    vi: {
      fedl: 'FEDL = Far East Design Lab.',
      paragraph1: 'Looking at the world with curiosity. Referencing things from all ages and cultures without prejudice, digesting them, and freely transforming them into new outputs. A hands-on approach to realizing ideas, valuing teamwork and craftsmanship. Creating things with a generous yet delicate touch. Coexisting harmoniously with nature.',
      paragraph2: 'Without worrying about mainstream trends, maintaining an objective and grounded perspective, facing future changes without fear, we continuously think about what we can do for people and the environment.',
    },
    en: {
      fedl: 'FEDL = Far East Design Lab.',
      paragraph1: 'Look to the outer world with plain curiosity. Juxtapose all sorts of information, tradition and modernity and freely convert it into a new output. Cherish and treasure on-the-spot-decision-making, team work and craftsmanship. Produce delicate and sophisticated finishings with a big-hearted attitude.',
      paragraph2: 'Disregard mainstream trends and keep focused on how to objectively contribute to a better environment for the future. These are the mottos of FEDL.',
    },
  },
  business: {
    domains: [
      'Land Use Planning & Consulting',
      'Architectural Design & Supervision',
      'Renovation',
      'Commercial Design',
      'Landscape Design',
      'Graphic Design & Others',
    ],
    description: 'Based on our extensive experience in architectural design, renovation, and interior design for residences, apartment buildings, commercial facilities, corporate offices, and shops, we accept consultations for all kinds of requests and provide comprehensive planning. We also assist with consultations in the early, undefined stages of a project, including asset utilization and regional revitalization.',
  },
  people: [
    {
      name: 'Takanori Ihara',
      role: 'CEO / Architect',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=300&auto=format&fit=crop',
      bio: 'Born in Osaka in 1965. After graduating from Kanto Gakuin University, he worked at an architectural firm managing projects for commercial buildings, private residences, commercial facility developments, and corporate headquarters. He later joined Noriaki Okabe Architecture Network, where he participated in projects such as the Nagaoka Cultural Creation Forum and Odakyu Romancecar VSE. After establishing his own practice, his work included designing private residences, developing movable low-cost container housing, master planning for a Palau resort development, and the Airai State low-cost housing project. In 2009, the firm was renamed Far East Design Lab (FEDL). His hobbies include cooking.',
      category: 'Founder',
      order: 0,
    },
    {
      name: 'Ken Saryo',
      role: 'Architect',
      image: '',
      bio: '',
      category: 'Architect',
      order: 1,
    },
    {
      name: 'Ami Sato',
      role: 'Architect',
      image: '',
      bio: '',
      category: 'Architect',
      order: 2,
    },
    {
      name: 'Kaoru Kobanawa',
      role: 'Architect',
      image: '',
      bio: '',
      category: 'Architect',
      order: 3,
    },
    {
      name: 'Asuka Kanazawa',
      role: 'Architect',
      image: '',
      bio: '',
      category: 'Architect',
      order: 4,
    },
    {
      name: 'Ren Iwaya',
      role: 'Architect',
      image: '',
      bio: '',
      category: 'Architect',
      order: 5,
    },
    {
      name: 'Saho Furuyama',
      role: 'Architect',
      image: '',
      bio: '',
      category: 'Architect',
      order: 6,
    },
    {
      name: 'Kanaru Imura',
      role: 'Architect',
      image: '',
      bio: '',
      category: 'Architect',
      order: 7,
    },
    {
      name: 'Kikuko Ohba',
      role: 'Finance / Administration',
      image: '',
      bio: '',
      category: 'Finance',
      order: 8,
    },
    {
      name: 'Tomoko Ihara',
      role: 'Director / Designer',
      image: '',
      bio: '',
      category: 'Director',
      order: 9,
    },
    {
      name: 'Satoshi Katagata',
      role: 'Collaborative Architect',
      image: '',
      bio: '',
      category: 'Collaborative',
      order: 10,
    },
    {
      name: 'Akihiro Sekiya',
      role: 'Collaborative Architect',
      image: '',
      bio: '',
      category: 'Collaborative',
      order: 11,
    },
  ],
  office: {
    companyName: 'Far East Design Lab.',
    capital: '4,000,000 JPY',
    registration: 'First-Class Architect Office, Registered by the Governor of Tokyo No. 55769',
    address: '1F Cercle Akasaka, 4-2-25 Akasaka, Minato-ku, Tokyo',
    mapUrl: 'https://maps.app.goo.gl/a3kZdYDKsCECKe4j9',
    tel: '03-3585-5573',
    fax: '03-3585-5574',
    stationAccess: [
      'Approx. 3-minute walk from Akasaka-mitsuke Station (Ginza Line)',
      'Approx. 7-minute walk from Nagatacho Station (Hanzomon Line)',
      'Approx. 9-minute walk from Akasaka Station (Chiyoda Line)',
      'Approx. 13-minute walk from Tameike-sanno Station (Namboku Line)',
      'Approx. 15-minute walk from Aoyama-itchome Station (Oedo Line)',
    ],
  },
  footer: {
    socials: [
      { name: 'Pinterest', url: '#' },
      { name: 'Instagram', url: '#' },
      { name: 'Facebook', url: '#' },
      { name: 'Twitter', url: '#' },
    ],
    copyright: 'Far East Design Lab.',
  },
};

export async function GET(req) {
  try {
    await dbConnect();
    let about = await About.findOne().lean();

    if (!about) {
      about = await About.create(DEFAULT_ABOUT);
    }

    return Response.json(about);
  } catch (error) {
    console.error('GET /api/about error:', error);
    return Response.json({ error: 'Failed to fetch about data' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const about = await About.findOneAndUpdate(
      {},
      { ...body, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );
    return Response.json(about);
  } catch (error) {
    console.error('PUT /api/about error:', error);
    return Response.json({ error: 'Failed to update about data' }, { status: 500 });
  }
}
