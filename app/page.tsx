'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Crown, Target, Zap, ChevronRight } from 'lucide-react';

// Dynamically import 3D component to avoid SSR issues
const ChessQueen3D = dynamic(
  () => import('@/components/three/ChessQueen3D'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-background-tertiary/20 rounded-lg animate-pulse">
        <span className="text-terminal-green font-mono text-sm">[ LOADING 3D ASSET... ]</span>
      </div>
    )
  }
);

export default function Home() {
  return (
    <div className="scanlines flex min-h-screen flex-col items-center justify-center bg-background-primary">
      {/* Main Container - Centered */}
      <div className="w-full max-w-6xl mx-auto px-4 py-12">
        {/* Header - Terminal Style */}
        <header className="mb-12 border-b border-terminal-green/20 bg-background-secondary/80 backdrop-blur-sm rounded-t-lg">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-terminal-green animate-glow" />
              <span className="terminal-text text-xl font-bold tracking-wider">CHESS TACTICAL ANALYZER</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-text-secondary">[ SYSTEM ONLINE ]</span>
              <div className="h-2 w-2 rounded-full bg-terminal-green animate-glow" />
            </div>
          </div>
        </header>

        {/* Status Bar */}
        <div className="mb-10 border border-terminal-green/10 bg-background-tertiary/50 rounded-lg py-3 px-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-terminal-green">SYSTEM STATUS: OPERATIONAL</span>
            <span className="text-text-secondary">THREAT LEVEL: MINIMAL</span>
            <span className="text-terminal-blue">ENGINES: READY</span>
          </div>
        </div>

        {/* Main Content - Centered */}
        <main className="mb-12">
          {/* Tactical Header with 3D Queen */}
          <div className="tactical-card mb-12">
            <div className="grid lg:grid-cols-[1fr,400px] gap-8 items-center">
              
              {/* Left: Text Content */}
              <div>
                <div className="mb-4 flex items-center justify-center lg:justify-start gap-2 text-sm font-mono text-terminal-green">
                  <span>[</span>
                  <span>- MISSION BRIEFING -</span>
                  <span>]</span>
                </div>
                
                <h1 className="mb-6 text-center lg:text-left text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  <span className="text-terminal-green terminal-glow">TACTICAL ANALYSIS</span>
                  <span className="block text-terminal-blue">COMMAND CENTER</span>
                </h1>
                
                <p className="mb-8 text-center lg:text-left text-lg text-text-secondary sm:text-xl">
                  Military-grade chess analysis powered by <span className="text-terminal-green font-mono">STOCKFISH NNUE</span>.
                  Import operations from <span className="text-terminal-blue font-mono">CHESS.COM</span>, analyze tactical
                  positions, and elevate your strategic capabilities.
                </p>

                {/* Mission Objectives */}
                <div className="grid gap-4 sm:grid-cols-3 mb-8 text-sm">
                  <div className="glass p-4 rounded border border-terminal-green/20">
                    <div className="font-mono text-terminal-green mb-1">OBJECTIVE 1</div>
                    <div className="text-text-secondary">Deploy AI Analysis</div>
                  </div>
                  <div className="glass p-4 rounded border border-terminal-blue/20">
                    <div className="font-mono text-terminal-blue mb-1">OBJECTIVE 2</div>
                    <div className="text-text-secondary">Import Game Data</div>
                  </div>
                  <div className="glass p-4 rounded border border-terminal-green/20">
                    <div className="font-mono text-terminal-green mb-1">OBJECTIVE 3</div>
                    <div className="text-text-secondary">Enhance Strategy</div>
                  </div>
                </div>

                {/* CTA Buttons - Tactical Style */}
                <div className="flex flex-col justify-center lg:justify-start gap-4 sm:flex-row">
                  <Link
                    href="/analyze"
                    className="group relative inline-flex items-center justify-center gap-2 rounded border-2 border-terminal-green/70 bg-terminal-green/15 px-8 py-5 text-lg font-bold uppercase tracking-wider text-terminal-green backdrop-blur-sm transition-colors duration-200 hover:bg-terminal-green hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terminal-green"
                  >
                    <Zap className="h-6 w-6 relative z-10 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
                    <span className="relative z-10">START ANALYSIS HERE</span>
                    <ChevronRight className="h-6 w-6 relative z-10 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
                  </Link>
                  <Link
                    href="/about"
                    className="group inline-flex items-center justify-center gap-2 rounded border-2 border-terminal-blue/50 bg-terminal-blue/5 px-8 py-5 text-base font-bold uppercase tracking-wider text-terminal-blue backdrop-blur-sm transition-all duration-300 hover:bg-terminal-blue hover:text-black hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                  >
                    <Crown className="h-5 w-5" />
                    MISSION INTEL
                  </Link>
                </div>
              </div>

              {/* Right: 3D King */}
              <div className="hidden lg:block h-[500px] relative">
                <ChessQueen3D className="w-full h-full" />
                
                {/* Tactical Frame Corners */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-terminal-green/50" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-terminal-green/50" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-terminal-green/50" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-terminal-green/50" />
                </div>
                
                {/* Asset Label */}
                <div className="absolute top-2 left-2 text-xs font-mono text-terminal-green/70 bg-background-primary/80 px-2 py-1 rounded">
                  <div>ASSET: KING-V1</div>
                  <div className="text-terminal-green/50">STATUS: ACTIVE</div>
                </div>
              </div>

            </div>
          </div>

          {/* Tactical Features Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TacticalFeatureCard
              icon={<Crown className="h-8 w-8 text-terminal-green" />}
              title="STOCKFISH NNUE"
              subtitle="NEURAL NETWORK"
              description="Military-grade engine analysis with neural network evaluation protocols"
              status="ACTIVE"
            />
            <TacticalFeatureCard
              icon={<Target className="h-8 w-8 text-terminal-blue" />}
              title="PGN/FEN IMPORT"
              subtitle="DATA ACQUISITION"
              description="Multi-source tactical data import with full PGN and FEN support systems"
              status="READY"
            />
            <TacticalFeatureCard
              icon={<Zap className="h-8 w-8 text-terminal-green" />}
              title="CHESS.COM INTEGRATION"
              subtitle="INTEL FEED"
              description="Direct intelligence pipeline from Chess.com tactical operations database"
              status="STANDBY"
            />
          </div>
        </main>

        {/* Footer - Secure Channel */}
        <footer className="border-t border-terminal-green/20 bg-background-secondary/80 rounded-b-lg py-6 px-6 backdrop-blur-sm">
          <div className="mb-4 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded border border-terminal-green/30 bg-terminal-green/5 px-4 py-2 text-sm font-mono">
              <div className="h-2 w-2 rounded-full bg-terminal-green animate-glow" />
              <span className="text-terminal-green">SECURE CHANNEL ACTIVE</span>
            </div>
          </div>
          <div className="text-center text-sm text-text-secondary">
            <p className="font-mono">
              POWERED BY{' '}
              <a
                href="https://stockfishchess.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-green hover:text-terminal-blue transition-colors"
              >
                STOCKFISH
              </a>{' '}
              • INTEL FROM{' '}
              <a
                href="https://www.chess.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-blue hover:text-terminal-green transition-colors"
              >
                CHESS.COM
              </a>
            </p>
            <p className="mt-2">
              <Link href="/about" className="hover:text-terminal-green transition-colors">
                [ MISSION DETAILS ]
              </Link>{' '}
              •{' '}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-terminal-green transition-colors"
              >
                [ SOURCE CODE ]
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function TacticalFeatureCard({
  icon,
  title,
  subtitle,
  description,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  status: string;
}) {
  const statusClass = status === 'ACTIVE' ? 'active' : status === 'READY' ? 'ready' : 'standby';
  const iconGlowClass = status === 'ACTIVE' ? 'icon-glow-green' : status === 'READY' ? 'icon-glow-blue' : 'icon-glow-yellow';
  
  return (
    <div className="tactical-card group">
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-lg bg-terminal-green/10 p-3 border border-terminal-green/20 group-hover:border-terminal-green/40 transition-all ${iconGlowClass}`}>
          {icon}
        </div>
        <span className={`status-badge ${statusClass}`}>
          {status}
        </span>
      </div>
      <div className="mb-1 text-xs font-mono text-terminal-blue uppercase tracking-wider">{subtitle}</div>
      <h3 className="mb-3 text-lg font-bold tracking-wide text-terminal-green">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
    </div>
  );
}

