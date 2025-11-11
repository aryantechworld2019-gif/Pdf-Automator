# 🎯 Custom Excel Column Names Guide

## Never Edit Your Excel Headers Again!

Your PDF Automator now has **Dynamic Column Mapping** - use ANY Excel column names you want!

---

## 🎉 The Problem is SOLVED!

### Before (Rigid):
```
❌ Excel must have EXACT column names:
   - source_file
   - page_number
   - trade_date
   - trade_type

❌ Users had to rename their columns
❌ Different teams couldn't share files
❌ Manual work required
```

### Now (Flexible):
```
✅ Use ANY column names you want!
✅ App automatically detects your columns
✅ Easy visual mapping interface
✅ Save mappings for future use
✅ Share mappings with team
✅ Built-in presets for common formats
```

---

## 🚀 How It Works

### 1. **Auto-Mapping (Happens Automatically)**

When you upload an Excel file, the app:
1. Detects your column names
2. Tries to match them automatically (30+ variations supported)
3. If all required fields match → Proceeds automatically
4. If not → Shows mapping interface

**Example Auto-Match:**
```
Your Excel Columns:
- "PDF Filename" → Mapped to: Source File ✓
- "Page" → Mapped to: Page Number ✓
- "Document Date" → Mapped to: Date ✓
- "Category" → Mapped to: Type ✓

Result: All matched! Processing continues automatically.
```

---

### 2. **Manual Mapping (When Needed)**

If auto-mapping doesn't match everything, you'll see this interface:

```
┌──────────────────────────────────────────────┐
│  Map Your Excel Columns                      │
├──────────────────────────────────────────────┤
│  Source File Name (Required) ✓ Mapped        │
│  Your PDF filename column                     │
│  [Select: PDF Filename ▼]                     │
│                                               │
│  Page Number (Required) ✓ Mapped              │
│  Page to extract (1-based)                    │
│  [Select: Page ▼]                             │
│                                               │
│  Primary Date (Required) ⚠ Not Mapped        │
│  Main date field                              │
│  [Select: -- Select Column -- ▼]             │
└──────────────────────────────────────────────┘
```

**Just select the right column from your Excel for each field!**

---

## 🎯 The 3 Tabs Explained

### Tab 1: Map Columns
**Use this to:** Map your Excel columns to required fields

**Features:**
- See all required and optional fields
- Visual indicators (✓ Mapped, ⚠ Not Mapped)
- Dropdown selectors with your actual Excel columns
- Validation (shows errors if required fields missing)
- Export/Import buttons to save your mapping

**Required Fields:**
- ✅ Source File Name
- ✅ Page Number
- ✅ Primary Date
- ✅ Document Type

**Optional Fields:**
- Settlement Date
- Asset Class / Category
- Counterparty / Vendor
- Document ID
- Monetary Value
- Priority Level

---

### Tab 2: Presets
**Use this to:** Load pre-made mappings for common document types

**Available Presets:**

1. **Trading Documents**
   - Trade Confirmation File
   - Trade Date
   - Trade Type
   - Settlement Date
   - Asset Class
   - Broker
   - Trade ID
   - Notional Value

2. **Legal Documents**
   - Document File
   - Execution Date
   - Document Type
   - Party Name
   - Contract Number

3. **Invoices & Billing**
   - Invoice File
   - Invoice Date
   - Invoice Type
   - Vendor
   - Invoice Number
   - Amount

4. **General Documents**
   - Filename
   - Page
   - Date
   - Type
   - ID

**How to use:**
1. Click on a preset that matches your document type
2. The app loads those column names
3. It tries to match them to your Excel
4. Adjust any mismatches in "Map Columns" tab

---

### Tab 3: Custom Names
**Use this to:** Add your own column names permanently

**Why?** So the app recognizes your columns automatically next time!

**How to add:**
1. Select a field (e.g., "Source File Name")
2. Type your custom column name (e.g., "My PDF File")
3. Click "Add Custom Name"
4. Done! The app will recognize it forever

