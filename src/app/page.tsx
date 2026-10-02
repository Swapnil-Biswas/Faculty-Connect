import ScrollProgress from "@/components/ui/ScrollProgress";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/ui/StatsBar";
import About from "@/components/landing/About";
import Events from "@/components/landing/Events";
import Projects from "@/components/landing/Projects";
import Team from "@/components/landing/Team";
import Resources from "@/components/landing/Resources";
import Domains from "@/components/landing/Domains";
import Partners from "@/components/landing/Partners";
import JoinUs from "@/components/landing/JoinUs";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main>
      <ScrollProgress />
      <Header />
      <Hero />
      <StatsBar />
      <About />
      <Events />
      <Projects />
      <Team />
      <Resources />
      <Domains />
      <Partners />
      <JoinUs />
      <Footer />
    </main>
  );
}