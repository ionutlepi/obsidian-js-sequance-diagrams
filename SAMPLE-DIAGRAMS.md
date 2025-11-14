# Sample Sequence Diagrams for Obsidian

Copy any of these examples directly into your Obsidian notes and switch to Reading Mode to see them rendered.

---

## 📑 Table of Contents

- [✨ New in v0.10.0: Enhanced Syntax Features](#-new-in-v0100-enhanced-syntax-features) - **Start here for the latest features!**
  - [Diagram Titles](#feature-1-diagram-titles)
  - [Participant Aliasing](#feature-2-participant-aliasing)
  - [Participant Ordering](#feature-3-participant-ordering)
  - [Combined Examples](#feature-4-combined---all-three-features-together)
- [🧪 Quick Test Data](#-quick-test-data-copy-these-first)
- [Basic Examples](#basic-examples)
- [Common Use Cases](#common-use-cases)
- [Technical Flows](#technical-flows)
- [Real-World Examples](#real-world-examples)

---

## 📋 Test Case Coverage

This file contains sample data for all 9 test cases from `QUICKTEST.md`:

| Test Case | Location | What it Tests |
|-----------|----------|---------------|
| **Test 1** | [Basic Rendering](#test-1-basic-rendering) | Simple 2-participant diagram |
| **Test 2** | [Copy Button](#test-1-basic-rendering) | Uses Test 1's diagram, hover to copy |
| **Test 3** | [Multiple Diagrams](#test-3-multiple-diagrams) | 4-participant auth flow |
| **Test 4** | [Performance Warning](#test-4-performance-warning-16-participants) | 16 participants triggers warning |
| **Test 5** | [Empty Block](#test-5-empty-block-warning) | Empty `sqjs` block |
| **Test 6** | [Syntax Error](#test-6-invalid-syntax-error) | Invalid syntax detection |
| **Test 7** | [Line Number Error](#test-7-line-number-in-errors) | Error shows line number |
| **Test 8** | [Missing Participant](#test-8-missing-participant-error) | Missing sender syntax |
| **Test 9** | [Whitespace Only](#test-9-whitespace-only-warning) | Whitespace-only block |

---

## 🧪 Quick Test Data (Copy These First!)

### Test 1: Basic Rendering
**What to test**: Verify diagram renders with 2 participants and arrows

```sqjs
Alice->Bob: Hello!
Bob->Alice: Hi!
```

**Expected**: Diagram with Alice and Bob, 2 arrows visible

---

### Test 3: Multiple Diagrams
**What to test**: 4 participants, verify all render correctly

```sqjs
User->Server: Login
Server->Database: Check
Database->Server: OK
Server->User: Success
```

**Expected**: Diagram with User, Server, Database, 4 arrows visible

---

### Test 4: Performance Warning (16 Participants)
**What to test**: Large diagram triggers performance warning

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

**Expected**: Yellow warning box: "⚡ Large Diagram Warning: 16 participants"

---

### Test 5: Empty Block Warning
**What to test**: Empty `sqjs` block shows warning

```sqjs
```

**Expected**: Blue info box: "ℹ Empty sequence diagram block - no content to render"

---

### Test 6: Invalid Syntax Error
**What to test**: Invalid syntax shows error message

```sqjs
This is invalid syntax with no arrows
```

**Expected**: Red error box with "⚠ Syntax Error" and helpful message

---

### Test 7: Line Number in Errors
**What to test**: Error message includes line number

```sqjs
Alice->Bob: Valid
This line has no arrow
Charlie->Dave: Valid
```

**Expected**: Error message shows "Line 2" and explains the problem

---

### Test 8: Missing Participant Error
**What to test**: Missing sender participant

```sqjs
->Bob: Message with no sender
```

**Expected**: Error shows "Missing sender participant" or similar message

---

### Test 9: Whitespace Only Warning
**What to test**: Whitespace-only block shows warning

```sqjs


```

**Expected**: Same as Test 5 - blue info box about empty content

---

## ✨ New in v0.10.0: Enhanced Syntax Features

### Feature 1: Diagram Titles
Add descriptive titles above your diagrams for better documentation:

```sqjs
Title: User Authentication Flow

User->Server: Login request
Server->Database: Validate credentials
Database->Server: User found
Server->User: Success + token
```

**Title Features**:
- Case-insensitive: `Title:`, `title:`, `TITLE:` all work
- Unicode & emoji support: `Title: 🔐 Auth Flow (v2.0)`
- Must appear on first non-empty line
- Whitespace is automatically trimmed

---

### Feature 2: Participant Aliasing
Use short identifiers in messages while displaying full names in the diagram:

```sqjs
Title: Service Communication

participant User Interface as UI
participant REST API Gateway as API
participant PostgreSQL Database as DB

UI->API: HTTP Request
API->DB: SQL Query
DB->API: Result Set
API->UI: JSON Response
```

**How It Works**:
- **Display Name** (before "as"): Full name shown in diagram boxes
- **Alias** (after "as"): Short identifier used in messages
- **No quotes needed** - spaces work naturally in display names

**Alias Benefits**:
- Reduces diagram verbosity by ~30%
- Makes messages more readable
- Supports spaces, special characters, and emoji in display names
- Mix aliased and non-aliased participants

**Example with Emoji**:
```sqjs
participant 🌐 Web Client as C
participant 🖥️ Server as S
participant 💾 Database as D

C->S: Request
S->D: Query
D->S: Data
S->C: Response
```

---

### Feature 3: Participant Ordering
Control left-to-right participant placement:

```sqjs
Title: Controlled Ordering

participant Database
participant Server
participant Client

Client->Server: Request
Server->Database: Query
Database->Server: Results
Server->Client: Response
```

**Ordering displays**: Database | Server | Client (left to right)

**Without explicit ordering**, participants would appear in message flow order.

---

### Feature 4: Combined - All Three Features Together

```sqjs
Title: 🔐 Complete Authentication Flow (v2.0)

participant Web Browser as Client
participant Load Balancer as LB
participant Auth Service as Auth
participant Redis Cache as Cache
participant User Database as DB

Client->LB: POST /login
LB->Auth: Forward credentials
Auth->Cache: Check session
Cache->Auth: Cache miss
Auth->DB: Validate user
DB->Auth: User valid
Auth->Cache: Store session
Auth->LB: JWT token
LB->Client: 200 OK + token
```

**This example demonstrates**:
- Title with emoji and version number
- Five aliased participants with descriptive names
- Explicit ordering (Web Browser, Load Balancer, Auth Service, etc.)
- Clean, readable message flow using short aliases

---

### Feature 5: Reverse Alphabetical Order

```sqjs
Title: Order Demonstration

participant Zulu Service as Z
participant Mike Service as M
participant Alpha Service as A

A->M: Forward request
M->Z: Process data
Z->M: Return result
M->A: Final response
```

**Notice**: Participants display as "Zulu Service | Mike Service | Alpha Service" (left to right), not alphabetical!

---

### Feature 6: Mixed Aliased and Simple Participants

```sqjs
Title: Mixed Participant Types

participant REST API Gateway as API
participant Cache
participant PostgreSQL Database as DB
participant Logger

API->Cache: Check cache
Cache->API: Miss
API->DB: Query data
DB->API: Results
API->Logger: Log request
Logger->API: Logged
API->Cache: Update cache
```

**Notice**: `Cache` and `Logger` have no aliases - they display their simple names as-is

---

## Basic Examples

### Simple Conversation (Similar to Test 1)
```sqjs
Alice->Bob: Hello Bob!
Bob->Alice: Hi Alice!
```

### With Title
```sqjs
Title: Simple Chat

Alice->Bob: How are you?
Bob->Alice: I'm good, thanks!
```

### Three Participants
```sqjs
Frontend->Backend: Request data
Backend->Database: Query
Database->Backend: Results
Backend->Frontend: Response
```

---

## Common Use Cases

### Authentication Flow
```sqjs
Title: User Authentication

User->App: Enter credentials
App->AuthService: Validate credentials
AuthService->Database: Check user
Database->AuthService: User found
AuthService->App: Generate token
App->User: Login successful
```

### API Request Flow (with Aliases)
```sqjs
Title: REST API Call

participant Web Client as C
participant API Gateway as API
participant Redis Cache as Cache
participant PostgreSQL as DB

C->API: GET /users/123
API->Cache: Check cache
Cache->API: Cache miss
API->DB: SELECT user
DB->API: User data
API->Cache: Store in cache
API->C: 200 OK + JSON
```

### E-Commerce Checkout
```sqjs
Title: Checkout Process

Customer->Cart: Add items
Customer->Cart: Proceed to checkout
Cart->Payment: Process payment
Payment->PaymentGateway: Charge card
PaymentGateway->Payment: Success
Payment->Order: Create order
Order->Inventory: Reserve items
Inventory->Order: Reserved
Order->Customer: Confirmation email
```

### Microservices Communication (with Aliases)
```sqjs
Title: Microservices Flow

participant Web App as Client
participant API Gateway as GW
participant Auth Service as Auth
participant User Service as User
participant User Database as DB

Client->GW: HTTP request
GW->Auth: Validate token
Auth->GW: Valid
GW->User: Get user
User->DB: Query
DB->User: User data
User->GW: Response
GW->Client: Final response
```

---

## Technical Flows

### Database Transaction
```sqjs
Title: Database Transaction

App->Database: BEGIN
App->Database: INSERT order
Database->App: Order ID: 123
App->Database: INSERT order_items
Database->App: 3 rows inserted
App->Database: UPDATE inventory
Database->App: Updated
App->Database: COMMIT
Database->App: Success
```

### CI/CD Pipeline
```sqjs
Title: CI/CD Deployment

Developer->Git: Push code
Git->CI: Webhook trigger
CI->Build: Run build
Build->Tests: Execute tests
Tests->Build: All pass
Build->CI: Build success
CI->Docker: Build image
Docker->Registry: Push image
Registry->CD: Trigger deploy
CD->Production: Deploy
Production->Developer: Deploy complete
```

### OAuth2 Authorization
```sqjs
Title: OAuth2 Flow

User->ClientApp: Click login
ClientApp->AuthServer: Authorization request
AuthServer->User: Login page
User->AuthServer: Submit credentials
AuthServer->User: Authorization code
User->ClientApp: Redirect with code
ClientApp->AuthServer: Exchange code for token
AuthServer->ClientApp: Access token
ClientApp->API: Request + token
API->ClientApp: Protected data
ClientApp->User: Display data
```

### Message Queue Pattern
```sqjs
Title: Message Queue

Producer->Queue: Publish message
Queue->Consumer1: Deliver message
Consumer1->Database: Process & save
Database->Consumer1: Saved
Consumer1->Queue: ACK
Queue->Producer: Published confirmation
```

---

## Arrow Types

### Different Arrow Styles
```sqjs
Alice->Bob: Solid arrow
Alice-->Bob: Dashed arrow
Bob->Alice: Response
```

### With Notes
```sqjs
Title: Request with Processing

Client->Server: Send request
Note right of Server: Server processes the request
Server->Client: Send response
Note left of Client: Client handles response
```

---

## Error Testing

### Valid Complex Flow
```sqjs
Title: Multi-step Process

Step1->Step2: Initialize
Step2->Step3: Validate
Step3->Step4: Process
Step4->Step5: Finalize
Step5->Step1: Complete
```

### Empty Block (Should warn)
```sqjs
```

### Whitespace Only (Should warn)
```sqjs


```

### Invalid Syntax (Should error)
```sqjs
This is not valid syntax
Alice->Bob missing colon
->Nobody: No sender
```

---

## Performance Tests

### 16 Participants (Should show warning)
```sqjs
P1->P2: Step 1
P2->P3: Step 2
P3->P4: Step 3
P4->P5: Step 4
P5->P6: Step 5
P6->P7: Step 6
P7->P8: Step 7
P8->P9: Step 8
P9->P10: Step 9
P10->P11: Step 10
P11->P12: Step 11
P12->P13: Step 12
P13->P14: Step 13
P14->P15: Step 14
P15->P16: Step 15
P16->P1: Step 16
```

### Many Messages (Should show warning)
```sqjs
A->B: 1
B->A: 2
A->B: 3
B->A: 4
A->B: 5
B->A: 6
A->B: 7
B->A: 8
A->B: 9
B->A: 10
A->B: 11
B->A: 12
A->B: 13
B->A: 14
A->B: 15
B->A: 16
A->B: 17
B->A: 18
A->B: 19
B->A: 20
A->B: 21
B->A: 22
A->B: 23
B->A: 24
A->B: 25
B->A: 26
A->B: 27
B->A: 28
A->B: 29
B->A: 30
A->B: 31
B->A: 32
A->B: 33
B->A: 34
A->B: 35
B->A: 36
A->B: 37
B->A: 38
A->B: 39
B->A: 40
A->B: 41
B->A: 42
A->B: 43
B->A: 44
A->B: 45
B->A: 46
A->B: 47
B->A: 48
A->B: 49
B->A: 50
A->B: 51
```

---

## Real-World Examples

### Login System
```sqjs
Title: Login System

User->LoginPage: Enter username/password
LoginPage->Server: POST /login
Server->Database: Verify credentials
Database->Server: User valid
Server->Session: Create session
Session->Server: Session ID
Server->LoginPage: Set cookie + redirect
LoginPage->User: Show dashboard
```

### File Upload
```sqjs
Title: File Upload Flow

User->Browser: Select file
Browser->Client: Read file
Client->Server: Upload file (multipart)
Server->Storage: Save file
Storage->Server: File URL
Server->Database: Save metadata
Database->Server: Success
Server->Client: Upload complete
Client->User: Show success message
```

### WebSocket Chat
```sqjs
Title: WebSocket Chat

User1->Server: Connect WebSocket
Server->User1: Connection established
User2->Server: Connect WebSocket
Server->User2: Connection established
User1->Server: Send message
Server->User2: Broadcast message
User2->Server: Send reply
Server->User1: Broadcast reply
```

### Error Handling Flow
```sqjs
Title: Graceful Error Handling

User->App: Submit form
App->Validator: Validate input
Validator->App: Validation error
App->User: Show error message
User->App: Fix and resubmit
App->Validator: Validate input
Validator->App: Valid
App->API: Send request
API->Database: Save data
Database->API: Success
API->App: 200 OK
App->User: Success message
```

---

## Multiple Diagrams in One Note

You can have multiple sequence diagrams in a single note:

### Diagram 1: Registration
```sqjs
Title: User Registration

User->Form: Fill details
Form->Server: POST /register
Server->Database: Create user
Database->Server: User created
Server->Email: Send welcome email
Server->Form: Registration success
Form->User: Show confirmation
```

### Diagram 2: Password Reset
```sqjs
Title: Password Reset

User->Form: Request reset
Form->Server: POST /forgot-password
Server->Database: Find user
Database->Server: User found
Server->Email: Send reset link
Server->Form: Email sent
Form->User: Check your email
```

### Diagram 3: Account Deletion
```sqjs
Title: Account Deletion

User->Settings: Click delete account
Settings->Modal: Show confirmation
Modal->User: Confirm deletion?
User->Modal: Yes, delete
Modal->Server: DELETE /account
Server->Database: Soft delete user
Database->Server: Deleted
Server->Modal: Account deleted
Modal->User: Redirect to homepage
```

---

## Quick Copy Templates

### Minimal
```sqjs
A->B: Message
B->A: Reply
```

### Standard
```sqjs
Title: My Diagram

Client->Server: Request
Server->Client: Response
```

### With Notes
```sqjs
Title: Process Flow

Start->Process: Begin
Note right of Process: Important step here
Process->End: Complete
```

---

## 📊 Test Case Quick Reference

Use this table to quickly find test data and know what to expect:

| # | Test Name | Copy From Section | Expected Result | Type |
|---|-----------|-------------------|-----------------|------|
| 1 | Basic Rendering | [Test 1](#test-1-basic-rendering) | Alice & Bob with 2 arrows | ✅ Success |
| 2 | Copy Button | Test 1 (hover) | Copy button → paste image | ✅ Success |
| 3 | Multiple Diagrams | [Test 3](#test-3-multiple-diagrams) | 4 participants, 4 arrows | ✅ Success |
| 4 | Performance Warning | [Test 4](#test-4-performance-warning-16-participants) | Yellow warning: 16 participants | ⚡ Warning |
| 5 | Empty Block | [Test 5](#test-5-empty-block-warning) | Blue info: empty content | ℹ️ Info |
| 6 | Invalid Syntax | [Test 6](#test-6-invalid-syntax-error) | Red error: syntax error | ❌ Error |
| 7 | Line Number | [Test 7](#test-7-line-number-in-errors) | Error shows "Line 2" | ❌ Error |
| 8 | Missing Participant | [Test 8](#test-8-missing-participant-error) | Error: missing sender | ❌ Error |
| 9 | Whitespace Only | [Test 9](#test-9-whitespace-only-warning) | Blue info: empty content | ℹ️ Info |

### Icon Legend & Visual Styling

| Type | Icon | Border Color | Background | What You'll See |
|------|------|--------------|------------|-----------------|
| ✅ **Success** | — | — | — | Diagram renders normally |
| ℹ️ **Info** | ℹ️ | **Blue** (#0891b2) | Light blue | Empty/whitespace blocks |
| ⚡ **Warning** | ⚡ | **Orange** (#f59e0b) | Light orange | Performance warnings (>15 participants or >50 messages) |
| ❌ **Error** | ⚠ | **Red** (var(--text-error)) | Light red | Syntax errors with line numbers |

**Visual Distinction**: Each message type has a distinct color so you can quickly identify what type of issue you're seeing:
- **Blue = Informational** (no code, just empty)
- **Orange = Caution** (works but may be slow)
- **Red = Error** (broken syntax that needs fixing)

---

## 🚀 Quick Start

1. **Copy the file**: Copy this entire `SAMPLE-DIAGRAMS.md` file to your Obsidian vault
2. **Switch to Reading Mode**: View the file in Reading Mode to see all diagrams
3. **Run Tests**: Go to "🧪 Quick Test Data" section and verify Tests 1-9
4. **Explore Examples**: Check out real-world examples below for inspiration

For systematic testing, see `QUICKTEST.md` for the full 5-minute validation checklist.
