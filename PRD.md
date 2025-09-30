# Product Requirement Document (PRD)

## Dashboard Monitoring Application

### Executive Summary

Aplikasi **Dashboard Monitoring** adalah solusi berbasis web yang dibangun dengan React.js untuk memantau progress dokumen melalui visualisasi data yang diambil dari file Excel. Aplikasi ini menyediakan interface yang modern, responsif, dan user-friendly untuk berbagai departemen dalam organisasi.

---

## 1. Tujuan Proyek

### Primary Goals

- Membangun dashboard monitoring berbasis web yang menampilkan progress dokumen dari file Excel
- Memberikan visualisasi yang jelas dan mudah dipahami mengenai status dokumen
- Menyediakan interface yang responsif dan modern

### Success Metrics

- User dapat dengan mudah upload dan memproses file Excel
- Progress dokumen dapat divisualisasikan dengan akurat
- Aplikasi responsif di berbagai perangkat (desktop & mobile)
- Load time < 3 detik untuk memproses file Excel standar

---

## 2. Target Users

### Primary Users

- **Balai** - Mengelola dokumen proyek infrastruktur
- **Subdirektorat Wilayah IV, Direktorat Irigasi dan Rawa** - Monitoring proyek irigasi
- **Sekretariat Jenderal** - Oversight dokumen administratif
- **Inspektur Jenderal** - Audit dan compliance monitoring
- **Menteri PU** - Executive oversight dan reporting

### User Journey

1. User mengakses halaman utama
2. Memilih salah satu dari 6 menu departemen
3. Upload file Excel dengan data dokumen
4. Melihat dashboard dengan visualisasi progress
5. Menganalisis detail melalui tabel dan timeline

---

## 3. Technical Stack

### Frontend Framework

- **React.js** (dengan TypeScript)
- **TailwindCSS** untuk styling system
- **shadcn/ui** untuk komponen UI yang konsisten

### Libraries & Dependencies

- **Recharts** - Untuk visualisasi chart dan grafik
- **SheetJS (xlsx)** - Untuk parsing file Excel
- **Lucide React** - Icon library
- **React Router** - Untuk navigasi antar halaman

### Deployment

- **Development**: Local development server
- **Production**: Static hosting (Vercel/Netlify recommended)

---

## 4. Functional Requirements

### 4.1 Halaman Utama (Landing Page)

#### Features

- **Menu Grid**: Tampilan 6 card menu utama dalam layout responsif
- **Icon Integration**: Setiap menu dilengkapi dengan icon yang representatif
- **Navigation**: Click navigation ke dashboard masing-masing departemen

#### Menu Items

1. **Balai** 🏢
2. **Subdirektorat Wilayah IV, Direktorat Irigasi dan Rawa** 🌊
3. **Sekretariat Jenderal** 📋
4. **Inspektur Jenderal** 🔍
5. **Menteri PU** 👨‍💼
6. **Menu Tambahan** (Reserved for future use)

### 4.2 Dashboard Departemen

Setiap departemen memiliki dashboard dengan 4 section utama:

#### 4.2.1 Header Section

- **Input Fields**:
  - Nama Paket (Text Input)
  - Sinkronisasi (Text Input/DateTime)
- **File Upload**: Excel file upload dengan drag & drop support
- **Action Buttons**: Refresh, Export, Settings

#### 4.2.2 Progress Section

- **Circle Chart (Donut Chart)**:
  - Menampilkan persentase progress dokumen
  - Kalkulasi otomatis: (Dokumen Selesai ÷ Total Dokumen) × 100%
  - Color coding: Red (0-33%), Yellow (34-66%), Green (67-100%)
- **Progress Metrics**:
  - Total Dokumen
  - Dokumen Selesai
  - Dokumen Dalam Proses
  - Dokumen Belum Dimulai

#### 4.2.3 Detail Table Section

- **Data Columns**:
  - Nama Dokumen
  - Status (Selesai/Dalam Proses/Belum Dimulai)
  - Tanggal Diterima
  - Tanggal Selesai
  - PIC (Person in Charge)
- **Table Features**:
  - Sorting by column
  - Search/Filter functionality
  - Pagination untuk dataset besar
  - Export to CSV/PDF

#### 4.2.4 Timeline Section

- **Timeline Visualization**:
  - Chronological display of document progress
  - Status updates dengan timestamp
  - Visual indicators untuk setiap milestone
- **Timeline Features**:
  - Filter by date range
  - Filter by status
  - Click to view detail

### 4.3 Excel Integration

#### File Processing

- **Supported Formats**: .xlsx, .xls
- **Data Mapping**:
  ```
  Column A: Nama Dokumen
  Column B: Status
  Column C: Tanggal Diterima
  Column D: Tanggal Selesai
  Column E: PIC (Optional)
  ```
