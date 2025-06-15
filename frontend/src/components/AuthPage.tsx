"use client"

import type React from "react"
import { useState } from "react"
import "../styles/auth.css"

type AuthPageProps = {}

const AuthPage: React.FC<AuthPageProps> = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // 비밀번호 확인 (회원가입 시)
      if (activeTab === "signup" && formData.password !== formData.confirmPassword) {
        throw new Error("비밀번호가 일치하지 않습니다.")
      }

      const endpoint = activeTab === "login" ? "/api/auth/login" : "/api/auth/register"
      const response = await fetch(`http://10.0.10.163:8080${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || `${activeTab === "login" ? "로그인" : "회원가입"} 실패`)
      }

      const data = await response.json()
      setMessage({
        type: "success",
        text: activeTab === "login" ? "로그인 성공!" : "회원가입 성공!",
      })

      // 로그인 성공 시 토큰 저장 및 리다이렉트
      if (activeTab === "login" && data.token) {
        localStorage.setItem("token", data.token)
        // 메인 페이지로 리다이렉트
        window.location.href = "/dashboard"
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "요청 처리 중 오류가 발생했습니다.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>오브젝트 스토리지</h1>
        <p>파일 업로드 및 공유 서비스</p>
      </div>

      <div className="auth-tabs">
        <button className={`auth-tab ${activeTab === "login" ? "active" : ""}`} onClick={() => setActiveTab("login")}>
          로그인
        </button>
        <button className={`auth-tab ${activeTab === "signup" ? "active" : ""}`} onClick={() => setActiveTab("signup")}>
          회원가입
        </button>
      </div>

      {message && <div className={`${message.type}-message`}>{message.text}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">사용자명</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            placeholder="사용자명을 입력하세요"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        {activeTab === "signup" && (
          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>
        )}

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "처리 중..." : activeTab === "login" ? "로그인" : "회원가입"}
        </button>
      </form>
    </div>
  )
}

export default AuthPage
