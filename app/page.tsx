export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚢 Wormi Cruise
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            월미도 크루즈 예약 시스템
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              시스템 준비 완료! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              데이터베이스 연결 및 기본 설정이 완료되었습니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">✅ 완료된 작업</h3>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Supabase 데이터베이스 연결</li>
                  <li>• Prisma 스키마 설정</li>
                  <li>• 시드 데이터 생성</li>
                  <li>• Next.js 프로젝트 구조</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">🚀 다음 단계</h3>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• API 라우트 구현</li>
                  <li>• 인증 시스템 구축</li>
                  <li>• UI 컴포넌트 개발</li>
                  <li>• 예약 시스템 구현</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
