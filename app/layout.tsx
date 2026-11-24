import type { Metadata } from "next";
import { AppProvider } from "@/contexts/AppContext";
import "sweetalert2/dist/sweetalert2.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "FINORA — Financial Organization and Record Assistant",
  description:
    "FINORA helps you organize your finances, track income and expenses, and monitor your financial progress.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("pet-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch{}`,
          }}
        />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