- **Auto-sync**: Real-time update when file changes detected

#### Error Handling

- File format validation
- Data structure validation
- Missing data handling
- Large file optimization

---

## 5. Non-Functional Requirements

### 5.1 Performance

- **Load Time**: < 3 seconds untuk file Excel < 10MB
- **Responsiveness**: UI response < 1 second
- **Memory Usage**: Optimized untuk file hingga 50MB

### 5.2 Usability

- **Responsive Design**: Support desktop (1920px+), tablet (768px+), mobile (375px+)
- **Accessibility**: WCAG 2.1 AA compliance
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### 5.3 Reliability

- **Uptime**: 99.9% availability target
- **Error Recovery**: Graceful handling of network/file errors
- **Data Integrity**: Validation dan backup mechanism

### 5.4 Security

- **File Upload**: Client-side processing only (no server upload)
- **Data Privacy**: No data persistence beyond browser session
- **XSS Protection**: Input sanitization

---

## 6. User Interface Design

### 6.1 Design System

- **Color Palette**:

  - Primary: Blue (#3B82F6)
  - Secondary: Gray (#6B7280)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Error: Red (#EF4444)

- **Typography**:
  - Headings: Inter Bold
  - Body: Inter Regular
  - Monospace: JetBrains Mono

### 6.2 Component Library

- Menggunakan shadcn/ui untuk konsistensi
- Custom components untuk specific business logic
- Reusable components untuk efficiency

### 6.3 Layout Structure

```
├── Header (Navigation & Branding)
├── Main Content Area
│   ├── Dashboard Sections (4 sections)
│   └── Side Panel (Filters/Actions)
└── Footer (Links & Info)
```

---

## 7. Implementation Timeline

### Phase 1: Foundation (Week 1)

- [x] Project setup dengan React + TypeScript
- [x] TailwindCSS configuration
- [x] Basic routing structure
- [ ] Component library setup (shadcn/ui)

### Phase 2: Core Features (Week 2-3)

- [ ] Landing page dengan 6 menu cards
- [ ] Dashboard layout dan routing
- [ ] Excel upload dan parsing
- [ ] Basic chart implementation

### Phase 3: Advanced Features (Week 4)

- [ ] Detail table dengan sorting/filtering
- [ ] Timeline visualization
- [ ] Responsive design optimization
- [ ] Error handling implementation

### Phase 4: Polish & Testing (Week 5)

- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Documentation completion

---

## 8. Success Criteria

### Minimum Viable Product (MVP)

- ✅ 6 menu cards pada landing page
- ⏳ Excel file upload dan parsing
- ⏳ Basic progress chart
- ⏳ Data table display
- ⏳ Responsive layout

### Full Feature Set

- ⏳ Advanced filtering dan sorting
- ⏳ Timeline visualization
- ⏳ Export functionality
- ⏳ Error handling
- ⏳ Performance optimization

---

## 9. Risks & Mitigation

### Technical Risks

1. **Large Excel File Processing**

   - _Risk_: Performance degradation
   - _Mitigation_: Implement chunked processing dan pagination

2. **Browser Compatibility**

   - _Risk_: Inconsistent behavior across browsers
   - _Mitigation_: Comprehensive cross-browser testing

3. **Data Format Variations**
   - _Risk_: Excel files dengan format berbeda
   - _Mitigation_: Flexible data mapping dan validation

### Business Risks

1. **User Adoption**

   - _Risk_: Low user engagement
   - _Mitigation_: Intuitive UI design dan comprehensive documentation

2. **Data Accuracy**
   - _Risk_: Misinterpretation of Excel data
   - _Mitigation_: Clear data mapping guidelines dan validation

---

## 10. Future Enhancements

### Version 2.0 Features

- Real-time collaboration
- Multiple file format support (CSV, JSON)
- Advanced analytics dan reporting
- User management sistem
- API integration untuk external systems

### Long-term Vision

- Machine learning untuk predictive analytics
- Mobile app companion
- Integration dengan existing enterprise systems
- Advanced workflow automation

---

## Appendices

### A. File Structure Example

```
dashboard-monitoring/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/ (shadcn/ui)
│   │   ├── charts/
│   │   ├── tables/
│   │   └── timeline/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── docs/
```

### B. Excel Template Format

| Nama Dokumen | Status       | Tanggal Diterima | Tanggal Selesai | PIC        |
| ------------ | ------------ | ---------------- | --------------- | ---------- |
| Dokumen A    | Selesai      | 2024-01-15       | 2024-02-15      | John Doe   |
| Dokumen B    | Dalam Proses | 2024-01-20       | -               | Jane Smith |

---

**Document Version**: 1.0
**Last Updated**: September 26, 2025
**Author**: Development Team
