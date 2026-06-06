# 🚀 QA Automation Pipeline
ระบบทดสอบอัตโนมัติ (Automated Testing) ที่ทำงานร่วมกับฐานข้อมูล Time-series และหน้าจอ Dashboard แบบ Real-time ครอบคลุมตั้งแต่การรันเทสบน Local ไปจนถึง CI/CD Pipeline

## 🛠️ Required Tools
* Playwright - สำหรับรัน E2E Testing
* InfluxDB - ฐานข้อมูลสำหรับเก็บสถิติผลการเทส (Time-Series Database)
* Grafana - สำหรับสร้าง Dashboard แสดงผลข้อมูลระดับผู้บริหาร
* GitHub Actions - สำหรับทำ CI/CD Pipeline
* Docker - สำหรับจำลองเซิร์ฟเวอร์ InfluxDB และ Grafana

## 🏗️ Phase 1: Development Setup (การตั้งค่าโปรเจกต์)

### ติดตั้งโปรเจกต์และเครื่องมือ
```bash
npm init playwright@latest
npm install @influxdata/influxdb-client
npm install --save-dev @types/node
```

### สร้างไฟล์ Configuration เบื้องต้น
```bash
docker-compose.yml (สำหรับสร้างเซิร์ฟเวอร์ InfluxDB & Grafana)

tsconfig.json (ตั้งค่า TypeScript Module)

playwright.config.ts (ตั้งค่า Playwright และ Report)

tests/example.spec.ts (ไฟล์สคริปต์เทส)
```

### 🌉 เตรียมสคริปต์ Bridge สำหรับส่งข้อมูล (Node.js)
```bash
scripts/send-to-influx.js
```
เพื่อใช้อ่านไฟล์ test-results.json และส่งเข้า InfluxDB


## 🚀 Running Locally (การรันทดสอบในเครื่อง)
### 🏃‍♂️ Running 
```bash
docker compose up -d
npx playwright test (เมื่อรันเสร็จ ระบบจะสร้างไฟล์ test-results.json ขึ้นมา)
node scripts/send-to-influx.js (หากสำเร็จ จะขึ้นข้อความสีเขียว ✅ ส่งข้อมูลเทสเข้า InfluxDB เรียบร้อยแล้ว!)
```
## Monitoring & Visualization (การตรวจสอบผลลัพธ์)
### 🔎 วิธีเข้า InfluxDB
1. เปิดเว็บบราวเซอร์ (Chrome, Edge ฯลฯ) แล้วพิมพ์ URL นี้
```bash
👉 http://localhost:8086
```
2. ระบบจะพาไปหน้า Login 
```bash
Username: admin
Password: adminpassword
```
3. ไปที่เมนูด้านซ้าย เลือก Data Explorer 📈
4. ตั้งค่า Query Builder ด้านล่าง
```bash
FROM: เลือกถังข้อมูล qa-metrics
Filter: เลือก _measurement เป็น qa_test_run
```
5. กดปุ่ม SUBMIT สีน้ำเงิน (กดปุ่ม View Raw Data เพื่อดูตัวเลขสถิติดิบ)


## 🎨 ตั้งค่า Grafana Dashboard
1. เข้าสู่ระบบ Grafana 👉 http://localhost:3000
```bash
Username: admin
Password: admin
```
(ระบบอาจจะบังคับให้เปลี่ยนรหัสผ่าน จะตั้งใหม่ หรือกดปุ่ม Skip ข้ามไปก่อนก็ได้)

2. ไปที่เมนู Connections > Data sources เลือก Add data sourc
3. ค้นหา InfluxDB และตั้งค่าดังนี้
```bash
Query Language: เปลี่ยนเป็น Flux ⚠️ (สำคัญมาก)
URL: http://qa_influxdb:8086 (ต้องใช้ชื่อ qa_influxdb เพราะมันเป็นชื่อ Container ที่คุยกันใน Docker)
Organization: my-org
Token: my-super-secret-token
Default Bucket: qa-metrics
```
4. กดปุ่ม Save & test (ต้องขึ้นแถบสีเขียวแจ้งว่า Data source is working แปลว่าเชื่อมต่อสำเร็จ)

