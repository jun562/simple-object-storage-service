import { getAuthHeaders } from "./auth"

const API_BASE_URL = "http://localhost:8080"

export interface FileItem {
  id: number
  originalFilename: string
  linkId: string
  permission: string
}

export interface FileDetail {
  id: number
  size: number
  username: string
  originalFilename: string
  uploadTime: string
  linkId: string
  permission: string
  contentType: string
}

// 회원가입
export const register = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }

  return response.text()
}

// 로그인
export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }

  return response.text()
}

// 파일 업로드
export const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }

  return response.text()
}

// 파일 목록 조회
export const getFiles = async (): Promise<FileItem[]> => {
  const response = await fetch(`${API_BASE_URL}/files`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("파일 목록을 가져올 수 없습니다.")
  }

  return response.json()
}

// 파일 상세 정보
export const getFileDetail = async (id: number): Promise<FileDetail> => {
  const response = await fetch(`${API_BASE_URL}/files/${id}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("파일 정보를 가져올 수 없습니다.")
  }

  return response.json()
}

// 파일 권한 변경
export const updateFilePermission = async (id: number, permission: string, password?: string) => {
  const response = await fetch(`${API_BASE_URL}/files/${id}/permission`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ permission, password }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }

  return response.text()
}

// 파일 삭제
export const deleteFile = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/files/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }

  return response.text()
}

// 다운로드 URL 생성
export const getDownloadUrl = (linkId: string, password?: string) => {
  const url = new URL(`${API_BASE_URL}/download/${linkId}`)
  if (password) {
    url.searchParams.append("password", password)
  }
  return url.toString()
}
