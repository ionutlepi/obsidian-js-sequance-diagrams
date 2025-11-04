/**
 * Test Fixtures: Sample Sequence Diagrams
 *
 * Valid sequence diagram syntax samples for testing
 */

export const SIMPLE_DIAGRAM = `Alice->Bob: Hello Bob!
Bob->Alice: Hi Alice!`;

export const COMPLEX_DIAGRAM = `Title: Authentication Flow

User->Frontend: Login Request
Frontend->Backend: POST /auth/login
Backend->Database: Query User
Database->Backend: User Data
Backend->Frontend: JWT Token
Frontend->User: Login Success`;

export const MULTIPLE_PARTICIPANTS = `Alice->Bob: Message 1
Bob->Charlie: Forward to Charlie
Charlie->David: Forward to David
David->Eve: Forward to Eve
Eve->Frank: Forward to Frank`;

export const LARGE_DIAGRAM_15_PARTICIPANTS = `P1->P2: Step 1
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
P15->P1: Step 15`;

export const LARGE_DIAGRAM_50_MESSAGES = `Alice->Bob: Message 1
Bob->Alice: Message 2
Alice->Bob: Message 3
Bob->Alice: Message 4
Alice->Bob: Message 5
Bob->Alice: Message 6
Alice->Bob: Message 7
Bob->Alice: Message 8
Alice->Bob: Message 9
Bob->Alice: Message 10
Alice->Bob: Message 11
Bob->Alice: Message 12
Alice->Bob: Message 13
Bob->Alice: Message 14
Alice->Bob: Message 15
Bob->Alice: Message 16
Alice->Bob: Message 17
Bob->Alice: Message 18
Alice->Bob: Message 19
Bob->Alice: Message 20
Alice->Bob: Message 21
Bob->Alice: Message 22
Alice->Bob: Message 23
Bob->Alice: Message 24
Alice->Bob: Message 25
Bob->Alice: Message 26
Alice->Bob: Message 27
Bob->Alice: Message 28
Alice->Bob: Message 29
Bob->Alice: Message 30
Alice->Bob: Message 31
Bob->Alice: Message 32
Alice->Bob: Message 33
Bob->Alice: Message 34
Alice->Bob: Message 35
Bob->Alice: Message 36
Alice->Bob: Message 37
Bob->Alice: Message 38
Alice->Bob: Message 39
Bob->Alice: Message 40
Alice->Bob: Message 41
Bob->Alice: Message 42
Alice->Bob: Message 43
Bob->Alice: Message 44
Alice->Bob: Message 45
Bob->Alice: Message 46
Alice->Bob: Message 47
Bob->Alice: Message 48
Alice->Bob: Message 49
Bob->Alice: Message 50`;

export const INVALID_SYNTAX = `Alice->Bob Hello
Bob->;
->Charlie: Message`;

export const EMPTY_CONTENT = ``;

export const WHITESPACE_ONLY = `

   `;

export const DIAGRAM_WITH_NOTES = `Alice->Bob: Request
Note right of Bob: Bob processes
Bob->Alice: Response`;

export const DIAGRAM_WITH_ARROWS = `Alice->Bob: Solid arrow
Alice-->Bob: Dotted arrow
Bob->Alice: Response arrow`;