**Example:**
```
Source File Name now recognizes:
- source_file (built-in)
- Source File (built-in)
- filename (built-in)
- My PDF File (your custom) ⭐
- Company Documents (your custom) ⭐
```

**Remove custom names:** Click the ✕ button

---

## 📝 Real-World Examples

### Example 1: Trading Firm

**Your Excel:**
```excel
| Trade Confirmation | Pg | Exec Date | Buy/Sell | Security |
|--------------------|----|-----------| ---------|----------|
| confirm_001.pdf    | 1  | 1/15/2024 | Buy      | Stock    |
```

**Mapping:**
- "Trade Confirmation" → Source File Name
- "Pg" → Page Number
- "Exec Date" → Primary Date
- "Buy/Sell" → Document Type
- "Security" → Asset Class

**Save this mapping!** Next time it loads automatically.

---

### Example 2: Legal Firm

**Your Excel:**
```excel
| Contract Filename | PageNum | Signed Date | Doc Category |
|-------------------|---------|-------------|--------------|
| contract_a.pdf    | 1       | 2024-01-15  | NDA          |
```

**Mapping:**
- "Contract Filename" → Source File Name
- "PageNum" → Page Number
- "Signed Date" → Primary Date
- "Doc Category" → Document Type

---

### Example 3: Accounting Department

**Your Excel:**
```excel
| Invoice_PDF | Page | InvoiceDate | Type | Vendor Name | Inv# | Total |
|-------------|------|-------------|------|-------------|------|-------|
| inv001.pdf  | 1    | 2024-01-15  | AP   | Acme Corp   | 1234 | 5000  |
```

**Mapping:**
- "Invoice_PDF" → Source File Name
- "Page" → Page Number
- "InvoiceDate" → Primary Date
- "Type" → Document Type
- "Vendor Name" → Counterparty
- "Inv#" → Document ID
- "Total" → Monetary Value

---

## 💾 Save & Share Mappings

### Save Your Mapping

**Method 1: Automatic (Recommended)**
- Your mappings are saved automatically
- Next time you upload Excel with same columns → Instant match!

**Method 2: Export to File**
1. In mapping modal, click "Export"
2. Saves `column-mappings.json`
3. Share with colleagues

**Method 3: Add to Custom Names**
- Add your column names in "Custom Names" tab
- Becomes permanent for all future uploads

---

### Share With Team

**Scenario:** Your whole team uses same Excel format.

**Steps:**
1. **You (first time):**
   - Upload Excel, map columns
   - Click "Export" button
   - Save `column-mappings.json`
   - Share file with team (email, Slack, etc.)

2. **Team members:**
   - Upload their Excel
   - Click "Import" button
   - Select your `column-mappings.json`
   - Done! Their columns are mapped identically

**Result:** Consistent processing across entire team!

---

## 🔄 Workflow

### First Time (With New Excel Format):
```
1. Upload Excel →
2. Mapping modal opens (if needed) →
3. Map columns using dropdowns →
4. Click "Confirm Mapping" →
5. Processing continues →
6. (Optional) Export mapping for team
```

### Second Time (Same Format):
```
1. Upload Excel →
2. Auto-mapped! →
3. Processing continues automatically
   (No mapping needed!)
```

### Adjust Existing Mapping:
```
1. Upload Excel →
2. Click "Adjust Mapping" button →
3. Modify any mappings →
4. Click "Confirm Mapping" →
5. Processing continues
```

---

## ✅ Validation & Errors

The app validates your mapping and shows helpful messages:

### ✅ Success (All Good):
```
✓ All Required Fields Mapped
Your Excel columns are correctly mapped!
```

### ❌ Error (Missing Required):
```
⚠ Mapping Errors
- Required field missing: Page Number
- Required field missing: Primary Date
```

### ⚠️ Warning (Duplicate Mapping):
```
⚠ Warnings
- Column "Date" is mapped to multiple fields
```

