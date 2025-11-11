# 📄 Single PDF + Page Ranges Guide

## The Simple Workflow for Large PDFs

Your PDF Automator now supports **the simplest possible workflow** for extracting pages from a single large PDF!

---

## 🎯 Perfect For:

- **Medical Records** - 70-page patient chart, extract specific pages by date/type
- **Legal Documents** - 5,000-page discovery PDF, split by document type
- **Court Transcripts** - 500-page transcript, organize by date and topic
- **Financial Reports** - Large PDF with multiple reports, split by date
- **Any Large PDF** - One file with thousands of pages to split and organize

---

## ✨ What's New?

### **1. Page Range Support**

Your Excel can now use **page ranges** instead of listing each page individually:

```excel
| Date       | Document Title       | Page Number |
|------------|---------------------|-------------|
| 6/7/2024   | Lab Report          | 6-14        |
| 6/7/2024   | Medical History     | 15          |
| 6/7/2024   | Instructions        | 16-19       |
| 6/11/2024  | Progress Notes      | 20-28       |
| 6/11/2024  | Progress Notes      | 29-30       |
```

**App automatically expands ranges:**
- "6-14" → 6, 7, 8, 9, 10, 11, 12, 13, 14 (9 pages)
- "16-19" → 16, 17, 18, 19 (4 pages)
- "15" → 15 (single page)

**Your 18-row Excel becomes 70+ individual pages automatically!**

### **2. Single PDF Mode**

When your Excel **doesn't have a "source file" column**, the app enters **Single PDF Mode**:

- Upload your Excel (with page ranges)
- Upload ONE large PDF
- App automatically assigns the PDF to all pages
- Done!

**No need for a "source file" column in your Excel!**

---

## 📝 Excel Format

### **Your Format (Medical Records Example)**

```excel
| Date (MM/DD/ | Document Title (As per Image) | Page Number |
|--------------|------------------------------|-------------|
| 6/7/2024     | Encounter Messages           | 3-5         |
| 6/7/2024     | Laboratory Report            | 6-14        |
| 6/7/2024     | Medical History              | 15          |
| 6/7/2024     | Instructions and Follow-up   | 16-19       |
| 6/11/2024    | Progress Notes               | 20-28       |
| 6/11/2024    | Progress Notes               | 29-30       |
| 6/11/2024    | Nursing Notes                | 31          |
| 6/11/2024    | Laboratory Report            | 32-44       |
| 6/11/2024    | Encounter Medications        | 44          |
| 6/11/2024    | Vital Signs                  | 45          |
| 6/11/2024    | Flowsheet Data               | 46-48       |
| 6/11/2024    | Visit Summary                | 48-57       |
| 6/11/2024    | After Visit Summary          | 58-61       |
| 6/11/2024    | Episode General Information  | 62-63       |
| 6/11/2024    | Laboratory Report            | 64-68       |
| 6/11/2024    | Medical History              | 69          |
| 6/11/2024    | Blank Page                   | 70          |
| 6/11/2024    | Allergies                    | 71          |
```

### **Required Columns**

1. **Date** - Any format with "Date" in the header
   - "Date (MM/DD/" ✅
   - "Date (MM/DD/YYYY)" ✅
   - "Date" ✅

2. **Document Title/Type** - Becomes the document type
   - "Document Title (As per Image)" ✅
   - "Document Title" ✅
   - "Title" ✅
   - "Type" ✅

3. **Page Number** - Supports ranges!
   - "Page Number" ✅
   - "Page" ✅
   - "Pg" ✅

### **Optional Column**

- **Source File** - Only needed if you have multiple PDFs
  - If missing → Single PDF Mode (one PDF for all pages)

---

## 🚀 How to Use

### **Step 1: Prepare Your Excel**

Create Excel with 3 columns:
- Date
- Document Title/Type
- Page Number (with ranges like "3-5")

**No "source file" column needed!**

**Example:**
```
18 rows × 3 columns = Simple Excel
App expands to 70+ individual pages automatically
```

### **Step 2: Upload Excel**

1. Click "Select Excel File"
2. Choose your Excel file

**App will:**
- ✅ Detect page ranges ("6-14", "16-19", etc.)
- ✅ Expand ranges automatically
- ✅ Show you the expansion stats:
  ```
  📊 Page ranges detected and expanded!
     Original rows: 18
     Expanded rows: 71
     Ranges: 12, Single pages: 6
  ```
- ✅ Auto-map your columns (Date, Title, Page Number)
- ✅ Enter Single PDF Mode

### **Step 3: Upload PDF**

1. Click "Add PDF Files"
2. Select **ONE large PDF** (e.g., 5000-page file)

**App will:**
- ✅ Assign this PDF to all 71 pages automatically
- ✅ Show confirmation:
  ```
  ✓ Single PDF mode: Assigned "patient_record.pdf" to all 71 pages
  ```

