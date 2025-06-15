"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Upload, Settings, Trash2, LogOut, Copy, Eye } from "lucide-react"
import { getStoredUser, clearUser } from "@/lib/auth"
import { uploadFile, getFiles, updateFilePermission, deleteFile, getDownloadUrl, type FileItem } from "@/lib/api"

export default function DashboardPage() {
  const [user, setUser] = useState<{ username: string; token: string } | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [permissionDialog, setPermissionDialog] = useState<{ open: boolean; file: FileItem | null }>({
    open: false,
    file: null,
  })
  const [permission, setPermission] = useState("private")
  const [password, setPassword] = useState("")
  const [downloadPassword, setDownloadPassword] = useState("")
  const [downloadDialog, setDownloadDialog] = useState<{ open: boolean; file: FileItem | null }>({
    open: false,
    file: null,
  })
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push("/auth")
      return
    }
    setUser(storedUser)
    loadFiles()
  }, [router])

  const loadFiles = async () => {
    try {
      const fileList = await getFiles()
      setFiles(fileList)
    } catch (error) {
      toast.error("파일 목록 로드 실패", {
        description: error instanceof Error ? error.message : "파일 목록을 불러올 수 없습니다.",
      })
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    try {
      await uploadFile(selectedFile)
      toast.success("업로드 성공", {
        description: "파일이 성공적으로 업로드되었습니다.",
      })
      setSelectedFile(null)
      // 파일 입력 초기화
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ""
      loadFiles()
    } catch (error) {
      toast.error("업로드 실패", {
        description: error instanceof Error ? error.message : "파일 업로드에 실패했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePermissionUpdate = async () => {
    if (!permissionDialog.file) return

    try {
      await updateFilePermission(
        permissionDialog.file.id,
        permission,
        permission === "protected" ? password : undefined,
      )
      toast.success("권한 변경 성공", {
        description: "파일 권한이 변경되었습니다.",
      })
      setPermissionDialog({ open: false, file: null })
      setPassword("")
      loadFiles()
    } catch (error) {
      toast.error("권한 변경 실패", {
        description: error instanceof Error ? error.message : "권한 변경에 실패했습니다.",
      })
    }
  }

  const handleFileDelete = async (fileId: number) => {
    if (!confirm("정말로 이 파일을 삭제하시겠습니까?")) return

    try {
      await deleteFile(fileId)
      toast.success("삭제 성공", {
        description: "파일이 삭제되었습니다.",
      })
      loadFiles()
    } catch (error) {
      toast.error("삭제 실패", {
        description: error instanceof Error ? error.message : "파일 삭제에 실패했습니다.",
      })
    }
  }

  const handleDownload = (file: FileItem) => {
    if (file.permission === "protected") {
      setDownloadDialog({ open: true, file })
    } else {
      const url = getDownloadUrl(file.linkId)
      window.open(url, "_blank")
    }
  }

  const handleProtectedDownload = () => {
    if (!downloadDialog.file) return

    const url = getDownloadUrl(downloadDialog.file.linkId, downloadPassword)
    window.open(url, "_blank")
    setDownloadDialog({ open: false, file: null })
    setDownloadPassword("")
  }

  const copyDownloadLink = (file: FileItem) => {
    const url = getDownloadUrl(file.linkId)
    navigator.clipboard.writeText(url)
    toast.success("링크 복사됨", {
      description: "다운로드 링크가 클립보드에 복사되었습니다.",
    })
  }

  const handleLogout = () => {
    clearUser()
    router.push("/auth")
  }

  const getPermissionBadge = (permission: string) => {
    const variants = {
      public: "default",
      private: "secondary",
      protected: "destructive",
    } as const

    return (
      <Badge variant={variants[permission as keyof typeof variants] || "default"}>
        {permission === "public" ? "공개" : permission === "private" ? "비공개" : "보호됨"}
      </Badge>
    )
  }

  if (!user) {
    return <div>로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">오브젝트 스토리지</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">안녕하세요, {user.username}님</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 파일 업로드 섹션 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              파일 업로드
            </CardTitle>
            <CardDescription>
              파일을 선택하고 업로드하세요. 업로드된 파일은 기본적으로 비공개로 설정됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="flex-1" />
              <Button onClick={handleFileUpload} disabled={!selectedFile || isLoading}>
                {isLoading ? "업로드 중..." : "업로드"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 파일 목록 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>내 파일 목록</CardTitle>
            <CardDescription>업로드한 파일들을 관리하고 공유할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">업로드된 파일이 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{file.originalFilename}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getPermissionBadge(file.permission)}
                          <span className="text-sm text-gray-500">ID: {file.linkId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(file)}>
                        <Eye className="w-4 h-4 mr-1" />
                        보기
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => copyDownloadLink(file)}>
                        <Copy className="w-4 h-4 mr-1" />
                        링크 복사
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPermissionDialog({ open: true, file })
                          setPermission(file.permission)
                        }}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        권한 설정
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleFileDelete(file.id)}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 권한 설정 다이얼로그 */}
      <Dialog open={permissionDialog.open} onOpenChange={(open) => setPermissionDialog({ open, file: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>파일 권한 설정</DialogTitle>
            <DialogDescription>{permissionDialog.file?.originalFilename}의 접근 권한을 설정하세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>접근 권한</Label>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">공개 - 누구나 접근 가능</SelectItem>
                  <SelectItem value="private">비공개 - 본인만 접근 가능</SelectItem>
                  <SelectItem value="protected">보호됨 - 비밀번호 필요</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {permission === "protected" && (
              <div className="space-y-2">
                <Label>비밀번호</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="다운로드 시 필요한 비밀번호"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionDialog({ open: false, file: null })}>
              취소
            </Button>
            <Button onClick={handlePermissionUpdate}>권한 변경</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 보호된 파일 다운로드 다이얼로그 */}
      <Dialog open={downloadDialog.open} onOpenChange={(open) => setDownloadDialog({ open, file: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비밀번호 입력</DialogTitle>
            <DialogDescription>이 파일은 비밀번호로 보호되어 있습니다. 비밀번호를 입력하세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>비밀번호</Label>
              <Input
                type="password"
                value={downloadPassword}
                onChange={(e) => setDownloadPassword(e.target.value)}
                placeholder="파일 다운로드 비밀번호"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDownloadDialog({ open: false, file: null })}>
              취소
            </Button>
            <Button onClick={handleProtectedDownload}>다운로드</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