**Fix errors before proceeding!** The "Confirm Mapping" button is disabled until all required fields are mapped.

---

## 🎨 UI Features

### Visual Indicators
- **✓ Mapped** - Green badge, field is mapped
- **⚠ Not Mapped** - No badge, needs attention
- **Required** - Red badge, must be mapped
- **Optional** - No special badge

### Smart Detection
- Dropdowns show YOUR actual Excel columns
- Empty state: "-- Select Excel Column --"
- Matched columns highlighted

### Validation
- Real-time error checking
- Can't proceed with errors
- Warnings don't block (but should review)

---

## 💡 Pro Tips

### Tip 1: Use Descriptive Column Names
**Good:** "Contract PDF Filename"
**Bad:** "Col1"

Makes auto-mapping work better!

### Tip 2: Keep Column Names Consistent
If you rename columns often, add all variations to Custom Names.

### Tip 3: Use Presets
Start with a preset, then adjust. Faster than mapping from scratch.

### Tip 4: Export After First Setup
Save time for team members - they import your mapping.

### Tip 5: Add to Custom Names
Permanently teach the app your organization's terminology.

---

## 🔧 Advanced: Custom Column Mappings Persistence

**Where are mappings stored?**
- Browser: `localStorage` (persists across sessions)
- Desktop: Same, plus you can export/import files

**What's saved:**
- Your most recent mapping
- All custom column names you added
- Automatically loads next time

**Clear all mappings:**
```javascript
// In browser console (if needed):
localStorage.removeItem('custom_column_mappings_v1');
```

---

## 📊 Comparison: Before vs After

| Task | Before | After |
|------|--------|-------|
| **Change column name** | Edit Excel | Use any name! |
| **Different formats** | Standardize files | Map once, done |
| **Team collaboration** | Everyone renames | Share mapping file |
| **New Excel format** | Manual work | Visual mapping |
| **Time to setup** | 30 min per person | 2 min first time, 0 min after |

---

## 🆘 Troubleshooting

### Issue: "Required field missing" error

**Cause:** You haven't mapped all required fields.

**Solution:**
1. Look for fields with "Required" red badge
2. Select the matching Excel column from dropdown
3. Errors clear automatically

---

### Issue: Mapping modal doesn't show

**Cause:** All your columns auto-matched!

**Good news:** This means it worked perfectly!

**Verify:** Look for log message: "Auto-mapped columns"

**Adjust if needed:** Click "Adjust Mapping" button

---

### Issue: Can't find my column in dropdown

**Cause:** Column name might be empty or have special characters.

**Solution:**
1. Open your Excel
2. Check the exact column header name
3. Make sure it's not empty or just spaces
4. Remove any special characters

---

### Issue: Want to change mapping after processing started

**Solution:** You can't during processing, but:
1. Wait for processing to complete (or cancel)
2. Click "New Batch"
3. Upload Excel again
4. Click "Adjust Mapping"
5. Make changes

---

## 📝 Summary

**Dynamic Column Mapping means:**
- ✅ **Flexibility** - Use ANY Excel column names
- ✅ **Auto-Detection** - Smart matching (30+ variations)
- ✅ **Visual Interface** - Easy dropdown mapping
- ✅ **Persistence** - Saved for future use
- ✅ **Sharing** - Export/import mapping files
- ✅ **Presets** - Common formats built-in
- ✅ **Custom Names** - Teach app your terminology
- ✅ **Validation** - Real-time error checking
- ✅ **Zero Manual Work** - After first setup

**You'll never have to rename Excel columns again!** 🎉

---

## 🚀 Get Started

1. **Upload your Excel** (any column names)
2. **Map columns** (if modal opens)
3. **Click "Confirm Mapping"**
4. **Done!** Next time it's automatic

**That's it! Enjoy the flexibility!**

---

**Version:** 2.1.0 - Dynamic Column Mapping
**Last Updated:** November 11, 2025