## 🎨 สร้าง Grafana Dashboard (Panel Guide)
ไปที่ Dashboards > New dashboard > + Add visualization เลือก InfluxDB และใช้โค้ด Flux ด้านล่างในการสร้างแต่ละกราฟ

### 🟦 กล่องที่ 1: Total Tests (สีน้ำเงิน)
ตั้งชื่อ Panel Title ว่า Total Tests
```bash
from(bucket: "qa-metrics")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "qa_test_run")
  |> filter(fn: (r) => r["_field"] == "total_tests")
  |> last()
```
1. เลือก Visualization ด้านขวาเป็น Stat
2. หัวข้อ Stat styles > Color mode เปลี่ยนเป็น Background solid (เพื่อเทสีเต็มกล่อง)
3. หัวข้อ Stat styles > Graph mode เปลี่ยนเป็น None (เพื่อซ่อนเส้นกราฟเล็กๆ กวนใจ ให้เหลือแค่ตัวเลขคลีนๆ)
4. หัวข้อ Standard options > Color scheme เปลี่ยนเป็น Single color แล้วจิ้มเลือกสีตามที่ระบุไว้

### 🟩 กล่องที่ 2: Passed (สีเขียว)
ตั้งชื่อ Panel Title ว่า Passed
```bash
from(bucket: "qa-metrics")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "qa_test_run")
  |> filter(fn: (r) => r["_field"] == "passed")
  |> last()
```

### 🟥 กล่องที่ 3: Failed (สีแดง)
ตั้งชื่อ Panel Title ว่า Failed
```bash
from(bucket: "qa-metrics")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "qa_test_run")
  |> filter(fn: (r) => r["_field"] == "failed")
  |> last()
```

### 🟨 กล่องที่ 4: Skipped (สีเหลือง)
ตั้งชื่อ Panel Title ว่า Skipped
```bash
from(bucket: "qa-metrics")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "qa_test_run")
  |> filter(fn: (r) => r["_field"] == "skipped")
  |> last()
```

### 🟧 กล่องที่ 5: Flaky (สีส้ม)
ตั้งชื่อ Panel Title ว่า Flaky
```bash
from(bucket: "qa-metrics")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "qa_test_run")
  |> filter(fn: (r) => r["_field"] == "flaky")
  |> last()
```

### 🟪 กล่องที่ 6: Duration (สีม่วง)
ตั้งชื่อ Panel Title ว่า Duration
```bash
from(bucket: "qa-metrics")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "qa_test_run")
  |> filter(fn: (r) => r["_field"] == "duration_sec")
  |> last()
```

### กราฟครึ่งวงกลมแสดงเปอร์เซ็นต์ (Pass Rate Gauge)
```bash
from(bucket: "qa-metrics")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "qa_test_run")
  |> filter(fn: (r) => r["_field"] == "pass_rate")
  |> last()
```
1. เลือก Visualization เป็น Gauge
2. หัวข้อ Standard options > Unit เลือก Misc > Percent (0-100)
3. หัวข้อ Standard options > Min = 0, Max = 100
4. หัวข้อ Thresholds ปรับสีตามช่วงเปอร์เซ็นต์ (เช่น ต่ำกว่า 80 เป็นแดง, 80-95 เป็นเหลือง, 95 ขึ้นไปเป็นเขียว)

### กราฟโดนัทสัดส่วนการเทส (Test Results Distribution)
```bash
from(bucket: "qa-metrics")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "qa_test_run")
  |> filter(fn: (r) => r["_field"] =~ /passed|failed|flaky|skipped/)
  |> last()
```
1. เลือก Visualization เป็น Pie chart
2. หัวข้อ Pie chart options > Pie chart type เลือก Donut
3. หัวข้อ Legend > Placement เลือก Bottom (เพื่อให้คำอธิบายไปอยู่ข้างล่างกราฟ)
4. ปรับสี Passed เป็นเขียว, Failed เป็นแดง ผ่านเมนู Overrides แบบเดียวกับกล่องสถิติ

