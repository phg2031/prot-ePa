import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import '@rainbow-me/rainbowkit/styles.css';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Decentral Medical Record',
  description: 'Bachelors Project for using Blockchain-Technologies',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
