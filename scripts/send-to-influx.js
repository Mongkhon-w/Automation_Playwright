const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const fs = require('fs');
const path = require('path');

// ดึงค่าลับจาก Environment Variables (ถ้าไม่มีให้ใช้ค่า Local)
const url = process.env.INFLUX_URL || 'http://localhost:8086';
const token = process.env.INFLUX_TOKEN || 'my-super-secret-token';
const org = process.env.INFLUX_ORG || 'my-org';
const bucket = process.env.INFLUX_BUCKET || 'qa-metrics';

const influxDB = new InfluxDB({ url, token });
const writeApi = influxDB.getWriteApi(org, bucket);

// อ่านไฟล์ JSON Report ที่ Playwright สร้างขึ้น
const resultsPath = path.join(__dirname, '../test-results.json');

try {
  const data = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  
  // 1. ดึงสถิติทั้งหมดที่เราสนใจจาก Report (ถ้าไม่มีให้ใช้ค่า 0 แทน)
  const passed = data.stats.expected || 0;
  const failed = data.stats.unexpected || 0;
  const flaky = data.stats.flaky || 0;
  const skipped = data.stats.skipped || 0;
  
  // คำนวณจำนวนเทสทั้งหมด
  const total = passed + failed + flaky + skipped;
  
  // 2. แปลงระยะเวลาจากมิลลิวินาที (ms) เป็นวินาที (s) เพื่อให้กราฟโชว์ตัวเลขสวยๆ (เช่น 45.2 s)
  const duration_sec = (data.stats.duration || 0) / 1000;
  
  // 3. คำนวณ Pass Rate (%) ส่งไปด้วยเลย Grafana จะได้ไม่ต้องคำนวณซ้ำ
  const passRate = total > 0 ? (passed / total) * 100 : 0;

  // 4. แพ็คข้อมูลทั้งหมดลง Point เพื่อเตรียมยิงเข้า Database
  const point = new Point('qa_test_run')
    .intField('total_tests', total)
    .intField('passed', passed)
    .intField('failed', failed)
    .intField('flaky', flaky)
    .intField('skipped', skipped)
    .floatField('duration_sec', duration_sec)
    .floatField('pass_rate', passRate);

  // สั่งเขียนลง InfluxDB
  writeApi.writePoint(point);
  
  writeApi.close().then(() => {
    console.log('✅ ส่งข้อมูลเทสเข้า InfluxDB เรียบร้อยแล้ว!');
    console.log(`📊 สรุปผล: Total=${total} | Passed=${passed} | Failed=${failed} | PassRate=${passRate.toFixed(2)}% | Time=${duration_sec}s`);
  });

} catch (err) {
  console.error('❌ ข้อผิดพลาด (ไม่พบไฟล์ Report หรืออ่านค่าไม่ได้):', err.message);
}