### กราฟเส้นแนวโน้ม (Trends Over Time)
สำหรับดูกราฟย้อนหลัง (เช่น Test Duration Over Time หรือ Pass Rate Over Time)
```bash
from(bucket: "qa-metrics")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "qa_test_run")
  |> filter(fn: (r) => r["_field"] == "pass_rate") 
  |> aggregateWindow(every: v.windowPeriod, fn: last, createEmpty: false)
  |> yield(name: "last")
```
(ถ้าอยากดูกราฟเวลา ให้เปลี่ยน pass_rate เป็น duration_sec)
1. เลือก Visualization เป็น Time series
2. หัวข้อ Graph styles > Line width ปรับความหนาเส้น (แนะนำ 2)
3. หัวข้อ Graph styles > Fill opacity ปรับความทึบของสีใต้เส้น (เช่น 20-30%) จะได้เงาสีลงมาถึงพื้น
4. หัวข้อ Graph styles > Show points เลือก Always หรือ Auto เพื่อให้มีจุดตรงข้อมูลแต่ละครั้ง

### กราฟแท่งซ้อน (Test Results Stacked Bar)
```bash
from(bucket: "qa-metrics")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "qa_test_run")
  |> filter(fn: (r) => r["_field"] =~ /passed|failed|flaky|skipped/)
  |> aggregateWindow(every: v.windowPeriod, fn: last, createEmpty: false)
  |> yield(name: "last")
```
1. เลือก Visualization เป็น Bar chart
2. หัวข้อ Bar chart options > Stacking เลือก Normal (นี่คือทริคสำคัญที่ทำให้แท่งสีเขียว สีแดง มาต่อกันเป็นแท่งเดียวในแต่ละรอบ)

### ตารางประวัติการรัน (Detailed Data / Test Run History)
นี่คือส่วนที่ต้องใช้ท่าพิเศษใน Flux เพื่อพลิกข้อมูล (Pivot) ให้กลายเป็นคอลัมน์ตาราง
```bash
from(bucket: "qa-metrics")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "qa_test_run")
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> drop(columns: ["_start", "_stop", "_measurement"])
  |> sort(columns: ["_time"], desc: true)
```
1. เลือก Visualization เป็น Table
2. เพื่อเรียงลำดับคอลัมน์ให้ดูง่าย ให้ไปที่แท็บ Transform data (อยู่ข้างๆ แท็บ Query ด้านล่าง)
3. พิมพ์หาคำว่า Organize fields
4. ลากสลับตำแหน่งคอลัมน์ได้ตามใจชอบ (เช่น เอา _time ขึ้นก่อน ตามด้วย duration_sec, passed, failed ฯลฯ)

## ☁️ Phase 5: CI/CD Pipeline & Troubleshooting
1. สร้างไฟล์
```bash
.github/workflows/playwright.yml
```
### 🚧 วิธีแก้ปัญหา: Push โค้ดขึ้น GitHub ไม่ผ่าน (Error: Workflow Scope)
หากพบ Error ปฏิเสธการสร้าง Workflow สามารถแก้ไขได้โดยการใช้ Personal Access Token (PAT)
1. เข้าเว็บ GitHub ไปที่เมนู Settings (มุมขวาบนตรงรูปโปรไฟล์) > เลื่อนลงมาล่างสุดเลือก Developer settings > Personal access tokens > Tokens (classic)
2. กดปุ่ม Generate new token (classic)
3. ตั้งชื่ออะไรก็ได้ (เช่น VS Code Mac) และตรงช่อง Select scopes ให้ติ๊กถูก 2 ช่องนี้:
```bash
- repo (สิทธิ์จัดการโปรเจกต์)
- workflow (สิทธิ์จัดการไฟล์ CI/CD) ✅ ตัวนี้คือตัวที่ทำให้เกิด Error
```
4. เลื่อนลงมาล่างสุด กด Generate token แล้ว ก๊อปปี้รหัสยาวๆ นั้นเก็บไว้
5. กลับมาที่ Terminal ใน VS Code พิมพ์คำสั่งนี้เพื่อเปลี่ยนรหัสผ่าน (แทนที่ [ใส่รหัสTokenที่ก๊อปปี้มา] ด้วยรหัสจริง)
```bash
- git remote set-url origin https://[ใส่รหัสTokenที่ก๊อปปี้มา]@github.com/...../.........git
```
6. พิมพ์คำสั่ง Push โค้ดอีกครั้ง: git push -u origin mongkhon/feat/setup/config
```bash
- git push -u origin ..../feat/setup/config
```
