"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"

export default function AuthPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent, type: "login" | "signup") => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (type === "signup" && formData.password !== formData.confirmPassword) {
        throw new Error("비밀번호가 일치하지 않습니다.")
      }

      const endpoint = type === "login" ? "/api/login" : "/api/register"
      const response = await axios.post(endpoint, {
        username: formData.username,
        password: formData.password,
      })

      if (type === "login") {
        localStorage.setItem("token", response.data)
        setMessage({ type: "success", text: "로그인 성공!" })
        setTimeout(() => router.push("/dashboard"), 1000)
      } else {
        setMessage({ type: "success", text: "회원가입 성공! 로그인해주세요." })
        setFormData({ username: "", password: "", confirmPassword: "" })
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data || error.message || "요청 처리 중 오류가 발생했습니다.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">오브젝트 스토리지</CardTitle>
          <CardDescription>파일 업로드 및 공유 서비스</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert
              className={`mb-4 ${message.type === "error" ? "border-red-500 text-red-700" : "border-green-500 text-green-700"}`}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={(e) => handleSubmit(e, "login")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">사용자명</Label>
                  <Input
                    id="login-username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="사용자명을 입력하세요"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">비밀번호</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "처리 중..." : "로그인"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => handleSubmit(e, "signup")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">사용자명</Label>
                  <Input
                    id="signup-username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="사용자명을 입력하세요"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">비밀번호 확인</Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "처리 중..." : "회원가입"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
