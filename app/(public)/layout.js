import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