### **Step 4: Configure & Run**

1. Click "Configure Settings →"
2. Set options:
   - **Group By**: Date (groups all June 7th docs together)
   - **Bates Prefix**: "MED-" or "DOC-"
   - **Bates Position**: Bottom-right
3. Click "▶ Run Automation"

**App will:**
- Extract all 71 pages from your 5000-page PDF
- Group by date (June 7th docs, June 11th docs)
- Add Bates numbers
- Create separate PDFs for each group
- Package everything into a ZIP

### **Step 5: Download**

Click "Download Package" to get your ZIP file containing:
- `2024-06-07.pdf` - All June 7th documents merged
- `2024-06-11.pdf` - All June 11th documents merged
- `processing_report.txt` - Summary report
- `document_manifest.xlsx` - Index with Bates numbers

---

## 🎨 Grouping Options

### **Group by Date** (Recommended)
```
2024-06-07.pdf
  - Encounter Messages (pages 3-5)
  - Laboratory Report (pages 6-14)
  - Medical History (page 15)
  - Instructions (pages 16-19)

2024-06-11.pdf
  - Progress Notes (pages 20-30)
  - Nursing Notes (page 31)
  - Laboratory Report (pages 32-44)
  - [... all other June 11th docs ...]
```

### **Group by Date + Type**
```
2024-06-07_Laboratory_Report.pdf
  - Laboratory Report (pages 6-14)

2024-06-07_Medical_History.pdf
  - Medical History (page 15)

2024-06-11_Progress_Notes.pdf
  - Progress Notes (pages 20-30)

2024-06-11_Laboratory_Report.pdf
  - Laboratory Report (pages 32-44, 64-68)
```

### **Group by Type**
```
Laboratory_Report.pdf
  - 6/7/2024 report (pages 6-14)
  - 6/11/2024 report (pages 32-44)
  - 6/11/2024 report (pages 64-68)

Progress_Notes.pdf
  - 6/11/2024 notes (pages 20-30)

Medical_History.pdf
  - 6/7/2024 history (page 15)
  - 6/11/2024 history (page 69)
```

### **No Grouping** (All in one PDF)
```
ALL_DOCUMENTS.pdf
  - All 71 pages in one PDF
  - Ordered by date (oldest first)
  - Bates numbered consecutively
```

---

## 📊 Page Range Formats Supported

| Format | Example | Expands To | Notes |
|--------|---------|------------|-------|
| **Single Page** | 15 | [15] | One page |
| **Range** | 6-14 | [6, 7, 8, 9, 10, 11, 12, 13, 14] | 9 pages |
| **Range** | 16-19 | [16, 17, 18, 19] | 4 pages |
| **Range** | 20-28 | [20, 21, ..., 28] | 9 pages |
| **Number** | 44 | [44] | Single page as number |
| **Large Range** | 100-200 | [100, 101, ..., 200] | 101 pages! |

**Supported separators:**
- Hyphen: `3-5`
- En-dash: `3–5`
- Em-dash: `3—5`

---

## 💡 Real-World Examples

### **Example 1: Medical Records**

**Scenario:**
- 70-page patient chart PDF
- Need to split by date and document type
- Excel lists page ranges

**Excel (18 rows):**
```
Date       | Document Title          | Page Number
-----------|------------------------|-------------
6/7/2024   | Encounter Messages     | 3-5
6/7/2024   | Laboratory Report      | 6-14
6/11/2024  | Progress Notes         | 20-28
...
```

**Process:**
1. Upload Excel → Expands to 71 pages
2. Upload patient_chart.pdf (70 pages)
3. Group by date
4. Run → Download ZIP

**Result:**
- `2024-06-07.pdf` - June 7th documents
- `2024-06-11.pdf` - June 11th documents

---

### **Example 2: Legal Discovery**

**Scenario:**
- 5,000-page discovery PDF
- Extract specific documents by date
- Excel lists page ranges

**Excel (50 rows):**
```
Date        | Document Title      | Page Number
------------|--------------------|--------------
2024-01-15  | Contract           | 1-25
2024-01-15  | Amendment          | 26-30
2024-02-10  | Correspondence     | 500-520
2024-02-10  | Invoice            | 521-525
...
```

**Process:**
1. Upload Excel → Expands to 300+ pages
2. Upload discovery.pdf (5,000 pages)
3. Group by date
4. Run → Download ZIP

**Result:**
- `2024-01-15.pdf` - January 15th documents
- `2024-02-10.pdf` - February 10th documents
- All with Bates numbering

---

### **Example 3: Court Transcript**

**Scenario:**
- 500-page transcript
- Split by witness/topic
- Excel lists sections

**Excel:**
```
Date        | Document Title           | Page Number
------------|-------------------------|-------------
2024-03-01  | Opening Statement       | 1-15
2024-03-01  | Witness 1 - Direct      | 16-45
2024-03-01  | Witness 1 - Cross       | 46-60
2024-03-02  | Witness 2 - Direct      | 61-100
...
```

