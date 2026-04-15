import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import Navbar from "../components/Navbar";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata = {
  title: "IdeaThreads",
  description:
    "A conversational platform where ideas become live discussion threads.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.variable} data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-[var(--color-page)] text-slate-900">
            <Navbar />
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
