# Automation Pipeline

## 🛠️ Required Tools
* Playwright  
* InfluxDB 
* Grafana 
* GitHub Actions

## 🏗️ Development Setup

### สร้าง Infrastructure ด้วย Docker 
```bash
docker-compose.yml
```

## 🏃‍♂️ Running docker
```bash
docker compose up -d
```

### ตั้งค่า Playwright และเขียนเทส
```bash
npm init playwright@latest
npm install @influxdata/influxdb-client
npm install --save-dev @types/node
```

### สร้างไฟล์ tsconfig
```bash
tsconfig.json
```