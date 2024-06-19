import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css";
import styles from './layout.module.css'
import Footer from '../../components/Footer/Footer'
import Nav from '../../components/Nav/Nav'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Viriditas Ludus",
  description: "A place for the love of plants",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
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
