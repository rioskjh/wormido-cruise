'use client'

import { Editor } from '@tinymce/tinymce-react'
import { useRef } from 'react'

interface TinyMCEEditorProps {
  value: string
  onChange: (content: string) => void
  height?: number
  placeholder?: string
}

export default function TinyMCEEditor({ 
  value, 
  onChange, 
  height = 300,
  placeholder = '내용을 입력하세요...'
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null)

  const handleEditorChange = (content: string) => {
    onChange(content)
  }

  return (
    <div className="tinymce-editor">
      <Editor
        onInit={(_evt: any, editor: any) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
          ],
          toolbar: 'undo redo | blocks fontsize | ' +
            'bold italic underline strikethrough | forecolor backcolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | ' +
            'link image media table | ' +
            'removeformat | help',
          content_style: `
            body { 
              font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              font-size: 14px; 
              line-height: 1.6;
              color: #374151;
            }
            p { margin: 0 0 1em 0; }
            h1, h2, h3, h4, h5, h6 { margin: 1em 0 0.5em 0; font-weight: 600; }
            img { max-width: 100%; height: auto; }
            table { border-collapse: collapse; width: 100%; }
            table td, table th { border: 1px solid #d1d5db; padding: 8px; }
          `,
          placeholder: placeholder,
          branding: false,
          promotion: false,
          // 한국어 설정
          language: 'ko_KR',
          // 이미지 업로드 설정
          images_upload_handler: async (blobInfo: any) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => {
                resolve(reader.result as string)
              }
              reader.onerror = () => {
                reject('이미지 업로드 실패')
              }
              reader.readAsDataURL(blobInfo.blob())
            })
          },
          // 이미지 관련 설정
          image_advtab: true,
          image_uploadtab: true,
          image_caption: true,
          // 링크 설정
          link_assume_external_targets: true,
          link_default_protocol: 'https',
          // 테이블 설정
          table_default_attributes: {
            border: '1'
          },
          table_default_styles: {
            'border-collapse': 'collapse',
            'width': '100%'
          },
          // 기타 설정
          resize: 'vertical',
          elementpath: false,
          statusbar: false,
          // 폰트 크기 옵션
          fontsize_formats: '8px 10px 12px 14px 16px 18px 20px 24px 28px 32px 36px 48px',
          // 색상 팔레트
          color_map: [
            '000000', 'Black',
            '993300', 'Burnt orange',
            '333300', 'Dark olive',
            '003300', 'Dark green',
            '003366', 'Dark azure',
            '000080', 'Navy Blue',
            '333399', 'Indigo',
            '333333', 'Very dark gray',
            '800000', 'Maroon',
            'FF6600', 'Orange',
            '808000', 'Olive',
            '008000', 'Green',
            '008080', 'Teal',
            '0000FF', 'Blue',
            '666699', 'Grayish blue',
            '808080', 'Gray',
            'FF0000', 'Red',
            'FF9900', 'Amber',
            '99CC00', 'Yellow green',
            '339966', 'Sea green',
            '33CCCC', 'Turquoise',
            '3366FF', 'Royal blue',
            '800080', 'Purple',
            '999999', 'Medium gray',
            'FF00FF', 'Magenta',
            'FFCC00', 'Gold',
            'FFFF00', 'Yellow',
            '00FF00', 'Lime',
            '00FFFF', 'Aqua',
            '00CCFF', 'Sky blue',
            '993366', 'Red violet',
            'FFFFFF', 'White',
            'FF99CC', 'Pink',
            'FFCC99', 'Peach',
            'FFFF99', 'Light yellow',
            'CCFFCC', 'Pale green',
            'CCFFFF', 'Pale cyan',
            '99CCFF', 'Light sky blue',
            'CC99FF', 'Plum'
          ]
        }}
      />
    </div>
  )
}
