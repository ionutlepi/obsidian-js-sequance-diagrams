# Quick Test Guide - 5 Minutes

**Fast validation of core functionality**

---

## 📁 Test Data Location

All sample data for these tests is available in `SAMPLE-DIAGRAMS.md`:
- Tests 1-9 are in the **"🧪 Quick Test Data"** section
- Each test includes the code to copy + expected results
- See the table below for quick navigation

| Want to... | Go to... |
|------------|----------|
| Copy all test data at once | `SAMPLE-DIAGRAMS.md` → "🧪 Quick Test Data" |
| See expected results for each test | `SAMPLE-DIAGRAMS.md` → "📊 Test Case Quick Reference" |
| Find real-world examples | `SAMPLE-DIAGRAMS.md` → "Real-World Examples" |
| Follow step-by-step testing | This file (keep reading below) |

---

## 1. Installation (1 minute)

```bash
# Build
npm run build

# Install (replace with your vault path)
VAULT="/path/to/vault"
mkdir -p "$VAULT/.obsidian/plugins/sqjs-sequence-diagrams"
cp main.js manifest.json "$VAULT/.obsidian/plugins/sqjs-sequence-diagrams/"
```

**In Obsidian**:
- Settings → Community plugins → Enable "SQJS Sequence Diagram Renderer"

---

## 2. Quick Test Note (2 minutes)

**Option A: Use Pre-made Test Data**
Open `SAMPLE-DIAGRAMS.md` in your Obsidian vault and copy the "🧪 Quick Test Data" section (Tests 1-9 are all there!)

**Option B: Create Test Note Manually**
Create a note called "SQJS Quick Test" with this content:

````markdown
# Quick Test

> 💡 **Tip**: All test data is also available in `SAMPLE-DIAGRAMS.md`

## ✅ Test 1: Basic Rendering
**Expected**: Two participants (Alice, Bob) with 2 arrows visible

```sqjs
Alice->Bob: Hello!
Bob->Alice: Hi!
```

## ✅ Test 2: Copy Button
**Expected**: Hover over diagram above → "Copy" button appears → Click to copy as image

_(Uses Test 1's diagram - just hover and test the copy button)_

---

## ✅ Test 3: Multiple Diagrams
**Expected**: 4 participants (User, Server, Database) with 4 arrows

```sqjs
User->Server: Login
Server->Database: Check
Database->Server: OK
Server->User: Success
```

## ✅ Test 4: Performance Warning (16 participants)
**Expected**: Yellow warning box: "⚡ Large Diagram Warning: 16 participants"

```sqjs
P1->P2: 1
P2->P3: 2
P3->P4: 3
P4->P5: 4
P5->P6: 5
P6->P7: 6
P7->P8: 7
P8->P9: 8
P9->P10: 9
P10->P11: 10
P11->P12: 11
P12->P13: 12
P13->P14: 13
P14->P15: 14
P15->P16: 15
P16->P1: 16
```

---

## ⚠️ Test 5: Empty Block Warning
**Expected**: Blue info box: "ℹ Empty sequence diagram block - no content to render"

```sqjs
```

## ❌ Test 6: Error Handling (Syntax Validation)
**Expected**: Red error box: "⚠ Syntax Error" with helpful suggestion

```sqjs
This is invalid syntax with no arrows
```

## ❌ Test 7: Line Number in Errors
**Expected**: Error message shows "Line 2" indicating where the problem is

```sqjs
Alice->Bob: Valid
This line has no arrow
Charlie->Dave: Valid
```

## ❌ Test 8: Missing Participant
**Expected**: Error shows "Missing sender participant" or similar

```sqjs
->Bob: Message with no sender
```

## ⚠️ Test 9: Whitespace Only
**Expected**: Same as Test 5 - blue info box about empty content

```sqjs


```
````

---

## 3. Validation Checklist (2 minutes)

Switch to **Reading Mode** and verify each test:

### Basic Functionality (MVP)

| Test | Pass? | What You Should See | Data Source |
|------|-------|---------------------|-------------|
| **Test 1** | [x] | Alice & Bob diagram with 2 arrows | `SAMPLE-DIAGRAMS.md` - Test 1 |
| **Test 2** | [x] | Hover over Test 1 diagram → Copy button → Can paste image | Same as Test 1 |
| **Test 3** | [x] | User/Server/Database diagram with 4 arrows | `SAMPLE-DIAGRAMS.md` - Test 3 |
| **Test 4** | [x] | Yellow box: "⚡ Large Diagram Warning: 16 participants" | `SAMPLE-DIAGRAMS.md` - Test 4 |
| **Test 5** | [x] | Blue info box: "ℹ Empty sequence diagram block..." | `SAMPLE-DIAGRAMS.md` - Test 5 |

### Enhanced Error Handling (User Story 2)

| Test | Pass? | What You Should See | Data Source |
|------|-------|---------------------|-------------|
| **Test 6** | [x] | Red error box: "⚠ Syntax Error" + suggestion text | `SAMPLE-DIAGRAMS.md` - Test 6 |
| **Test 7** | [x] | Error message includes "Line 2" | `SAMPLE-DIAGRAMS.md` - Test 7 |
| **Test 8** | [x] | Error: "Missing sender participant" or similar | `SAMPLE-DIAGRAMS.md` - Test 8 |
| **Test 9** | [x] | Same as Test 5 - empty content warning | `SAMPLE-DIAGRAMS.md` - Test 9 |

### Results

**All 9 pass?** → ✅ **User Story 2 Complete!**

**Any fail?** → Check:
1. Are you in Reading Mode (not Editing)?
2. Console errors (Cmd/Ctrl+Shift+I)?
3. See `TESTING.md` for detailed troubleshooting

---

## Quick Troubleshooting

**Nothing renders?**
- Check you're in Reading mode (not Editing)
- Open console (Cmd/Ctrl+Shift+I) - look for red errors
- Verify plugin is enabled in Settings

**Copy button doesn't show?**
- Hover slowly over the rendered diagram
- Try in a different note
- Check console for errors

**Diagrams look wrong?**
- Verify build succeeded: `ls -lh main.js` (should be ~211KB)
- Rebuild: `npm run build`
- Restart Obsidian

---

## One-Line Verification

```bash
# Build + verify size
npm run build && ls -lh main.js | grep "211K"
```

Expected: `211.2kb` or similar (42% of 500KB budget)

---

## Success Criteria

**✅ User Story 2 Ready** if:
- All 9 tests pass (6 MVP + 3 error handling)
- Copy to clipboard works
- Error messages show line numbers
- Suggestions appear in error displays
- No console errors
- Obsidian doesn't freeze

**🐛 Issues Found**:
- See TESTING.md for comprehensive test suite
- Check console errors
- Report issues with screenshots

---

**Total Time: ~5 minutes** ⏱️
