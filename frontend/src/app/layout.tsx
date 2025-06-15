import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "오브젝트 스토리지 서비스",
  description: "파일 업로드 및 공유 서비스",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "32x32",
      },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: {
      url: "/apple-icon.png",
      sizes: "180x180",
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
