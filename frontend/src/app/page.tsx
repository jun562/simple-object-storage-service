import { redirect } from "next/navigation"

export default function HomePage() {
  // 서버 사이드에서 바로 리다이렉트
  redirect("/auth")
}
