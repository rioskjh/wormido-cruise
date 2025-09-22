import { prisma } from './prisma'

export interface SiteMetadata {
  title: string
  description: string
  keywords: string
  author: string
}

export async function getSiteMetadata(): Promise<SiteMetadata> {
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
