import { Inter } from 'next/font/google';
import './globals.css';
import { SmoothScroll } from '../components/SmoothScroll';

const inter = Inter({ subsets: ['latin'] });
const tabLogoUrl =
  'https://res.cloudinary.com/dh1o42tjk/image/upload/v1774340283/LOgo_evvhb5.png';

export const metadata = {
  title: 'Gia Thien Phat',
  description: 'Gia Thien Phat Architecture',
  icons: {
    icon: tabLogoUrl,
    shortcut: tabLogoUrl,
    apple: tabLogoUrl,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
