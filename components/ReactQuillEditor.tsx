'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

// Quill 타입 확장
declare global {
  interface Window {
    Quill: any
  }
}

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
  const [quillInstance, setQuillInstance] = useState<any>(null)
  const [showHtmlSource, setShowHtmlSource] = useState(false)

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

        // 관리자 토큰 찾기 (여러 가능한 키 확인)
        const token = localStorage.getItem('adminToken') || 
                     localStorage.getItem('admin_access_token') || 
                     localStorage.getItem('access_token') || 
                     localStorage.getItem('admin_token')
        
        if (!token) {
          alert('관리자 로그인이 필요합니다. 페이지를 새로고침 후 다시 시도해주세요.')
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
          // Vercel Blob URL 사용 확인
          const imageUrl = result.data.url
          console.log('Uploaded image URL:', imageUrl) // 디버깅용
          
          // 에디터에 이미지 삽입 - 기존 내용 유지
          const currentContent = value || ''
          const imageHtml = `<p><img src="${imageUrl}"></p>`
          
          // 기존 내용이 있으면 끝에 이미지 추가, 없으면 이미지만
          const newContent = currentContent ? currentContent + imageHtml : imageHtml
          onChange(newContent)
          
          console.log('Final content with image:', newContent) // 디버깅용
        } else {
          alert(result.error || '이미지 업로드에 실패했습니다.')
        }
      } catch (error) {
        console.error('Image upload error:', error)
        alert('이미지 업로드 중 오류가 발생했습니다.')
      }
    }
  }, [value, onChange]) // value와 onChange를 의존성에 추가

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

  // ReactQuill 인스턴스 설정 및 기본 이미지 처리 비활성화
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Quill) {
      try {
        // ReactQuill의 기본 이미지 핸들러를 완전히 비활성화
        const Image = window.Quill.import('formats/image')
        if (Image && Image.sanitize) {
          Image.sanitize = function(url: string) {
            // data: URL을 허용하지 않음
            if (url && url.startsWith('data:')) {
              return null
            }
            return url
          }
        }
      } catch (error) {
        console.warn('Quill Image module not available:', error)
      }
    }
  }, [])

  return (
          <div className="react-quill-editor" style={{ minHeight: '300px', position: 'relative' }}>
            {/* HTML 소스 보기 버튼 - 우측 상단 */}
            <div className="html-source-toggle" style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              zIndex: 10
            }}>
              <button
                type="button"
                onClick={() => setShowHtmlSource(!showHtmlSource)}
                className="html-source-button"
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#374151'
                }}
              >
                {showHtmlSource ? '에디터 보기' : 'HTML 소스 보기'}
              </button>
            </div>

            {/* HTML 소스 보기 모드 */}
            {showHtmlSource ? (
              <div className="html-source-container">
                <div className="html-source-header">
                  <span className="html-source-title">HTML 소스 코드</span>
                  <button
                    type="button"
                    onClick={() => setShowHtmlSource(false)}
                    className="html-source-close"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value)}
                  className="html-source-textarea"
                  placeholder="HTML 코드를 직접 편집할 수 있습니다..."
                  style={{
                    width: '100%',
                    minHeight: '300px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            ) : (
              <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{ 
                  height: 'auto',
                  minHeight: '300px'
                }}
                preserveWhitespace={true}
                bounds="self"
                scrollingContainer="self"
                readOnly={false}
              />
            )}
            <style jsx global>{`
              .react-quill-editor {
                min-height: 300px !important;
                height: auto !important;
                border-width: 0 !important;
              }
        .react-quill-editor .ql-container {
          min-height: 250px !important;
          height: auto !important;
          overflow: visible !important;
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        .react-quill-editor .ql-editor {
          min-height: 250px !important;
          height: auto !important;
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          overflow: visible !important;
          padding: 12px 15px !important;
        }
        .react-quill-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
        
        /* HTML 소스 보기 스타일 */
        .html-source-container {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          overflow: hidden;
        }
        
        .html-source-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background-color: #f9fafb;
          border-bottom: 1px solid #d1d5db;
        }
        
        .html-source-title {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        
        .html-source-close {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #6b7280;
          padding: 2px 4px;
          border-radius: 2px;
        }
        
        .html-source-close:hover {
          background-color: #e5e7eb;
          color: #374151;
        }
        
        .html-source-textarea {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
          line-height: 1.5;
          background-color: #fafafa;
        }
        
        .html-source-button:hover {
          background-color: #e5e7eb;
          border-color: #9ca3af;
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
        
        /* 툴팁 스타일 */
        .react-quill-editor .ql-toolbar button[title] {
          position: relative;
        }
        .react-quill-editor .ql-toolbar button[title]:hover::after {
          content: attr(title);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #1f2937;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 1000;
          margin-bottom: 4px;
        }
        .react-quill-editor .ql-toolbar button[title]:hover::before {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: #1f2937;
          z-index: 1000;
        }
        
        /* 기본 이미지 처리 비활성화 */
        .react-quill-editor .ql-editor img {
          max-width: 100%;
          height: auto;
        }
        
        /* ReactQuill 기본 이미지 업로드 비활성화 */
        .react-quill-editor .ql-editor img[src^="data:"] {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
