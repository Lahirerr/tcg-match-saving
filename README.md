# สมุดแมทช์ — บันทึกผล PTCG

เว็บแอปสำหรับบันทึกผลการเล่น Pokémon TCG แบบ static site เขียนด้วย HTML + Tailwind CSS (CDN) + JavaScript ล้วน ไม่ต้อง build ไม่ต้องมี backend

## ฟีเจอร์

- 2 โหมด: **TCG Live** (บันทึกประจำวัน) และ **เล่นข้างนอก** (ตั้งชื่อรายการ, เลือกวันที่อิสระ, ระบุประเภทรายการ Gym / GBL / UBL / PBL / MBL)
- เลือกโปเกมอนแทนเด็ค (สูงสุด 2 ตัวต่อฝั่ง) จากฐานข้อมูลสไปรต์ 1,284 รายการ (โปเกมอนปกติ + Mega / Gigantamax / ร่างภูมิภาค ฯลฯ)
- ปุ่มติ๊ก 🧱 Brick สำหรับมือเปิดเกมเสีย
- สถิติรวม, อัตราชนะ, สถิติต่อเนื่อง, อัตรา Brick, ตารางสรุปคู่ต่อสู้, ประวัติการแข่งขัน
- ข้อมูลเก็บใน `localStorage` ของเบราว์เซอร์ผู้ใช้ (ไม่มีเซิร์ฟเวอร์ ไม่มีฐานข้อมูล)

## โครงสร้างไฟล์

```
index.html          หน้าเว็บทั้งหมด (HTML + Tailwind CDN + JavaScript)
pokemon-data.json    ฐานข้อมูลสไปรต์โปเกมอน (id, name, sprite เป็น base64 data URI) โหลดผ่าน fetch()
```

ไม่มีขั้นตอน build ใดๆ — เป็น static site ล้วนๆ

## รันดูในเครื่อง

ต้องรันผ่าน local server (ไม่ใช่เปิดไฟล์ตรงๆ ด้วย `file://`) เพราะหน้าเว็บใช้ `fetch()` โหลด `pokemon-data.json`:

```bash
python3 -m http.server 8000
# หรือ
npx serve .
```

แล้วเปิด `http://localhost:8000`

## Deploy ขึ้น GitHub Pages

1. Push โฟลเดอร์นี้ขึ้น repository บน GitHub
2. ไปที่ **Settings → Pages**
3. เลือก branch (เช่น `main`) และโฟลเดอร์ `/ (root)`
4. บันทึก แล้วรอสักครู่ ลิงก์เว็บจะขึ้นให้ตาม `https://<username>.github.io/<repo>/`

หรือจะ deploy ผ่าน Netlify / Vercel / Cloudflare Pages ก็ได้เช่นกัน (ลาก-วางโฟลเดอร์นี้ หรือเชื่อม repo) เพราะเป็น static site ล้วนๆ ไม่มี build step

## หมายเหตุ

- ข้อมูลสไปรต์ใน `pokemon-data.json` ดึงมาจาก [PokeAPI/sprites](https://github.com/PokeAPI/sprites) (ชื่อภาษาอังกฤษจาก [PokeAPI/pokeapi](https://github.com/PokeAPI/pokeapi) data CSVs) แปลงเป็น base64 data URI ไว้ล่วงหน้า เพื่อให้แอปทำงานได้โดยไม่ต้องพึ่งอินเทอร์เน็ตหลังโหลดไฟล์นี้ครั้งแรก
- Tailwind โหลดผ่าน Play CDN (`cdn.tailwindcss.com`) เหมาะสำหรับต้นแบบ/ใช้งานส่วนตัว หากต้องการ production build ที่ optimize ขนาดไฟล์ CSS แนะนำให้ตั้งค่า Tailwind CLI หรือย้ายไปใช้เฟรมเวิร์กที่มีขั้นตอน build (เช่น Vite หรือ Next.js)
