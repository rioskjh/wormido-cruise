import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 시드 데이터 생성 시작...')

  // 관리자 계정 생성
  const hashedPassword = await bcrypt.hash('admin123!', 12)
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@wolmido.com',
      name: '관리자',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })

  console.log('✅ 관리자 계정 생성 완료:', {
    username: admin.username,
    email: admin.email,
    role: admin.role,
  })

  // 기본 설정 데이터 생성
  const settings = [
    {
      key: 'site_name',
      value: '월미도 해양관광',
      description: '사이트 이름',
      category: 'general',
    },
    {
      key: 'site_description',
      value: '월미도 크루즈 예약 시스템',
      description: '사이트 설명',
      category: 'general',
    },
    {
      key: 'contact_phone',
      value: '032-765-1171',
      description: '연락처',
      category: 'contact',
    },
    {
      key: 'contact_email',
      value: 'info@wolmido.com',
      description: '이메일',
      category: 'contact',
    },
  ]

  for (const setting of settings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('✅ 기본 설정 데이터 생성 완료')

  // 기본 게시판 생성
  const boards = [
    {
      boardId: 'notice',
      title: '공지사항',
      description: '월미도 해양관광 공지사항',
      type: 'NOTICE',
      isAdminOnly: false,
    },
    {
      boardId: 'faq',
      title: '자주 묻는 질문',
      description: 'FAQ 게시판',
      type: 'FAQ',
      isAdminOnly: false,
    },
    {
      boardId: 'qna',
      title: '문의하기',
      description: '고객 문의 게시판',
      type: 'QNA',
      isAdminOnly: false,
    },
  ]

  for (const board of boards) {
    await prisma.board.upsert({
      where: { boardId: board.boardId },
      update: {},
      create: board,
    })
  }

  console.log('✅ 기본 게시판 생성 완료')

  console.log('🎉 시드 데이터 생성 완료!')
  console.log('')
  console.log('📋 관리자 로그인 정보:')
  console.log('   사용자명: admin')
  console.log('   비밀번호: admin123!')
  console.log('   URL: /admin/login')
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 실패:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })