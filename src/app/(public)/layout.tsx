import Navbar from "@/components/public/navbar";
import Footer from "@/components/public/footer";
import FloatingButtons from "@/components/public/floating-buttons";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingButtons />
    </>
  );
}