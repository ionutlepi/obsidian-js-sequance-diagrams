/**
 * Test Fixtures for Title/Alias/Ordering Syntax
 * Feature: 002-title-alias-support
 *
 * Provides example diagrams for testing validation and rendering
 */

// ===== VALID SYNTAX EXAMPLES =====

export const SIMPLE_TITLE = `Title: User Login Flow
Alice->Bob: Request
Bob-->Alice: Response`;

export const TITLE_WITH_SPECIAL_CHARS = `Title: API Flow (v2.0) - Production
Alice->Bob: POST /api/login
Bob-->Alice: { token: "abc123" }`;

export const TITLE_WITH_UNICODE = `Title: 🔐 Authentication Flow
Alice->Bob: Login
Bob-->Alice: Token`;

export const TITLE_WITH_LONG_TEXT = `Title: ${'A'.repeat(150)}
Alice->Bob: Message`;

export const TITLE_CASE_INSENSITIVE_LOWERCASE = `title: lowercase test
Alice->Bob: Hello`;

export const TITLE_CASE_INSENSITIVE_UPPERCASE = `TITLE: uppercase test
Alice->Bob: Hello`;

export const TITLE_CASE_INSENSITIVE_MIXED = `TiTlE: mixed case test
Alice->Bob: Hello`;

export const TITLE_AFTER_BLANK_LINES = `

Title: Title After Blank Lines
Alice->Bob: Message`;

// ===== PARTICIPANT ALIAS EXAMPLES =====

export const SIMPLE_ALIAS = `participant Alice as A
A->B: Hello
B-->A: Hi there`;

export const MULTIPLE_ALIASES = `participant User Interface as UI
participant REST API as API
participant PostgreSQL Database as DB
UI->API: POST /login
API->DB: SELECT user
DB-->API: user row
API-->UI: { token }`;

export const ALIAS_WITH_SPECIAL_CHARS = `participant Payment Service (v2) as SVC
participant User Database [prod] as DB
SVC->DB: Query
DB-->SVC: Result`;

export const ALIAS_WITH_UNICODE = `participant Web Client 🌐 as Client
participant Auth Service 🔐 as Auth
Client->Auth: Login
Auth-->Client: Token`;

export const MIXED_ALIAS_AND_SIMPLE = `participant Alice as A
participant Bob
participant Charlie as C
A->Bob: Hello Bob
Bob->C: Hello Charlie`;

// ===== PARTICIPANT ORDERING EXAMPLES =====

export const EXPLICIT_ORDERING = `participant C
participant B
participant A
C->B: Message 1
B->A: Message 2`;

export const ORDERING_WITH_ALIASES = `participant Database as DB
participant Backend as BE
participant Frontend as FE
FE->BE: request
BE->DB: query
DB-->BE: result
BE-->FE: response`;

export const MIXED_DECLARED_UNDECLARED = `participant Z
A->B: Message
B->Z: Message to Z`;

// ===== COMBINED FEATURES =====

export const TITLE_AND_ALIASES = `Title: Service Communication
participant Auth Service as SVC
participant Database as DB
SVC->DB: Query
DB-->SVC: Result`;

export const ALL_FEATURES_COMBINED = `Title: Microservices Communication
participant Web Client 🌐 as Client
participant API Gateway as Gateway
participant Authentication Service as Auth
participant Data Service as Data
Client->Gateway: Authenticate
Gateway->Auth: Verify credentials
Auth-->Gateway: JWT token
Gateway-->Client: Return token
Client->Gateway: Request data
Gateway->Data: Fetch user data
Data-->Gateway: User object
Gateway-->Client: Response`;

// ===== INVALID SYNTAX EXAMPLES =====

export const EMPTY_TITLE = `Title:
Alice->Bob: Message`;

export const MULTIPLE_TITLES = `Title: First Title
Title: Second Title
Alice->Bob: Message`;

// Note: Quotes are not used in actual syntax, so these test invalid patterns
export const UNCLOSED_QUOTE_ALIAS = `participant "Alice as A
A->B: Message`;

export const MISMATCHED_QUOTE_ALIAS = `participant 'Alice' as A
A->B: Message`;

export const EMPTY_ALIAS = `participant as A
A->B: Message`;

export const INVALID_IDENTIFIER = `participant 123Bad
123Bad->Alice: Message`;

// This is actually VALID syntax now (no quotes needed)
export const MISSING_QUOTES_IN_ALIAS = `participant Alice as A
A->B: Message`;

// ===== BACKWARD COMPATIBILITY EXAMPLES =====

export const NO_TITLE_NO_PARTICIPANTS = `Alice->Bob: Hello
Bob->Alice: Hi there`;

export const ONLY_MESSAGES = `A->B: Message 1
B->C: Message 2
C->A: Message 3`;

// ===== EDGE CASE EXAMPLES =====

export const WHITESPACE_PADDED_TITLE = `Title:   Padded Title
Alice->Bob: Message`;

export const TITLE_WITH_QUOTES = `Title: "Quoted Title"
Alice->Bob: Message`;

export const PARTICIPANT_WITH_UNDERSCORES = `participant Service 1 as _srv_1
participant Database 2 as _db_2
_srv_1->_db_2: Query`;

export const LONG_ALIAS_NAME = `participant ${'Very Long Display Name '.repeat(5)} as A
A->B: Message`;
