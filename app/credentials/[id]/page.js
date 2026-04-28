import CredentialsDetail from '../../../components/CredentialsDetail';

async function getCredential(id) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/admin/credentials/${id}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.item || null;
  } catch (error) {
    console.error('Error fetching credential:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  // Await params in Next.js 15+
  const { id } = await params;
  const credential = await getCredential(id);
  
  if (!credential) {
    return {
      title: 'Credential Not Found',
    };
  }

  return {
    title: `${credential.title} - ${credential.brand}`,
    description: credential.subtitle || `View credential: ${credential.title}`,
  };
}

export default async function Page({ params }) {
  // Await params in Next.js 15+
  const { id } = await params;
  const credential = await getCredential(id);
  
  return <CredentialsDetail credential={credential} />;
}
