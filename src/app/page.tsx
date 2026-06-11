import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Dashboard } from "@/components/worldcup/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground selection:bg-green-500 selection:text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
}
