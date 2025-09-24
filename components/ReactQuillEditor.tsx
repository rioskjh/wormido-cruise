'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

// ReactQuill을 동적으로 로드 (SSR 문제 방지)
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 rounded-md animate-pulse flex items-center justify-center text-gray-500">에디터 로딩 중...</div>
})

interface ReactQuillEditorProps {
  value: string
  onChange: (content: string) => void
  height?: number
  placeholder?: string
}

export default function ReactQuillEditor({ 
  value, 
  onChange, 
  height = 300,
  placeholder = '내용을 입력하세요...'
}: ReactQuillEditorProps) {
  const [isClient, setIsClient] = useState(false)

  // 클라이언트 사이드에서만 에디터 렌더링
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 이미지 업로드 핸들러
  const imageHandler = useCallback(() => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB를 초과할 수 없습니다.')
        return
      }

      try {
        const formData = new FormData()
        formData.append('image', file)

        const token = localStorage.getItem('admin_access_token')
        if (!token) {
          alert('로그인이 필요합니다.')
          return
        }

        const response = await fetch('/api/admin/popups/images', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        const result = await response.json()
        
        if (result.ok) {
          // 에디터에 이미지 삽입
          const quill = (window as any).quill
          if (quill) {
            const range = quill.getSelection()
            quill.insertEmbed(range?.index || 0, 'image', result.data.url)
            quill.setSelection((range?.index || 0) + 1)
          }
        } else {
          alert(result.error || '이미지 업로드에 실패했습니다.')
        }
      } catch (error) {
        console.error('Image upload error:', error)
        alert('이미지 업로드 중 오류가 발생했습니다.')
      }
    }
  }, [])

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['blockquote', 'code-block'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), [imageHandler])

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align', 'direction',
    'code-block', 'script'
  ]

  if (!isClient) {
    return (
      <div className="h-32 bg-gray-100 rounded-md animate-pulse flex items-center justify-center text-gray-500">
        에디터 로딩 중...
      </div>
    )
  }

  return (
    <div className="react-quill-editor mb-4">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ height: 'auto' }}
      />
      <style jsx global>{`
        .react-quill-editor .ql-editor {
          min-height: 200px;
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.6;
        }
        .react-quill-editor .ql-toolbar {
          border-color: #d1d5db;
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
        }
        .react-quill-editor .ql-container {
          border-color: #d1d5db;
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        .react-quill-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .react-quill-editor .ql-editor:focus {
          outline: none;
        }
        .react-quill-editor .ql-toolbar .ql-stroke {
          stroke: #374151;
        }
        .react-quill-editor .ql-toolbar .ql-fill {
          fill: #374151;
        }
        .react-quill-editor .ql-toolbar button:hover .ql-stroke {
          stroke: #3b82f6;
        }
        .react-quill-editor .ql-toolbar button:hover .ql-fill {
          fill: #3b82f6;
        }
        .react-quill-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6;
        }
        .react-quill-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6;
        }
      `}</style>
    </div>
  )
}
