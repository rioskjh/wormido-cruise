import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 관리자 계정 생성
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@wormi-cruise.com',
      name: '관리자',
      role: 'SUPER_ADMIN',
    },
  })

  // 상품 카테고리 생성
  const category = await prisma.productCategory.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '크루즈 투어',
      description: '월미도 크루즈 투어 상품',
      sortOrder: 1,
    },
  })

  // 상품 생성
  const product = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '월미도 크루즈 투어',
      description: '아름다운 월미도 바다를 즐기는 크루즈 투어',
      categoryId: category.id,
      basePrice: 50000,
      adultPrice: 50000,
      childPrice: 30000,
      infantPrice: 0,
      maxCapacity: 100,
      isActive: true,
    },
  })

  // 인원 타입별 가격 설정
  await prisma.personTypePrice.upsert({
    where: {
      productId_personType: {
        productId: product.id,
        personType: 'ADULT',
      },
    },
    update: {},
    create: {
      productId: product.id,
      personType: 'ADULT',
      price: 50000,
    },
  })

  await prisma.personTypePrice.upsert({
    where: {
      productId_personType: {
        productId: product.id,
        personType: 'CHILD',
      },
    },
    update: {},
    create: {
      productId: product.id,
      personType: 'CHILD',
      price: 30000,
    },
  })

  await prisma.personTypePrice.upsert({
    where: {
      productId_personType: {
        productId: product.id,
        personType: 'INFANT',
      },
    },
    update: {},
    create: {
      productId: product.id,
      personType: 'INFANT',
      price: 0,
    },
  })

  // 게시판 생성
  await prisma.board.upsert({
    where: { boardId: 'notice' },
    update: {},
    create: {
      boardId: 'notice',
      title: '공지사항',
      description: '월미도 크루즈 공지사항',
      useComment: true,
      useUpload: false,
    },
  })

  console.log('시드 데이터 생성 완료!')
  console.log('관리자 계정:', admin)
  console.log('상품:', product)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })