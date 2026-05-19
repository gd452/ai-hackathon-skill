import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Hackathon Console",
  description: "AI 해커톤 운영 dashboard — fork & run locally",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta httpEquiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener("pageshow",function(e){if(e.persisted)location.reload();});`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-[var(--border)] bg-[var(--background)]/85 sticky top-0 z-10 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span>AI Hackathon</span>
              <span className="text-[10px] font-mono text-[var(--muted-soft)] tracking-widest uppercase hidden sm:inline">
                Console
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <NavLink href="/">소개</NavLink>
              <NavLink href="/console">대시보드</NavLink>
              <NavLink href="/submissions">제출물</NavLink>
              <NavLink href="/leaderboard">리더보드</NavLink>
              <NavLink href="/config" subtle>설정</NavLink>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--border)] mt-12 py-5 px-4 text-xs text-[var(--muted-soft)] text-center">
          AI 가 제출 설명·코드·시연 영상을 함께 검토. 최종 시상은 사람 심사위원.
        </footer>
      </body>
    </html>
  );
}

function NavLink({
  href,
  children,
  subtle = false,
}: {
  href: string;
  children: React.ReactNode;
  subtle?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-2.5 py-1 rounded-md transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-bright)] ${
        subtle ? "text-[var(--muted)] text-xs" : ""
      }`}
    >
      {children}
    </Link>
  );
}
