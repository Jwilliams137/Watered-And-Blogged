import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import styles from './layout.module.css'
import Footer from '../../components/Footer/Footer'
import Nav from '../../components/Nav/Nav'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Watered & blogged",
  description: "A blog for the love of plants",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@400;600&family=Pacifico&display=swap"
        />
        <style>{inter.className}</style>
        <meta property="og:image" content="<generated>" />
        <meta property="og:image:type" content="<generated>" />
        <meta property="og:image:width" content="<generated>" />
        <meta property="og:image:height" content="<generated>" />
        <meta name="twitter:image" content="<generated>" />
        <meta name="twitter:image:type" content="<generated>" />
        <meta name="twitter:image:width" content="<generated>" />
        <meta name="twitter:image:height" content="<generated>" />
      </head>
      <body className={styles.wrapper}>
        <Nav />
        <div className={styles.children_container}>
          {children}
        </div>
        <footer className={styles.footer}>
          <Footer />
        </footer>
      </body>
    </html>
  )
}
