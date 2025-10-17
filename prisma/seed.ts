import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 시드 데이터 생성 시작...')

  // 관리자 계정은 실제 데이터로 존재하므로 생성하지 않음

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
      type: 'NOTICE' as const,
      isAdminOnly: false,
    },
    {
      boardId: 'faq',
      title: '자주 묻는 질문',
      description: 'FAQ 게시판',
      type: 'FAQ' as const,
      isAdminOnly: false,
    },
    {
      boardId: 'qna',
      title: '문의하기',
      description: '고객 문의 게시판',
      type: 'QNA' as const,
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

  // 기본 컨텐츠 생성
  const contents = [
    {
      title: '단체여행',
      slug: 'groups',
      content: `
        <div class="content-section">
          <h2>편안한 항해, 특별한 추억!</h2>
          <p>단체 고객을 위한 월미도 유람선 전용 프로그램</p>
          
          <div class="image-section">
            <img src="/images/design-assets/aeefcb7185f8ec781f75ece941d96ec57ad9dad5.png" alt="월미도 유람선" />
            <h3>Cruise. Dine. Enjoy the show!</h3>
            <p>월미도 유람선에서 특별한 단체 여행을 경험해보세요. 아름다운 바다 풍경과 함께하는 즐거운 시간을 제공합니다.</p>
          </div>

          <h3>추천 대상</h3>
          <div class="recommendation-grid">
            <div class="recommendation-item">
              <h4>지정지단체, 복지단체, 경로단체</h4>
            </div>
            <div class="recommendation-item">
              <h4>외국인 단체 (엔터테인먼트 여행사, 버스 관광단체)</h4>
            </div>
            <div class="recommendation-item">
              <h4>유치원 나들이, 초·중·고등학교 체험학습</h4>
            </div>
            <div class="recommendation-item">
              <h4>기업 워크숍, 고객 초청행사, 상업기념행사 등</h4>
            </div>
          </div>

          <h3>단체여행 즐길거리</h3>
          <div class="enjoy-grid">
            <div class="enjoy-item">
              <h4>매일 달라지는 테마 공연</h4>
            </div>
            <div class="enjoy-item">
              <h4>월미도에서 만나는 선셋&야경</h4>
            </div>
            <div class="enjoy-item">
              <h4>갈매기 먹이주며 동심으로!</h4>
            </div>
            <div class="enjoy-item">
              <h4>로맨틱한 밤바다 위 불꽃놀이!</h4>
            </div>
          </div>

          <h3>주변 주요관광지 안내</h3>
          <p>유람선 여행 전후로 함께 즐기는 인천 명소 BEST 6</p>
        </div>
      `,
      description: '단체 고객을 위한 월미도 유람선 전용 프로그램 안내',
      keywords: '단체여행, 월미도, 유람선, 단체관광, 인천관광',
      isActive: true,
      isPublished: true,
      publishedAt: new Date()
    }
  ]

  for (const content of contents) {
    await prisma.content.upsert({
      where: { slug: content.slug },
      update: {},
      create: content,
    })
  }

  console.log('✅ 기본 컨텐츠 생성 완료')

  console.log('🎉 시드 데이터 생성 완료!')
  console.log('')
  console.log('📋 관리자 계정은 실제 데이터로 존재합니다.')
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