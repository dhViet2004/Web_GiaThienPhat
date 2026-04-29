'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import GtpLogo from '../../components/GtpLogo';
import { apiGet } from '@/lib/api';

const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Default content in case API fails mock data
const DEFAULT_DATA = {
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
    description: 'Based on our extensive experience in architectural design, renovation, and interior design for residences, apartment buildings, commercial facilities, corporate offices, and shops, we accept consultations for all kinds of requests and provide comprehensive planning.',
  },
  people: [
    {
      name: 'Takanori Ihara',
      role: 'CEO / Architect',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=300&auto=format&fit=crop',
      bio: 'Born in Osaka in 1965. After graduating from Kanto Gakuin University, he worked at an architectural firm managing projects for commercial buildings, private residences, commercial facility developments, and corporate headquarters.',
      category: 'Founder',
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

export default function AboutPage() {
  const [navVisible, setNavVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutData, setAboutData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setNavVisible(true);
    loadAbout();
  }, []);

  const loadAbout = async () => {
    try {
      const data = await apiGet('/api/about');
      if (data) {
        setAboutData(data);
      }
    } catch (err) {
      console.error('Error loading about data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group people by category
  const groupedPeople = aboutData.people.reduce((acc, person) => {
    const cat = person.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(person);
    return acc;
  }, {});

  const categoryLabels = {
    'Founder': 'Founder',
    'Architect': 'Architect',
    'Finance': 'Finance / Administration',
    'Director': 'Director / Designer',
    'Collaborative': 'Collaborative Architect',
  };

  return (
    <div className="min-h-screen selection:bg-[#1a1a1a] selection:text-[#fcfcf7] font-sans text-[#2d2d2b] bg-[#F2F2ED]">
      {/* HEADER */}
      <header className={`fixed top-0 left-0 w-full z-[900] bg-[#F2F2ED] transition-opacity duration-[1500ms] ${navVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative flex justify-between items-center px-[20px] lg:px-[35px] pt-[22px] lg:pt-[24px] pb-4">

          {/* MOBILE: Hamburger + Left Drawer */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-0 bg-transparent border-none outline-none relative z-[1001]"
              aria-label="Toggle Menu"
            >
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <line x1="2" y1="2" x2="16" y2="16" stroke="black" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="2" y2="16" stroke="black" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
                  <line x1="0" y1="1" x2="22" y2="1" stroke="black" strokeWidth="2"/>
                  <line x1="0" y1="7" x2="22" y2="7" stroke="black" strokeWidth="2"/>
                  <line x1="0" y1="13" x2="22" y2="13" stroke="black" strokeWidth="2"/>
                </svg>
              )}
            </button>

            {/* Left Menu Drawer */}
            <div
              className={`fixed top-0 left-0 bottom-0 z-[1000] w-[200px] bg-[#F2F2ED] flex flex-col pt-[70px] px-[25px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                menuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Product', href: '/' },
                  { label: 'About', href: '/about' },
                  { label: 'Credentials', href: '/credentials' },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-[13px] font-semibold uppercase text-[#6b6b6b] hover:text-black py-2 tracking-widest transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* MOBILE: Center Logo */}
          <div className="md:hidden absolute left-1/2 -translate-x-1/2 z-[1001]">
            <Link href="/" className="block">
              <svg width="32" height="14" viewBox="0 0 216 98" className="w-auto h-[14px]">
                <line x1="0" y1="8" x2="60" y2="8" stroke="black" strokeWidth="16" />
                <line x1="0" y1="90" x2="60" y2="90" stroke="black" strokeWidth="16" />
                <line x1="8" y1="8" x2="8" y2="90" stroke="black" strokeWidth="16" />
                <line x1="52" y1="49" x2="52" y2="90" stroke="black" strokeWidth="16" />
                <line x1="26" y1="49" x2="60" y2="49" stroke="black" strokeWidth="16" />
                <line x1="78" y1="8" x2="138" y2="8" stroke="black" strokeWidth="16" />
                <line x1="108" y1="8" x2="108" y2="90" stroke="black" strokeWidth="16" />
                <line x1="156" y1="8" x2="216" y2="8" stroke="black" strokeWidth="16" />
                <line x1="156" y1="49" x2="216" y2="49" stroke="black" strokeWidth="16" />
                <line x1="164" y1="8" x2="164" y2="90" stroke="black" strokeWidth="16" />
                <line x1="208" y1="8" x2="208" y2="49" stroke="black" strokeWidth="16" />
              </svg>
            </Link>
          </div>

          {/* DESKTOP: Logo (Left) with Sidebar Menu */}
          <div className="hidden md:block absolute left-[35px] z-[1001]">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative z-[1002] p-0 bg-transparent border-none outline-none hover:opacity-70 transition-opacity"
              aria-label="Toggle Menu"
            >
              <GtpLogo />
            </button>

            {/* Desktop Sidebar Menu - Slides from left */}
            <nav
              className={`fixed top-0 bottom-0 left-0 z-[1000] flex flex-col gap-0.5 bg-[#F2F2ED] pt-[70px] pl-[30px] lg:pl-[30px] pr-10 transition-all duration-300 ${
                menuOpen
                  ? 'translate-x-0 opacity-100 pointer-events-auto'
                  : '-translate-x-full opacity-0 pointer-events-none'
              }`}
            >
              <Link
                href="/"
                onClick={() => {
                  setMenuOpen(false);
                }}
                className="text-sm uppercase opacity-50 transition-opacity hover:opacity-100"
              >
                Product
              </Link>
              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="text-sm uppercase opacity-50 transition-opacity hover:opacity-100"
              >
                About
              </Link>
              <Link
                href="/credentials"
                onClick={() => setMenuOpen(false)}
                className="text-sm uppercase opacity-50 transition-opacity hover:opacity-100"
              >
                Credentials
              </Link>
            </nav>
          </div>

        </div>
      </header>

      <main className="pt-40 md:pt-56">
        {/* First Section: Profile */}
        <section className="px-6 md:px-12 max-w-screen-xl mx-auto mb-32 md:mb-48">
          <FadeIn>
            <h1 className="text-[12vw] md:text-[10vw] lg:text-[8rem] text-center font-['Inter'] mb-16 md:mb-32 tracking-tighter leading-none flex items-center justify-center flex-wrap">
              <span className="mr-[0.2em] inline-block">{aboutData.profile.title}</span>
              <span className="inline-block">{aboutData.profile.subtitle}</span>
            </h1>
          </FadeIn>
          
          <div className="flex flex-col items-center gap-16 md:gap-24">
            <div className="max-w-xl w-full px-4 md:px-0">
              <FadeIn delay={0.1}>
                <div className="space-y-8 text-sm md:text-[15px] leading-loose tracking-wide text-left">
                  {aboutData.profile.vi.fedl && (
                    <p>
                      <span className="block">{aboutData.profile.vi.fedl}</span>
                    </p>
                  )}
                  {aboutData.profile.vi.paragraph1 && (
                    <p>
                      <span className="block">{aboutData.profile.vi.paragraph1}</span>
                    </p>
                  )}
                  {aboutData.profile.vi.paragraph2 && (
                    <p>
                      <span className="block">{aboutData.profile.vi.paragraph2}</span>
                    </p>
                  )}
                </div>
              </FadeIn>
              <FadeIn delay={0.2} className="font-['Inter'] text-[#8d8d8a] mt-16 md:mt-24">
                <div className="space-y-8 text-sm md:text-[15px] leading-relaxed md:leading-loose text-left">
                  {aboutData.profile.en.fedl && (
                    <p>
                      <span className="block">{aboutData.profile.en.fedl}</span>
                    </p>
                  )}
                  {aboutData.profile.en.paragraph1 && (
                    <p>
                      <span className="block">{aboutData.profile.en.paragraph1}</span>
                    </p>
                  )}
                  {aboutData.profile.en.paragraph2 && (
                    <p>
                      <span className="block">{aboutData.profile.en.paragraph2}</span>
                    </p>
                  )}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Second Section: Business Contents */}
        <section className="py-24 md:py-40 px-6 md:px-12 max-w-screen-2xl mx-auto border-t border-[#2d2d2b]/20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 min-h-[50vh]">
            <div className="lg:col-span-1 lg:pl-12 self-start md:sticky top-24 md:top-28 z-10">
              <FadeIn>
                <h2 className="text-xl md:text-2xl font-['Inter'] tracking-tight flex items-center gap-4">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#2d2d2b] shrink-0 mt-1"></span>
                  Business Contents
                </h2>
              </FadeIn>
            </div>
            
            <div className="hidden lg:block lg:col-span-1"></div>
            
            <div className="lg:col-span-1 flex flex-col">
              <FadeIn>
                <h3 className="mb-10 font-bold text-[16px] tracking-widest uppercase">Business Domains</h3>
                <ul className="text-[15px] tracking-wide w-full">
                  {aboutData.business.domains.map((item, idx) => (
                    <li key={idx} className="py-5 border-b border-[#2d2d2b]/20">{item}</li>
                  ))}
                </ul>
              </FadeIn>

              {aboutData.business.description && (
                <FadeIn delay={0.1}>
                  <p className="text-[14px] md:text-[15px] leading-loose tracking-wide pt-12 text-[#2d2d2b] text-justify">
                    {aboutData.business.description}
                  </p>
                </FadeIn>
              )}
            </div>
          </div>
        </section>

        {/* Third Section: People */}
        <section className="py-24 md:py-40 px-6 md:px-12 max-w-screen-2xl mx-auto border-t border-[#2d2d2b]/20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 min-h-[50vh]">
            <div className="lg:col-span-1 lg:pl-12 self-start md:sticky top-24 md:top-28 z-10">
              <FadeIn>
                <h2 className="text-xl md:text-2xl font-['Inter'] tracking-tight flex items-center gap-4">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#2d2d2b] shrink-0 mt-1"></span>
                  People
                </h2>
              </FadeIn>
            </div>
            
            <div className="lg:col-span-2">
              {/* Render founder profile (first person with Founder category) */}
              {aboutData.people.filter(p => p.category === 'Founder').map((person, idx) => (
                <FadeIn key={person.name + idx}>
                  <div className="mb-20 pb-20 border-b border-[#2d2d2b]/10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10">
                      <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden shrink-0 border border-[#2d2d2b]/10">
                        {person.image ? (
                          <img 
                            src={person.image}
                            alt={person.name} 
                            className="w-full h-full object-cover transition-opacity duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-medium mb-1 tracking-wide">{person.name}</h3>
                        <p className="text-[13px] text-[#8d8d8a] mb-2 tracking-wide font-medium">{person.role}</p>
                      </div>
                    </div>
                    {person.bio && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 text-sm md:text-[15px] leading-loose tracking-wide text-justify">
                        <p>{person.bio}</p>
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}

              {/* Team members by category */}
              <div className="flex flex-col gap-y-16">
                {['Architect', 'Finance', 'Director', 'Collaborative'].map((cat) => {
                  const members = groupedPeople[cat] || [];
                  if (members.length === 0) return null;
                  return (
                    <FadeIn key={cat} delay={0.1}>
                      <h4 className="font-['Inter'] text-[15px] mb-8">{categoryLabels[cat]}</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-8 text-[15.5px] tracking-wide">
                        {members.map((member, idx) => (
                          <li key={member.name + idx} className="flex items-baseline">
                            <span className="font-medium whitespace-nowrap">{member.name}</span>
                          </li>
                        ))}
                      </ul>
                    </FadeIn>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Fourth Section: Office */}
        <section className="py-24 md:py-40 px-6 md:px-12 max-w-screen-2xl mx-auto border-t border-b border-[#2d2d2b]/20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 min-h-[50vh]">
            <div className="lg:col-span-4 lg:pl-12 self-start md:sticky top-24 md:top-28 z-10">
              <FadeIn>
                <h2 className="text-xl md:text-2xl font-['Inter'] tracking-tight flex items-center gap-4">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#2d2d2b] shrink-0 mt-1"></span>
                  Office
                </h2>
              </FadeIn>
            </div>
            
            <div className="lg:col-span-8">
              <ul className="space-y-16">
                <FadeIn>
                  <li className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pb-16 border-b border-[#2d2d2b]/20">
                    <div>
                      <h3 className="text-[15px] font-medium mb-1 tracking-widest uppercase">Company Profile</h3>
                      <p className="text-[13px] font-['Inter'] text-[#8d8d8a]">{aboutData.office.companyName}</p>
                    </div>
                    <div className="space-y-3 text-[14px] md:text-[15px] leading-relaxed tracking-wide">
                       {aboutData.office.capital && <p>Capital: {aboutData.office.capital}</p>}
                       {aboutData.office.registration && <p>{aboutData.office.registration}</p>}
                       {aboutData.office.address && (
                         <a href={aboutData.office.mapUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1 group cursor-pointer hover:opacity-70 transition-opacity mt-4">
                           <span>{aboutData.office.address}</span>
                           <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 mt-1" />
                         </a>
                       )}
                       {aboutData.office.tel && <p className="font-['Inter'] mt-2">Tel : <a href={`tel:${aboutData.office.tel}`} className="hover:opacity-70 transition-opacity">{aboutData.office.tel}</a></p>}
                       {aboutData.office.fax && <p className="font-['Inter']">Fax : {aboutData.office.fax}</p>}
                    </div>
                  </li>
                </FadeIn>
                {aboutData.office.stationAccess.length > 0 && (
                  <FadeIn delay={0.1}>
                    <li className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pb-16 border-b border-[#2d2d2b]/20">
                      <div>
                        <h3 className="text-[15px] font-medium mb-1 tracking-widest uppercase">Location</h3>
                        <p className="text-[13px] font-['Inter'] text-[#8d8d8a]">Station Access</p>
                      </div>
                      <div className="space-y-3 text-[14px] md:text-[15px] leading-relaxed tracking-wide">
                        {aboutData.office.stationAccess.map((station, idx) => (
                          <p key={idx}>{station}</p>
                        ))}
                      </div>
                    </li>
                  </FadeIn>
                )}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#fcfcf7] pt-32 md:pt-48 pb-12 px-6 md:px-12 w-full">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 mb-24 md:mb-40">
            <div className="hidden md:block"></div>
            <div>
              <div className="text-[8vw] md:text-[5vw] lg:text-[4vw] xl:text-[4.5vw] leading-[1.1] font-['Inter'] tracking-tighter text-[#2d2d2b] flex items-center justify-start -ml-[1vw] lg:-ml-4">
                 <span className="font-normal mr-[2vw] md:mr-3">&copy;</span> <span className="shrink-0 whitespace-nowrap">{aboutData.footer.copyright}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-32 md:mb-56 items-end">
            <div className="flex flex-col items-start order-2 md:order-1">
              <Link href="/" className="inline-flex items-center gap-3 border border-[#2d2d2b]/20 rounded-full py-4 px-8 hover:bg-[#2d2d2b] hover:text-[#fcfcf7] transition-colors text-[14px] md:text-[15px] font-['Inter'] tracking-wide w-max group">
                Let&apos;s Talk <ArrowRight size={16} strokeWidth={1.5} className="font-light group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="hidden md:block order-2"></div>

            <div className="flex flex-col w-full order-1 md:order-3">
              <ul className="flex flex-col w-full">
                {aboutData.footer.socials.map((social, idx) => (
                  <li key={social.name + idx}>
                    <a href={social.url} className="flex items-center justify-between py-5 border-t border-[#2d2d2b]/20 hover:opacity-60 transition-opacity text-[15px] font-['Inter'] tracking-wide group">
                      <span>{social.name}</span>
                      <ArrowUpRight size={16} strokeWidth={1.5} className="shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>
                  </li>
                ))}
                <li className="border-t border-[#2d2d2b]/20"></li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-end">
             <div className="lg:col-span-5 flex items-center">
             </div>
             <div className="lg:col-span-7 flex flex-row items-center justify-end font-['Inter'] text-[14px]">
               <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="flex items-center gap-2 hover:opacity-60 transition-opacity group">
                  <ArrowRight size={14} className="-rotate-90 group-hover:-translate-y-1 transition-transform" />
                  Back to Top
               </button>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
