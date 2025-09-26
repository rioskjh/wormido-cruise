'use client'

import { useState, useRef, useEffect } from 'react'

interface CKEditor5Props {
  value: string
  onChange: (content: string) => void
  height?: number
  placeholder?: string
}

export default function CKEditor5({
  value,
  onChange,
  height = 300,
  placeholder = '내용을 입력하세요...'
}: CKEditor5Props) {
  const [isClient, setIsClient] = useState(false)
  const [CKEditor, setCKEditor] = useState<any>(null)
  const [ClassicEditor, setClassicEditor] = useState<any>(null)
  const editorRef = useRef<any>(null)

  // 클라이언트 사이드에서만 CKEditor 로드
  useEffect(() => {
    setIsClient(true)
    
    const loadCKEditor = async () => {
      try {
        const [ckeditorModule, classicModule, sourceEditingModule] = await Promise.all([
          import('@ckeditor/ckeditor5-react'),
          import('@ckeditor/ckeditor5-build-classic'),
          import('@ckeditor/ckeditor5-source-editing')
        ])
        
        setCKEditor(() => ckeditorModule.CKEditor)
        setClassicEditor(() => classicModule.default)
        
        // SourceEditing 플러그인을 ClassicEditor에 추가
        if (classicModule.default && sourceEditingModule) {
          classicModule.default.builtinPlugins.push(sourceEditingModule as any)
        }
      } catch (error) {
        console.error('CKEditor 로드 실패:', error)
      }
    }
    
    loadCKEditor()
  }, [])

  // 이미지 업로드 어댑터 설정
  const uploadAdapter = (loader: any) => {
    return {
      upload: async () => {
        try {
          const file = await loader.file
          
          // 파일 크기 검증 (5MB 제한)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error('파일 크기는 5MB를 초과할 수 없습니다.')
          }

          const formData = new FormData()
          formData.append('image', file)

          // 관리자 토큰 찾기
          const token = localStorage.getItem('adminToken') || 
                       localStorage.getItem('admin_access_token') || 
                       localStorage.getItem('access_token') || 
                       localStorage.getItem('admin_token')
          
          if (!token) {
            throw new Error('관리자 로그인이 필요합니다.')
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
            return {
              default: result.data.url
            }
          } else {
            throw new Error(result.error || '이미지 업로드에 실패했습니다.')
          }
        } catch (error) {
          console.error('Image upload error:', error)
          throw error
        }
      },
      abort: () => {
        // 업로드 취소 처리
      }
    }
  }

  // CKEditor 설정
  const editorConfiguration = {
    placeholder,
    toolbar: {
      items: [
        'heading', '|',
        'bold', 'italic', 'underline', 'strikethrough', '|',
        'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
        'bulletedList', 'numberedList', '|',
        'outdent', 'indent', '|',
        'alignment', '|',
        'link', 'imageUpload', 'blockQuote', 'insertTable', '|',
        'undo', 'redo', '|',
        'sourceEditing'
      ]
    },
    image: {
      toolbar: [
        'imageTextAlternative', '|',
        'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight'
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn', 'tableRow', 'mergeTableCells'
      ]
    },
    extraPlugins: [
      function(editor: any) {
        editor.plugins.get('FileRepository').createUploadAdapter = uploadAdapter
      }
    ]
  }

  return (
    <div className="ckeditor5-container" style={{ minHeight: '300px' }}>
      {!isClient || !CKEditor || !ClassicEditor ? (
        <div className="h-32 bg-gray-100 rounded-md animate-pulse flex items-center justify-center text-gray-500">
          에디터 로딩 중...
        </div>
      ) : (
        <CKEditor
          editor={ClassicEditor}
          data={value}
          config={editorConfiguration}
          onReady={(editor: any) => {
            editorRef.current = editor
            console.log('CKEditor is ready to use!', editor)
          }}
          onChange={(event: any, editor: any) => {
            const data = editor.getData()
            onChange(data)
          }}
          onBlur={(event: any, editor: any) => {
            console.log('Blur.', editor)
          }}
          onFocus={(event: any, editor: any) => {
            console.log('Focus.', editor)
          }}
        />
      )}
      
      <style jsx global>{`
        .ckeditor5-container {
          min-height: 300px !important;
          border-width: 0 !important;
        }
        
        .ckeditor5-container .ck-editor__editable {
          min-height: 250px !important;
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .ckeditor5-container .ck-editor__editable:focus {
          outline: none !important;
          border: none !important;
        }
      `}</style>
    </div>
  )
}
