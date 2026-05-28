import './globals.css';
import { SmoothScroll } from '../components/SmoothScroll';

const tabLogoUrl =
  'https://res.cloudinary.com/dh1o42tjk/image/upload/v1776845819/LOgo_hrzqlc.png';

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
      <body>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
