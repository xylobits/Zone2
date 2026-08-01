import '@/styles/landing.css';
import { Nav } from '@/components/marketing/Nav';
import { Hero } from '@/components/marketing/Hero';
import { Method } from '@/components/marketing/Method';
import { Connect } from '@/components/marketing/Connect';
import { Stats } from '@/components/marketing/Stats';
import { Cta } from '@/components/marketing/Cta';
import { Footer } from '@/components/marketing/Footer';

export default function MarketingPage() {
  return (
    <div className="marketing">
      <Nav />
      <main id="top">
        <Hero />
        <Method />
        <Connect />
        <Stats />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
