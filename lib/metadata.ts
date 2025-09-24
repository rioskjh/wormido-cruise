import { prisma } from './prisma'

export interface SiteMetadata {
  title: string
  description: string
  keywords: string
  author: string
}

export async function getSiteMetadata(): Promise<SiteMetadata> {
  // 빌드 시점에는 기본값만 반환 (데이터베이스 접근 방지)
  // Vercel 빌드 환경에서는 데이터베이스 접근을 하지 않음
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return {
      title: 'Wormi Cruise',
      description: '월미도 해양관광 크루즈와 함께하는 특별한 바다 여행',
      keywords: '월미도, 크루즈, 해양관광, 인천, 바다여행',
      author: '월미도 해양관광'
    }
  }

  try {
    const settings = await prisma.siteSettings.findMany({
      where: { 
        isActive: true,
        key: {
          in: ['site_title', 'site_description', 'site_keywords', 'site_author']
        }
      }
    })

    const metadata: SiteMetadata = {
      title: 'Wormi Cruise',
      description: '월미도 해양관광 크루즈와 함께하는 특별한 바다 여행',
      keywords: '월미도, 크루즈, 해양관광, 인천, 바다여행',
      author: '월미도 해양관광'
    }

    settings.forEach(setting => {
      switch (setting.key) {
        case 'site_title':
          metadata.title = setting.value
          break
        case 'site_description':
          metadata.description = setting.value
          break
        case 'site_keywords':
          metadata.keywords = setting.value
          break
        case 'site_author':
          metadata.author = setting.value
          break
      }
    })

    return metadata
  } catch (error) {
    console.error('Failed to load site metadata:', error)
    
    // 기본값 반환
    return {
      title: 'Wormi Cruise',
      description: '월미도 해양관광 크루즈와 함께하는 특별한 바다 여행',
      keywords: '월미도, 크루즈, 해양관광, 인천, 바다여행',
      author: '월미도 해양관광'
    }
  }
}
