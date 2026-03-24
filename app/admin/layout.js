import AdminClientLayout from './AdminClientLayout';

const tabLogoUrl =
  'https://res.cloudinary.com/dh1o42tjk/image/upload/v1774340283/LOgo_evvhb5.png';

export const metadata = {
  title: 'GTP ADMIN | PROJECT MANAGEMENT',
  description: 'Admin Portal for Gia Thien Phat Architecture',
  icons: {
    icon: tabLogoUrl,
    shortcut: tabLogoUrl,
    apple: tabLogoUrl,
  },
};

export default function AdminLayout({ children }) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
