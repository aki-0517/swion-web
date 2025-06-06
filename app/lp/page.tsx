"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Press_Start_2P } from "next/font/google";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const pressStart2P = Press_Start_2P({ weight: "400", subsets: ["latin"] });

const DOT_FONT = '"Press Start 2P", "DotGothic16", "monospace"';

const FOOTER_HEIGHT = 220; // フッターの高さ（必要に応じて調整）

export default function LPPage() {
  // Projectロゴ取得用
  const [projectLogos, setProjectLogos] = useState<string[]>([]);

  useEffect(() => {
    async function fetchLogos() {
      const { data, error } = await supabase
        .from('projects')
        .select('logo_image')
        .not('logo_image', 'is', null);
      if (!error && data) {
        setProjectLogos(data.map((p: any) => p.logo_image).filter(Boolean));
      }
    }
    fetchLogos();
  }, []);

  // Suiロゴを全体に浮かせる
  function SuiFloatingLogos() {
    const suiLogo = "https://upload.wikimedia.org/wikipedia/commons/6/63/Sui_Symbol_Sea.png";
    const logoCount = 40; // ロゴの数を増やす
    const logos = Array.from({ length: logoCount });
    const [pageHeight, setPageHeight] = useState(0);

    useEffect(() => {
      function updateHeight() {
        setPageHeight(document.body.scrollHeight);
      }
      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }, []);

    if (!pageHeight) return null;

    return (
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: pageHeight, pointerEvents: 'none', zIndex: 1 }}>
        {logos.map((_, i) => {
          const size = Math.random() * 40 + 40; // 40~80px
          const left = Math.random() * 90; // 0~90vw
          const topPx = Math.random() * (pageHeight - FOOTER_HEIGHT - size); // フッターに被らない範囲
          const duration = Math.random() * 8 + 8; // 8~16秒
          const delay = Math.random() * 8; // 0~8秒
          return (
            <img
              key={i}
              src={suiLogo}
              alt="Sui Logo"
              width={size}
              height={size}
              style={{
                position: 'absolute',
                left: `${left}vw`,
                top: `${topPx}px`,
                opacity: 0.35, // より濃く
                pointerEvents: 'none',
                zIndex: 1,
                animation: `suiFloatY${i} ${duration}s ease-in-out ${delay}s infinite alternate`,
                filter: 'drop-shadow(0 2px 8px #00b8ff44)',
                userSelect: 'none',
              }}
              className="sui-floating-logo"
            />
          );
        })}
        {/* keyframesをグローバルに追加 */}
        <style jsx global>{`
          ${logos
            .map(
              (_, i) => `@keyframes suiFloatY${i} {
                0% { transform: translateY(0px) scale(1); }
                100% { transform: translateY(${Math.random() * 40 + 20}px) scale(${0.9 + Math.random() * 0.3}); }
              }`
            )
            .join('\n')}
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* 固定背景画像 */}
      <div
        className="lp-bg-fixed"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          backgroundImage: 'url(https://embed.pixiv.net/artwork.php?illust_id=116659447&mdate=1709654598)',
          backgroundPosition: 'right top',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          pointerEvents: 'none',
        }}
      />
      <div
        className={`min-h-screen w-full flex flex-col relative overflow-x-hidden ${pressStart2P.className}`}
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
      {/* スマホ用の背景繰り返しCSSを追加 */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .min-h-screen.w-full.flex.flex-col.relative.overflow-x-hidden.${pressStart2P.className.replace(/ /g, ".")} {
            background-attachment: fixed !important;
            background-position: right top !important;
            background-repeat: no-repeat !important;
            background-size: cover !important;
          }
        }
      `}</style>
      {/* Suiロゴを全体に浮かせる */}
      <div className="hidden md:block">
        <SuiFloatingLogos />
      </div>
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen w-full flex-1 px-4 text-center bg-black/30 overflow-hidden">
        {/* Projectロゴをランダムに散りばめて浮かせる */}
        <div className="hidden md:block">
          {projectLogos.map((logo, i) => {
            // 中央エリアを避けてランダムな位置を生成
            function getRandomPosition() {
              let left, top;
              while (true) {
                left = Math.random() * 80 + 10; // 10%~90%
                top = Math.random() * 70 + 10;  // 10%~80%
                // 中央エリア(35%~65%)を避ける
                if (!(left > 35 && left < 65 && top > 35 && top < 65)) {
                  break;
                }
              }
              return { left, top };
            }
            const { left, top } = getRandomPosition();
            const duration = Math.random() * 6 + 4; // 4~10秒
            const size = Math.random() * 40 + 40; // 40~80px
            return (
              <Image
                key={logo + i}
                src={logo}
                alt="Project Logo"
                width={size}
                height={size}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  top: `${top}%`,
                  opacity: 0.7,
                  pointerEvents: 'none',
                  animation: `floatY${i} ${duration}s ease-in-out infinite alternate`,
                  zIndex: 2,
                }}
                className="rounded-full"
              />
            );
          })}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg z-10 tracking-widest" style={{ fontFamily: DOT_FONT, letterSpacing: '0.08em', textShadow: '0 4px 16px #000, 0 0 8px #00b8ff, 0 2px 0 #000' }}>SWION</h1>
        <h2 className="text-lg md:text-xl font-bold mb-6 text-white z-10 tracking-widest" style={{ fontFamily: DOT_FONT, textShadow: '0 4px 16px #000, 0 0 8px #00b8ff, 0 2px 0 #000' }}>Your Sui Acrivity, Your Aquarium</h2>
        <p className="text-base md:text-lg mb-8 text-white z-10 tracking-widest" style={{ fontFamily: DOT_FONT, textShadow: '0 4px 16px #000, 0 0 8px #00b8ff, 0 2px 0 #000' }}>See your onchain activity as a living, growing aquarium.</p>
        <Button asChild size="lg" className="bg-pink-300 hover:bg-pink-400 text-white text-lg font-bold px-8 py-4 rounded-full shadow-lg z-10 tracking-widest" style={{ fontFamily: DOT_FONT }}>
          <Link href="/explore">Open App</Link>
        </Button>
        {/* 下矢印アイコン */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
        </div>
      </section>

      {/* The Challenge */}
      <section className="max-w-3xl mx-auto py-16 px-4 bg-black/40 rounded-xl mt-8 text-center">
        <h3 className="text-xl md:text-2xl font-bold mb-6 text-pink-300 tracking-widest" style={{ fontFamily: DOT_FONT }}>Why SWION?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/60 border-2 border-[#f7efda] shadow-lg" style={{ fontFamily: DOT_FONT }}>
            <CardHeader>
              <span className="text-2xl">👀</span>
              <CardTitle className="text-base mt-2 tracking-widest text-center">No Visuals</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="tracking-widest text-center">Blockchain data is hard to see and enjoy.</CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-white/60 border-2 border-pink-200 shadow-lg" style={{ fontFamily: DOT_FONT }}>
            <CardHeader>
              <span className="text-2xl">🎨</span>
              <CardTitle className="text-base mt-2 tracking-widest text-center">No Identity</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="tracking-widest text-center">No way to show your style on-chain.</CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-white/60 border-2 border-blue-200 shadow-lg" style={{ fontFamily: DOT_FONT }}>
            <CardHeader>
              <span className="text-2xl">⏳</span>
              <CardTitle className="text-base mt-2 tracking-widest text-center">Short-Term Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="tracking-widest text-center">Airdrops fade fast and attract bots.</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Components */}
      <section className="max-w-5xl mx-auto py-16 px-4 bg-black/40 rounded-xl mt-8 text-center">
        <h3 className="text-xl md:text-2xl font-bold mb-8 text-white tracking-widest" style={{ fontFamily: DOT_FONT }}>What You Get</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-[#f7efda]/80 border-2 border-[#e0c3a0] shadow-md" style={{ fontFamily: DOT_FONT }}>
            <CardHeader className="flex flex-col items-center text-center">
              <Image src="https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//ChatGPT%20Image%20Apr%206,%202025,%2001_59_07%20PM.png" alt="Your Tank" width={80} height={80} className="mb-2 rounded-lg" />
              <CardTitle className="text-base mt-2 tracking-widest">Your Tank</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc ml-4 text-xs tracking-widest text-left">
                <li>Unique to your wallet</li>
                <li>Changes as you use blockchain</li>
                <li>Add and move objects</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-pink-100/80 border-2 border-pink-300 shadow-md" style={{ fontFamily: DOT_FONT }}>
            <CardHeader className="flex flex-col items-center text-center">
              <Image src="https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//ChatGPT%20Image%20Apr%2018,%202025,%2002_42_46%20PM.png" alt="Objects" width={80} height={80} className="mb-2 rounded-lg" />
              <CardTitle className="text-base mt-2 tracking-widest">Objects</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc ml-4 text-xs tracking-widest text-left">
                <li>Evolved by your Tx</li>
                <li>Change and evolve</li>
                <li>Special and rare types</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-blue-100/80 border-2 border-blue-300 shadow-md" style={{ fontFamily: DOT_FONT }}>
            <CardHeader className="flex flex-col items-center text-center">
              <Image src="https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//Subject%2021.png" alt="Marine Blends" width={80} height={80} className="mb-2 rounded-lg" />
              <CardTitle className="text-base mt-2 tracking-widest">Marine Blends</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc ml-4 text-xs tracking-widest text-left">
                <li>Mix objects to create new ones</li>
                <li>Some are very limited</li>
                <li>Discover secret recipes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Gamification & Engagement */}
      <section className="max-w-4xl mx-auto py-16 px-4 bg-black/40 rounded-xl mt-8 text-center">
        <h3 className="text-xl md:text-2xl font-bold mb-6 text-white tracking-widest" style={{ fontFamily: DOT_FONT }}>Have Fun & Connect</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
          <li className="bg-white/60 rounded-xl p-6 border-l-8 border-pink-200 shadow-md text-base tracking-widest">Quests for all users</li>
          <li className="bg-white/60 rounded-xl p-6 border-l-8 border-blue-200 shadow-md text-base tracking-widest">Special events and campaigns</li>
          <li className="bg-white/60 rounded-xl p-6 border-l-8 border-pink-100 shadow-md text-base tracking-widest">Find hidden recipes</li>
          <li className="bg-white/60 rounded-xl p-6 border-l-8 border-blue-100 shadow-md text-base tracking-widest">Grow without token rewards</li>
        </ul>
      </section>

      {/* How It Works */}
      <section className="max-w-3xl mx-auto py-16 px-4 bg-black/40 rounded-xl mt-8 text-center">
        <h3 className="text-xl md:text-2xl font-bold mb-8 text-white tracking-widest" style={{ fontFamily: DOT_FONT }}>How It Works</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="flex flex-col items-center">
            <Image src="https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//Subject%2023.png" alt="Connect" width={64} height={64} className="mb-2 rounded-lg" />
            <div className="font-bold text-base mb-1 text-white tracking-widest">Connect</div>
            <div className="text-xs text-gray-200 tracking-widest">Link your wallet</div>
          </div>
          <div className="flex flex-col items-center">
            <Image src="https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//Subject%2022.png" alt="Mint" width={64} height={64} className="mb-2 rounded-lg" />
            <div className="font-bold text-base mb-1 text-white tracking-widest">Mint</div>
            <div className="text-xs text-gray-200 tracking-widest">Get your Tank NFT</div>
          </div>
          <div className="flex flex-col items-center">
            <Image src="https://mcgkbbmxetaclxnkgvaq.supabase.co/storage/v1/object/public/suiden//Subject%2018.png" alt="Collect" width={64} height={64} className="mb-2 rounded-lg" />
            <div className="font-bold text-base mb-1 text-white tracking-widest">Collect</div>
            <div className="text-xs text-gray-200 tracking-widest">Evolve and combine objects</div>
          </div>
        </div>
      </section>

      {/* Social Proof & Awards */}
      <section className="max-w-3xl mx-auto py-16 px-4 text-center bg-black/40 rounded-xl mt-8">
        <h3 className="text-xl md:text-2xl font-bold mb-4 text-white tracking-widest" style={{ fontFamily: DOT_FONT }}>Awarded Project</h3>
        <Badge 
          className="bg-yellow-300 text-yellow-900 text-base px-6 py-2 rounded-full shadow-md tracking-widest w-full text-center flex justify-center"
          style={{ fontFamily: DOT_FONT, width: '100%', backgroundColor: '#fde047', color: '#713f12' }}
        >
          🏆 1st Prize at Sui Hacker House Tokyo
        </Badge>
      </section>

      {/* Join the Underwater Adventure */}
      <section className="max-w-2xl mx-auto py-16 px-4 text-center bg-black/40 rounded-xl mt-8">
        <h3 className="text-xl md:text-2xl font-bold mb-2 text-white tracking-widest" style={{ fontFamily: DOT_FONT }}>Start Your Aquarium</h3>
        <p className="text-base mb-6 text-white tracking-widest" style={{ fontFamily: DOT_FONT }}>No code needed. Try SWION now!</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-pink-300 hover:bg-pink-400 text-white text-lg font-bold px-8 py-4 rounded-full shadow-lg tracking-widest" style={{ fontFamily: DOT_FONT }}>
            <Link href="/explore">Open App</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="bg-blue-200 hover:bg-blue-300 text-blue-900 text-lg font-bold px-8 py-4 rounded-full shadow-lg tracking-widest" style={{ fontFamily: DOT_FONT }}>
            <a href="https://swion.gitbook.io/swion" target="_blank" rel="noopener noreferrer">Read the Docs</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-br from-[#f7efda] via-pink-100 to-blue-100 border-t-4 border-pink-300 py-16 mt-16 text-center text-[#3a3a3a] tracking-widest shadow-2xl" style={{ fontFamily: DOT_FONT, fontSize: '1.15rem', letterSpacing: '0.08em' }}>
        <div className="flex flex-wrap flex-col md:flex-row items-center justify-center gap-8 mb-8">
          <Link href="/explore" className="underline hover:text-pink-400 text-lg md:text-xl font-bold transition-colors">Demo Site</Link>
          <a href="https://swion.gitbook.io/swion" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 text-lg md:text-xl font-bold transition-colors">Documentation</a>
          <a href="https://github.com/aki-0517/swion-web" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 text-lg md:text-xl font-bold transition-colors">GitHub</a>
          <a href="https://youtu.be/gPwP3yuRwSo" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 text-lg md:text-xl font-bold transition-colors">Demo Video</a>
          <a href="https://youtu.be/6xwv1BoOh-Q" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 text-lg md:text-xl font-bold transition-colors">Pitch Video</a>
          <a href="https://docs.google.com/presentation/d/1OU_K_BjJ8DLInOLNPXK5O1uWy1-VbI10ho0SIpjGVgI/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-600 text-lg md:text-xl font-bold transition-colors">Pitch Deck</a>
        </div>
        <div className="text-sm md:text-base text-gray-600 font-semibold">© 2025 SWION.</div>
      </footer>
      </div>
    </>
  );
} 