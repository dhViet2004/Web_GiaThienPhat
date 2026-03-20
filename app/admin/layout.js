import AdminClientLayout from './AdminClientLayout';

export const metadata = {
  title: 'GTP ADMIN | PROJECT MANAGEMENT',
  description: 'Admin Portal for Gia Thinh Phat Architecture',
};

export default function AdminLayout({ children }) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
