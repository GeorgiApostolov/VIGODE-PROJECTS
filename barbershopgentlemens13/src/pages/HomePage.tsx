import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { Hero } from "../components/Hero";
import { Services } from "../components/Services";
import { Team } from "../components/Team";
import { Gallery } from "../components/Gallery";
import { About } from "../components/About";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const scrollTo = searchParams.get("scrollTo");
    if (scrollTo) {
      const timer = setTimeout(() => {
        const element = document.getElementById(scrollTo);
        if (element) {
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });

          setSearchParams({});
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <Hero />
      <Services />
      <Team />
      <Gallery />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
