import { Inter } from 'next/font/google';
import './globals.css';
import IntroAnimation from '../components/IntroAnimation';
import { SmoothScroll } from '../components/SmoothScroll';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Gia Thinh Phat',
  description: 'Gia Thinh Phat Architecture',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <IntroAnimation />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
