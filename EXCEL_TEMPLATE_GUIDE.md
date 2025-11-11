# Excel Template Guide

## Required Column Names (case-insensitive)

Your Excel file should have these columns. The app will recognize various naming conventions:

### Column 1: Source File
**Accepted names:** `source_file`, `Source File`, `filename`, `File Name`
**Example:** `trade_confirmation_001.pdf`

### Column 2: Page Number
**Accepted names:** `page_number`, `Page Number`, `page`, `Page`
**Example:** `1`, `2`, `3`

### Column 3: Trade Date
**Accepted names:** `trade_date`, `Trade Date`, `date`, `Date`
**Example:** `2024-01-15`, `01/15/2024`, `2024-01-15 10:30:00`

### Column 4: Trade Type
**Accepted names:** `trade_type`, `Trade Type`, `type`, `Type`
**Example:** `Buy`, `Sell`, `Transfer`

### Column 5: Settlement Date (Optional)
**Accepted names:** `settlement_date`, `Settlement Date`, `settle_date`
**Example:** `2024-01-17`, `01/17/2024`

### Column 6: Asset Class (Optional)
**Accepted names:** `asset_class`, `Asset Class`, `asset`, `security_type`
**Example:** `Equity`, `Bond`, `FX`, `Derivative`, `Commodity`

### Column 7: Counterparty (Optional)
**Accepted names:** `counterparty`, `Counterparty`, `broker`, `Broker`
**Example:** `Goldman Sachs`, `JPMorgan`, `Morgan Stanley`

### Column 8: Trade ID (Optional)
**Accepted names:** `trade_id`, `Trade ID`, `id`, `ID`
**Example:** `T20240115001`, `TRADE-12345`

### Column 9: Trade Value (Optional)
**Accepted names:** `trade_value`, `Trade Value`, `value`, `amount`
**Example:** `150000`, `1500000.50`

### Column 10: Priority (Optional)
**Accepted names:** `priority`, `Priority`, `urgent`
**Example:** `urgent`, `high`, `normal`

## Sample Data

```
source_file              | page_number | trade_date  | trade_type | asset_class | counterparty    | trade_id    | trade_value | priority
-------------------------|-------------|-------------|------------|-------------|-----------------|-------------|-------------|----------
trade_confirm_001.pdf    | 1           | 2024-01-15  | Buy        | Equity      | Goldman Sachs   | T-20240115-001 | 150000   | normal
trade_confirm_001.pdf    | 2           | 2024-01-15  | Sell       | Bond        | JPMorgan        | T-20240115-002 | 200000   | urgent
trade_confirm_002.pdf    | 1           | 2024-01-15  | Buy        | FX          | Morgan Stanley  | T-20240115-003 | 500000   | high
trade_confirm_003.pdf    | 1           | 2024-01-16  | Transfer   | Equity      | Goldman Sachs   | T-20240116-001 | 75000    | normal
```

## Tips

1. **File names must match exactly** - If Excel says `trade_001.pdf`, make sure your PDF is named `trade_001.pdf`
2. **Page numbers start at 1** - First page is 1, not 0
3. **Dates are flexible** - Use any date format (`2024-01-15`, `01/15/2024`, `Jan 15, 2024`)
4. **Optional columns** - You don't need all columns, just the required ones
5. **Extra columns** - Having extra columns won't cause problems, they'll be ignored

## Creating Your Template

### Option 1: Use Excel
1. Create new Excel file
2. Add column headers in first row
3. Fill in your data
4. Save as `.xlsx`

### Option 2: Use Google Sheets
1. Create spreadsheet
2. Add headers and data
3. Download as Excel (`.xlsx`)

### Option 3: Use CSV then Convert
1. Create CSV file
2. Import to Excel
3. Save as `.xlsx`

## Validation Tips

Before uploading, check:
- [ ] All PDF file names in Excel match actual PDF files
- [ ] Page numbers are valid (not 0, not higher than pages in PDF)
- [ ] Dates are in recognizable format
- [ ] No empty rows (except at end)
- [ ] File saved as `.xlsx` or `.xls`

## Common Mistakes

❌ **Wrong:** Page 0 (pages start at 1)
✅ **Right:** Page 1

❌ **Wrong:** `trade_001.PDF` when file is `trade_001.pdf` (case matters!)
✅ **Right:** Match exact file name

❌ **Wrong:** Empty cells in required columns
✅ **Right:** Fill all required fields

❌ **Wrong:** Dates like "yesterday" or "last week"
✅ **Right:** Actual dates: `2024-01-15`

## Example Files

The app will process:
- Small batches: 10-50 pages → 10-15 seconds
- Medium batches: 100-500 pages → 30-60 seconds
- Large batches: 1000+ pages → 2-5 minutes

## Need Help?

Check the main README.md for:
- Full documentation
- Troubleshooting guide
- Performance tips
- Configuration options
