const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://wolmido:dnjfaleh*1001@115.68.178.250:5432/wolmido_db?schema=public"
    }
  }
});

// 이미지 다운로드 함수
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(filePath)}`);
          resolve();
        });
      } else {
        console.log(`❌ Failed to download: ${url} (Status: ${response.statusCode})`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.log(`❌ Error downloading ${url}:`, err.message);
      reject(err);
    });
  });
}

// 로컬 이미지 경로로 업데이트
async function updateImagePath(imageId, newPath) {
  try {
    await prisma.productImage.update({
      where: { id: imageId },
      data: { filePath: newPath }
    });
    console.log(`✅ Updated database: ID ${imageId} -> ${newPath}`);
  } catch (error) {
    console.log(`❌ Failed to update database for ID ${imageId}:`, error.message);
  }
}

async function migrateImages() {
  try {
    console.log('🔄 Starting image migration...');
    
    // 모든 상품 이미지 조회
    const images = await prisma.productImage.findMany({
      where: { isActive: true },
      include: { product: true }
    });
    
    console.log(`📊 Found ${images.length} images to migrate`);
    
    // public/images 디렉토리 생성
    const imagesDir = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const image of images) {
      try {
        const originalUrl = image.filePath;
        
        // Vercel 스토리지 URL인지 확인
        if (originalUrl.includes('vercel-storage.com') || originalUrl.includes('blob.vercel-storage.com')) {
          console.log(`\n🔄 Processing: ${image.fileName}`);
          console.log(`   Original URL: ${originalUrl}`);
          
          // 로컬 파일 경로 생성
          const localPath = `/images/${image.fileName}`;
          const localFilePath = path.join(imagesDir, image.fileName);
          
          // 이미지 다운로드
          await downloadImage(originalUrl, localFilePath);
          
          // 데이터베이스 경로 업데이트
          await updateImagePath(image.id, localPath);
          
          successCount++;
        } else {
          console.log(`⏭️  Skipping (not Vercel URL): ${image.fileName}`);
        }
        
        // 요청 간격 조절 (서버 부하 방지)
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ Failed to migrate ${image.fileName}:`, error.message);
        failCount++;
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📁 Images saved to: ${imagesDir}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
migrateImages();


