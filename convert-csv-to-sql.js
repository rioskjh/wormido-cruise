const fs = require('fs');
const csv = require('csv-parser');

// CSV 파일을 SQL INSERT 문으로 변환하는 함수
function convertCsvToSql(csvFilePath, tableName) {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        if (results.length === 0) {
          resolve('');
          return;
        }
        
        const columns = Object.keys(results[0]);
        const sqlStatements = results.map(row => {
          const values = columns.map(col => {
            const value = row[col];
            if (value === null || value === undefined || value === '') {
              return 'NULL';
            }
            // 문자열인 경우 따옴표로 감싸기
            return `'${value.toString().replace(/'/g, "''")}'`;
          });
          
          return `INSERT INTO "${tableName}" (${columns.map(col => `"${col}"`).join(', ')}) VALUES (${values.join(', ')});`;
        });
        
        resolve(sqlStatements.join('\n'));
      })
      .on('error', reject);
  });
}

// 사용 예시
async function main() {
  try {
    const csvDir = 'C:\\Users\\riosk\\OneDrive\\바탕 화면\\데이터파일\\';
    const outputDir = 'C:\\Users\\riosk\\OneDrive\\바탕 화면\\데이터파일\\';
    
    // 각 테이블별로 변환
    const tables = [
      'admins',
      'product_categories',
      'products', 
      'products_image',
      'product_options',
      'product_option_values',
      'navigations',
      'popups',
      'boards',
      'posts',
      'post_files',
      'members',
      'reservations',
      'person_type_prices',
      'contents',
      'site_settings'
    ];
    
    let allSql = '';
    
    for (const table of tables) {
      const csvFile = `${csvDir}${table}.csv`;
      const sqlFile = `${outputDir}${table}.sql`;
      
      if (fs.existsSync(csvFile)) {
        console.log(`Converting ${table}...`);
        const sql = await convertCsvToSql(csvFile, table);
        
        // 개별 SQL 파일로 저장
        fs.writeFileSync(sqlFile, sql);
        console.log(`SQL file created: ${sqlFile}`);
        
        // 전체 SQL에 추가
        allSql += `-- ${table} data\n${sql}\n\n`;
      } else {
        console.log(`CSV file not found: ${csvFile}`);
      }
    }
    
    // 전체 SQL 파일로 저장
    fs.writeFileSync(`${outputDir}all_data.sql`, allSql);
    console.log('All SQL file created: all_data.sql');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();


