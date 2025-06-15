"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, Settings, Trash2, LogOut, Eye, Lock, Shield } from "lucide-react"
import axios from "axios"

interface FileItem {
  id: number
  originalFilename: string
  linkId: string
  permission: string
}

interface FileDetail {
  id: number
  size: number
  username: string
  originalFilename: string
  uploadTime: string
  linkId: string
  permission: string
  contentType: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [selectedFileDetail, setSelectedFileDetail] = useState<FileDetail | null>(null)
  const [permissionData, setPermissionData] = useState({ permission: "private", password: "" })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth")
      return
    }
    fetchFiles()
  }, [router])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return { Authorization: `Bearer ${token}` }
  }

  const fetchFiles = async () => {
    try {
      const response = await axios.get("/api/files", {
        headers: getAuthHeaders(),
      })
      setFiles(response.data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        router.push("/auth")
      } else {
        setMessage({ type: "error", text: "파일 목록을 불러오는데 실패했습니다." })
      }
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      await axios.post("/api/upload", formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      })
      setMessage({ type: "success", text: "파일 업로드가 완료되었습니다." })
      setSelectedFile(null)
      fetchFiles()
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data || "파일 업로드에 실패했습니다." })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (id: number) => {
    if (!confirm("정말로 이 파일을 삭제하시겠습니까?")) return

    try {
      await axios.delete(`/api/files/${id}`, {
        headers: getAuthHeaders(),
      })
      setMessage({ type: "success", text: "파일이 삭제되었습니다." })
      fetchFiles()
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data || "파일 삭제에 실패했습니다." })
    }
  }

  const handleGetFileDetail = async (id: number) => {
    try {
      const response = await axios.get(`/api/files/${id}`, {
        headers: getAuthHeaders(),
      })
      setSelectedFileDetail(response.data)
    } catch (error: any) {
      setMessage({ type: "error", text: "파일 정보를 불러오는데 실패했습니다." })
    }
  }

  const handleUpdatePermission = async () => {
    if (!selectedFileDetail) return

    try {
      await axios.put(
        `/api/files/${selectedFileDetail.id}/permission`,
        {
          permission: permissionData.permission,
          password: permissionData.permission === "protected" ? permissionData.password : null,
        },
        {
          headers: getAuthHeaders(),
        },
      )
      setMessage({ type: "success", text: "권한이 변경되었습니다." })
      setSelectedFileDetail(null)
      fetchFiles()
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data || "권한 변경에 실패했습니다." })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/auth")
  }

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "public":
        return <Eye className="h-4 w-4 text-green-500" />
      case "private":
        return <Lock className="h-4 w-4 text-red-500" />
      case "protected":
        return <Shield className="h-4 w-4 text-yellow-500" />
      default:
        return <Lock className="h-4 w-4" />
    }
  }

  const handleDownloadFile = async (linkId: string, filename: string, permission: string) => {
    try {
      const token = localStorage.getItem("token")

      // URL 파라미터 구성
      let downloadUrl = `/api/download/${linkId}`
      const params = new URLSearchParams()

      // protected 파일의 경우 비밀번호 입력 받기
      if (permission === "protected") {
        const password = prompt("비밀번호를 입력하세요:")
        if (!password) {
          setMessage({ type: "error", text: "비밀번호가 필요합니다." })
          return
        }
        params.append("password", password)
      }

      if (params.toString()) {
        downloadUrl += `?${params.toString()}`
      }

      // 헤더 구성
      const headers: Record<string, string> = {
        Accept: "*/*",
      }

      // private 파일이거나 로그인된 상태면 토큰 추가
      if (token && (permission === "private" || permission === "protected")) {
        headers.Authorization = `Bearer ${token}`
      }

      console.log("Download URL:", downloadUrl)
      console.log("Headers:", headers)

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers,
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          router.push("/auth")
          return
        }
        if (response.status === 403) {
          setMessage({ type: "error", text: "접근 권한이 없거나 비밀번호가 틀렸습니다." })
          return
        }
        if (response.status === 404) {
          setMessage({ type: "error", text: "파일을 찾을 수 없습니다." })
          return
        }
        throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`)
      }

      // 파일 데이터를 blob으로 받기
      const blob = await response.blob()
      console.log("Blob size:", blob.size)

      // 파일 다운로드 처리
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      setMessage({ type: "success", text: "파일 다운로드가 완료되었습니다." })
    } catch (error: any) {
      console.error("Download error:", error)
      setMessage({
        type: "error",
        text: error.message || "파일 다운로드에 실패했습니다.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">오브젝트 스토리지 대시보드</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>

        {message && (
          <Alert
            className={`mb-4 ${message.type === "error" ? "border-red-500 text-red-700" : "border-green-500 text-green-700"}`}
          >
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* 파일 업로드 섹션 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              파일 업로드
            </CardTitle>
            <CardDescription>파일을 선택하고 업로드하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="flex-1" />
              <Button onClick={handleFileUpload} disabled={!selectedFile || uploading}>
                {uploading ? "업로드 중..." : "업로드"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 파일 목록 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>내 파일 목록</CardTitle>
            <CardDescription>업로드한 파일들을 관리하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <p className="text-center text-gray-500 py-8">업로드된 파일이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getPermissionIcon(file.permission)}
                      <div>
                        <p className="font-medium">{file.originalFilename}</p>
                        <p className="text-sm text-gray-500">권한: {file.permission}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadFile(file.linkId, file.originalFilename, file.permission)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        다운로드
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleGetFileDetail(file.id)
                              setPermissionData({ permission: file.permission, password: "" })
                            }}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            설정
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>파일 설정</DialogTitle>
                          </DialogHeader>
                          {selectedFileDetail && (
                            <div className="space-y-4">
                              <div>
                                <Label>파일명</Label>
                                <p className="text-sm text-gray-600">{selectedFileDetail.originalFilename}</p>
                              </div>
                              <div>
                                <Label>크기</Label>
                                <p className="text-sm text-gray-600">
                                  {(selectedFileDetail.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                              <div>
                                <Label>다운로드 링크</Label>
                                <p className="text-sm text-gray-600 break-all">
                                  {window.location.origin}/api/download/{selectedFileDetail.linkId}
                                </p>
                              </div>
                              <div>
                                <Label>접근 권한</Label>
                                <Select
                                  value={permissionData.permission}
                                  onValueChange={(value) =>
                                    setPermissionData((prev) => ({ ...prev, permission: value }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="private">비공개 (본인만)</SelectItem>
                                    <SelectItem value="public">공개 (모든 사용자)</SelectItem>
                                    <SelectItem value="protected">비밀번호 보호</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {permissionData.permission === "protected" && (
                                <div>
                                  <Label>비밀번호</Label>
                                  <Input
                                    type="password"
                                    value={permissionData.password}
                                    onChange={(e) =>
                                      setPermissionData((prev) => ({ ...prev, password: e.target.value }))
                                    }
                                    placeholder="비밀번호를 입력하세요"
                                  />
                                </div>
                              )}
                              <Button onClick={handleUpdatePermission} className="w-full">
                                권한 변경
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteFile(file.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
