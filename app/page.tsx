import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Usp from "@/components/sections/Usp";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/ui/Footer";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <Divider />
        <Services />
        <Divider />
        <Usp />
        <Divider />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function Divider() {
  return (
    <div aria-hidden className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  );
}
