"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getStoredUser } from "@/lib/auth"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const user = getStoredUser()
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/auth")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">오브젝트 스토리지</h1>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}