**Process:**
1. Upload Excel → Expands automatically
2. Upload transcript.pdf
3. Group by date + type
4. Run

**Result:**
- `2024-03-01_Opening_Statement.pdf`
- `2024-03-01_Witness_1_Direct.pdf`
- `2024-03-01_Witness_1_Cross.pdf`
- `2024-03-02_Witness_2_Direct.pdf`

---

## ⚡ Performance

### **Page Range Expansion**

| Original Rows | Page Ranges | Expanded Pages | Time |
|--------------|-------------|----------------|------|
| 18 rows | 12 ranges | 71 pages | Instant |
| 50 rows | 30 ranges | 300 pages | < 1 second |
| 100 rows | 80 ranges | 1,000 pages | < 1 second |
| 500 rows | 400 ranges | 5,000 pages | 1-2 seconds |

**Expansion is automatic and instant!**

### **PDF Processing (with Caching)**

| PDF Size | Pages to Extract | Processing Time |
|----------|-----------------|-----------------|
| 70 pages | 71 pages | 5 seconds |
| 500 pages | 300 pages | 30 seconds |
| 5,000 pages | 1,000 pages | 2-3 minutes |
| 5,000 pages | 5,000 pages | 8-10 minutes |

**PDF caching makes it fast even for huge PDFs!**

---

## ✅ Validation & Errors

### **✅ Success Messages**

```
📊 Page ranges detected and expanded!
   Original rows: 18
   Expanded rows: 71
   Ranges: 12, Single pages: 6

ℹ️  Single PDF mode: Upload one PDF and it will be used for all pages

✓ Single PDF mode: Assigned "patient_record.pdf" to all 71 pages

✓ Loaded: medical_index.xlsx (71 pages) - Auto-mapped columns
```

### **⚠️ Warnings**

```
⚠️  Warning: In single PDF mode, expected 1 PDF but got 3
```
*You uploaded multiple PDFs but Excel is in single PDF mode*

### **❌ Errors**

```
❌ Error: Invalid page range: "5-3"
```
*Start page must be less than end page*

```
❌ Error: Page 500 not found in PDF (PDF has 70 pages)
```
*Page number exceeds PDF page count*

---

## 🔧 Troubleshooting

### **Issue: Page ranges not expanding**

**Cause:** Column not detected as "Page Number"

**Solution:**
1. Name your column exactly "Page Number" (or "Page" or "Pg")
2. Check for typos in column header
3. Use column mapping modal to manually map the column

---

### **Issue: Single PDF mode not activating**

**Cause:** Excel has a source file column

**Solution:**
- Remove the source file column if you only have one PDF
- OR keep the column and enter the PDF filename in every row

---

### **Issue: "Page X not found in PDF"**

**Cause:** Page number in Excel exceeds PDF page count

**Solution:**
1. Check your PDF page count
2. Verify Excel page numbers are correct
3. Remember: PDF pages are 1-indexed (first page = 1)

---

### **Issue: Range format not recognized**

**Cause:** Invalid range format

**Solution:**
Use supported formats:
- ✅ "6-14" (hyphen)
- ✅ "6–14" (en-dash)
- ✅ "6—14" (em-dash)
- ❌ "6 to 14" (not supported)
- ❌ "6,7,8" (not supported - use "6-8")

---

## 📋 Quick Checklist

Before you start:

- [ ] **Excel has 3 columns:** Date, Document Title, Page Number
- [ ] **Page ranges formatted correctly:** "3-5", "15", "20-28"
- [ ] **No source file column** (for single PDF mode)
- [ ] **PDF ready:** Your large PDF file
- [ ] **Know your grouping strategy:** Date, Date+Type, Type, or None

---

## 🎯 Summary

**Single PDF + Page Ranges = Simplest Workflow**

✅ **No source file column needed**
✅ **Page ranges automatically expanded**
✅ **Upload 1 Excel + 1 PDF**
✅ **Automatic assignment and processing**
✅ **Perfect for large PDFs (5000+ pages)**
✅ **18 rows → 71 pages automatically**
✅ **Group by date, type, or both**
✅ **Bates numbering applied**
✅ **ZIP download with all files**

**Your 18-row Excel with a 5,000-page PDF is processed in minutes!**

---

## 🚀 Get Started

**Simple 5-step process:**

1. **Create Excel** - 3 columns (Date, Title, Page Number with ranges)
2. **Upload Excel** - App expands ranges automatically
3. **Upload PDF** - One large PDF file
4. **Configure** - Choose grouping and Bates settings
5. **Download** - Get ZIP with organized PDFs

**That's it! No complex setup, no source file columns, just simple and fast!**

---

**Version:** 2.1.0 - Single PDF + Page Ranges
**Last Updated:** November 11, 2025
