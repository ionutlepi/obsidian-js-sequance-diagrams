# SQJS Sequence Diagram Renderer for Obsidian

A powerful Obsidian plugin that renders beautiful sequence diagrams from `sqjs` code blocks using the [js-sequence-diagrams](https://bramp.github.io/js-sequence-diagrams/) library.

![Version](https://img.shields.io/badge/version-0.9.0-green)
![License](https://img.shields.io/badge/license-MIT-green)
![Obsidian](https://img.shields.io/badge/obsidian-%3E%3D1.0.0-purple)

## Features

- ✅ **Render Sequence Diagrams** - Write sequence diagrams in simple text format
- 🎨 **Theme Support** - Choose between Simple and Hand-drawn styles
- ❌ **Error Handling** - Clear error messages with line numbers and suggestions
- ⚡ **Performance Warnings** - Alerts for large diagrams (>15 participants or >50 messages)
- 📋 **Copy to Clipboard** - Export diagrams as images (PNG/SVG)
- 🔒 **Offline First** - Works without internet connection (library bundled)

## Installation

### Manual Installation

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/ionutlepi/obsidian-sequancejs/releases)
2. Create a folder: `<vault>/.obsidian/plugins/sqjs-sequence-diagrams/`
3. Copy both files into the folder
4. Reload Obsidian and enable the plugin in Settings → Community Plugins

## Usage

### Basic Syntax

Create a code block with the `sqjs` language identifier:

````markdown
```sqjs
Alice->Bob: Hello Bob!
Bob->Alice: Hi Alice!
```
````

**Result**: A sequence diagram showing two participants exchanging messages.

### Examples

#### Simple Conversation

````markdown
```sqjs
User->Server: Login request
Server->Database: Query user
Database->Server: User data
Server->User: Login success
```
````

#### With Title

````markdown
```sqjs
Title: Authentication Flow

Client->API: POST /auth/login
API->Database: Verify credentials
Database->API: User valid
API->Client: JWT token
```
````

#### Complex Flow with Notes

````markdown
```sqjs
Title: Payment Processing

Customer->Cart: Add items
Cart->Payment: Checkout
Note right of Payment: Validate payment details
Payment->Gateway: Process payment
Gateway->Payment: Success
Payment->Order: Create order
Order->Customer: Confirmation
```
````

### Supported Syntax

| Element | Syntax | Example |
|---------|--------|---------|
| Message | `A->B: Message` | `Alice->Bob: Hello` |
| Dashed arrow | `A-->B: Message` | `Alice-->Bob: Async call` |
| Title | `Title: Text` | `Title: My Diagram` |
| Note | `Note [position] of [participant]: Text` | `Note right of Alice: Thinking...` |
| Participant | `participant Name` | `participant Server` |
| Participant Alias | `participant Short as "Display Name"` | `participant API as "REST API Gateway"` |

For full syntax details, see [js-sequence-diagrams documentation](https://bramp.github.io/js-sequence-diagrams/).

### Enhanced Syntax Features (v0.10.0+)

#### Diagram Titles

Add descriptive titles above your sequence diagrams for better documentation:

````markdown
```sqjs
Title: User Authentication Flow

User->Server: Login request
Server->Database: Validate credentials
Database->Server: User found
Server->User: Success + token
```
````

**Title Syntax Rules**:
- Title keyword is case-insensitive (`Title:`, `title:`, `TITLE:` all work)
- Must appear on the first non-empty line
- Supports special characters, Unicode, and emoji: `Title: 🔐 Auth Flow (v2.0)`
- Whitespace before/after title text is automatically trimmed
- Multiple titles are allowed (first one is used, others ignored)

#### Participant Aliasing

Use short identifiers in message flows while displaying full names in the rendered diagram:

````markdown
```sqjs
Title: Service Communication

participant UI as "User Interface"
participant API as "REST API Gateway"
participant DB as "PostgreSQL Database"

UI->API: HTTP Request
API->DB: SQL Query
DB->API: Result Set
API->UI: JSON Response
```
````

**Alias Syntax Rules**:
- Format: `participant [ShortName] as "[Display Name]"`
- Short names must start with a letter or underscore (e.g., `API`, `_cache`)
- Display names must be enclosed in double quotes
- Display names support spaces, special characters, Unicode, and emoji
- Mix aliased and non-aliased participants freely

**Benefits**:
- Reduces diagram verbosity by ~30%
- Makes complex diagrams more readable
- Keeps messages concise while preserving clarity

````markdown
```sqjs
participant 🌐 Client as C
participant 🖥️ Server as S
C->S: Quick and readable!
```
````

#### Participant Ordering

Control the left-to-right order of participants by declaring them explicitly:

````markdown
```sqjs
Title: Controlled Participant Order

participant Database
participant Server
participant Client

Client->Server: Request
Server->Database: Query
Database->Server: Results
Server->Client: Response
```
````

The diagram will display participants in the order they're declared (Database, Server, Client), not alphabetically or by message flow order.

**Ordering Rules**:
- Participants are displayed left-to-right in declaration order
- Declared participants always appear before undeclared ones
- Order is maintained regardless of message flow
- Works with both simple and aliased participants

**Example - Reverse Alphabetical Order**:

````markdown
```sqjs
participant Zulu Service as Z 
participant Mike Service as M
participant Alpha Service as A

A->M: Forward
M->Z: Process
Z->A: Response
```
````

Displays as: **Zulu | Mike | Alpha** (left to right)

#### Combined Features Example

All three features work together seamlessly:

````markdown
```sqjs
Title: 🔐 Complete Authentication Flow (v2.0)



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
````

### Syntax Error Messages

The plugin provides helpful, actionable error messages when syntax is invalid:

````
⚠ Syntax Error
unclosed quote in participant alias
Suggestion: Ensure quotes are properly matched around the display name
````

````
⚠ Syntax Error
empty participant alias not allowed
Suggestion: Provide a non-empty display name or remove the alias declaration
````

````
⚠ Syntax Error
Invalid participant identifier. Cannot start with a number
Suggestion: Participant names must start with a letter or underscore
````

## Configuration

Open **Settings → SQJS Sequence Diagram Settings** to customize:

### Theme

Choose your preferred visual style:

- **Simple** (default) - Clean, geometric shapes
- **Hand-drawn** - Sketchy, hand-drawn style

**Note**: Theme changes apply to newly rendered diagrams. Switch to edit mode and back to reading mode to update existing diagrams.

## Error Handling

The plugin provides helpful error messages with visual distinction:

### Syntax Errors (Red)
```
⚠ Syntax Error (Line 2)
Missing sender participant
Suggestion: Add a participant before the arrow: Sender->Receiver
```

### Empty Content (Blue)
```
ℹ️ Empty sequence diagram block - no content to render
```

### Performance Warnings (Orange)
```
⚡ Large Diagram Warning
This diagram is complex: 16 participants, 52 messages.
Rendering may take longer than usual.
```

## Performance

- **Bundle Size**: 213KB 

## Troubleshooting

### Diagrams Not Rendering

1. **Verify syntax** - Look for red error messages indicating syntax issues
2. **Check console** - Open DevTools (Cmd/Ctrl+Shift+I) and look for errors

### Copy Button Not Showing

1. **Hover over diagram** - The copy button appears on hover
2. **Check for errors** - Diagrams with errors don't show copy buttons

### Slow Performance

1. **Check diagram size** - Diagrams with >15 participants or >50 messages show performance warnings
2. **Simplify diagram** - Break large diagrams into smaller ones
3. **Check other plugins** - Disable other plugins to test for conflicts

## Development

### Prerequisites

- Node.js 16+
- npm or yarn
- Obsidian 1.0.0+

### Build from Source

```bash
# Clone the repository
git clone https://github.com/ionutlepi/obsidian-sequancejs.git
cd obsidian-sequancejs

# Install dependencies
npm install

# Build the plugin
npm run build

# Run tests
npm test

# Development build (watch mode)
npm run dev
```

### Project Structure

```
src/
├── main.ts                    # Plugin entry point
├── settings.ts                # Settings UI
├── types.ts                   # TypeScript definitions
├── renderer/
│   ├── DiagramRenderer.ts     # Core rendering logic
│   ├── ErrorDisplay.ts        # Error message formatting
│   └── ThemeManager.ts        # Theme management
├── processors/
│   ├── SQJSCodeBlockProcessor.ts  # Code block processor
│   └── DiagramParser.ts       # Syntax validation
└── utils/
    ├── ComplexityAnalyzer.ts  # Performance analysis
    ├── RenderCancellation.ts  # Render operation management
    └── ClipboardHandler.ts    # Copy to clipboard

tests/
├── unit/                      # Unit tests
├── integration/               # Integration tests
├── workflows/                 # CI/CD workflow tests
│   ├── duplicate-detection.test.ts
│   ├── prerelease-detection.test.ts
│   ├── prerelease-integration.test.ts
│   ├── release-notes-integration.test.ts
│   ├── release-notes.test.ts
│   ├── release-workflow.test.ts
│   ├── retry-with-backoff.test.ts
│   ├── validate-version.test.ts
│   └── version-validation-integration.test.ts
└── fixtures/                  # Test data

.github/workflows/
└── release.yml                # Automated GitHub releases

.gitea/workflows/
├── pr-check.yml               # PR validation (prevents broken merges)
├── release.yml                # Automated Gitea releases
├── SETUP.md                   # Gitea Actions setup guide
├── QUICK-START.md             # Quick reference
├── UNRAID-SETUP.md            # Unraid-specific instructions
└── RUNNER-FIX.md              # Troubleshooting guide

scripts/release/
├── retry-with-backoff.sh      # Retry utility with exponential backoff
├── generate-release-notes.sh  # Automated release notes from git history
└── validate-version.sh        # Version consistency validation
```

## Testing

The plugin includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/unit/DiagramRenderer.test.ts
```

**Test Coverage**: 42 unit tests + 9 manual tests

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the existing code style
4. Add tests for new features
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Changelog

### Version 0.9.0 (2025-11-01)

- ✨ Initial release
- ✅ Render sequence diagrams from `sqjs` code blocks
- 🎨 Theme support (Simple and Hand-drawn)
- ❌ Enhanced error handling with line numbers
- ⚡ Performance warnings for large diagrams
- 📋 Copy diagrams to clipboard as images
- 🔒 Offline-first (bundled library)

## License

MIT License - see [LICENSE](LICENSE) file for details

## Credits

- Built with [js-sequence-diagrams](https://bramp.github.io/js-sequence-diagrams/) by Andrew Brampton
- Developed for [Obsidian](https://obsidian.md/)

## Support

- 🐛 **Report bugs**: [GitHub Issues](https://github.com/ionutlepi/obsidian-sequancejs/issues)
- 💡 **Feature requests**: [GitHub Discussions](https://github.com/ionutlepi/obsidian-sequancejs/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/ionutlepi/obsidian-sequancejs/wiki)

## Acknowledgments

Special thanks to:
- The Obsidian team for creating an amazing platform
- The js-sequence-diagrams project for the rendering engine
- All contributors and testers

---

Made with ❤️ for the Obsidian community
