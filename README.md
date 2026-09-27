# สมุดแมทช์ — บันทึกผล PTCG

เว็บแอปสำหรับบันทึกผลการเล่น Pokémon TCG เขียนด้วย **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui** ทำงานฝั่งไคลเอนต์ทั้งหมด ไม่มี backend / ไม่มีฐานข้อมูลฝั่งเซิร์ฟเวอร์

## ฟีเจอร์

- 2 โหมด: **TCG Live** (บันทึกประจำวัน) และ **เล่นข้างนอก** (ตั้งชื่อรายการ, เลือกวันที่อิสระ, ระบุประเภทรายการ Gym / GBL / UBL / PBL / MBL)
- เลือกโปเกมอนแทนเด็ค (สูงสุด 2 ตัวต่อฝั่ง) จากฐานข้อมูลสไปรต์ 1,284 รายการ (โปเกมอนปกติ + Mega / Gigantamax / ร่างภูมิภาค ฯลฯ)
- ปุ่มติ๊ก 🧱 Brick สำหรับมือเปิดเกมเสีย
- สถิติรวม, อัตราชนะ, สถิติต่อเนื่อง, อัตรา Brick, ตารางสรุปคู่ต่อสู้, ประวัติการแข่งขัน
- ข้อมูลเก็บใน `localStorage` ของเบราว์เซอร์ผู้ใช้ (คีย์เดิม `ptcg_matchlog_v1` เข้ากันได้กับข้อมูลจากเวอร์ชัน static เดิม)

## เทคโนโลยีที่ใช้

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/) v4 (build จริงผ่าน PostCSS ไม่ใช่ Play CDN แบบเดิม)
- [shadcn/ui](https://ui.shadcn.com/) สำหรับคอมโพเนนต์พื้นฐาน (Button, Dialog, Input, Select, Table ฯลฯ)

## โครงสร้างไฟล์

```
app/                   App Router: layout, page, global styles
components/            React components ของแอป (ฟอร์ม, ตัวเลือกโปเกมอน, ตาราง ฯลฯ)
components/ui/         shadcn/ui primitives
lib/                    types, constants, localStorage helpers, สูตรคำนวณสถิติ
public/pokemon-data.json   ฐานข้อมูลสไปรต์โปเกมอน (id, name, sprite เป็น base64 data URI) โหลดผ่าน fetch() ตอนรันไทม์
```

## รันดูในเครื่อง

ติดตั้ง dependencies (แนะนำ [pnpm](https://pnpm.io/)):

```bash
pnpm install
pnpm dev
```

แล้วเปิด `http://localhost:3000`

### คำสั่งอื่น ๆ

```bash
pnpm build   # build production
pnpm start   # รันเซิร์ฟเวอร์ production จากผลลัพธ์ build
pnpm lint    # ตรวจโค้ดด้วย ESLint
```

## Deploy

แอปนี้เป็น Next.js app ที่ต้องมีขั้นตอน build จึงเหมาะกับแพลตฟอร์มที่รองรับ Next.js โดยตรง เช่น [Vercel](https://vercel.com/) (แนะนำ), Netlify หรือรันเป็น Node server เอง (`pnpm build && pnpm start`)

## หมายเหตุ

- ข้อมูลสไปรต์ใน `public/pokemon-data.json` ดึงมาจาก [PokeAPI/sprites](https://github.com/PokeAPI/sprites) (ชื่อภาษาอังกฤษจาก [PokeAPI/pokeapi](https://github.com/PokeAPI/pokeapi) data CSVs) แปลงเป็น base64 data URI ไว้ล่วงหน้า เพื่อให้แอปทำงานได้โดยไม่ต้องพึ่งอินเทอร์เน็ตหลังโหลดไฟล์นี้ครั้งแรก
- ข้อมูลแมทช์ทั้งหมดยังเก็บใน `localStorage` ของเบราว์เซอร์เหมือนเดิม ไม่มีการส่งข้อมูลขึ้นเซิร์ฟเวอร์ใด ๆ
