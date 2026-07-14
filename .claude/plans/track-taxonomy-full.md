# Full track taxonomy (merge of EM + SWE — user-amended and APPROVED 2026-07-14)

Source for `src/data/tracks/full.json`. Union of EM + SWE lists; every skill exactly once.

## Merges — absorbed name MUST be added to the canonical skill's `synonyms` in skills.json

| Canonical skill (kept)         | Absorbed name (from)              | Guaranteed synonym entry                       |
| ------------------------------ | --------------------------------- | ---------------------------------------------- |
| Agile Delivery                 | "Agile" (SWE)                     | `synonyms: [..., "Agile"]`                     |
| Cross-functional Collaboration | "Cross-functional Teams" (EM)     | `synonyms: [..., "Cross-functional Teams"]`    |
| Design Patterns                | "Component Design Patterns" (SWE) | `synonyms: [..., "Component Design Patterns"]` |

Rule (applies to ALL merges, incl. future old→new renames): every absorbed/old display name goes
into the canonical skill's `synonyms` — deep links and the draft script keep matching it.

## Placement moves (skills in different categories per source list — Full picks one home)

- API Design → Backend Development / Application Development (was also EM Engineering Design)
- Microservices, Performance Optimisation → Architecture & Design / Scalability & Maintainability (were also SWE Backend Architecture)
- SQL → Data & Storage / Data Access (was also EM Languages)
- JavaScript (ES6+), TypeScript → Frontend Development / Core Technologies (EM Languages dissolved)

---

## Leadership & Delivery

### People Leadership

- Engineering Leadership
- Team Leadership
- Mentoring & Coaching
- Hiring & Interviewing
- Developer Growth
- Technical Guidance
- Team Onboarding

### Delivery

- Agile Delivery
- Scrum
- Kanban
- Estimation & Planning
- Roadmap Planning
- Prioritisation
- Release Management

### Collaboration

- Stakeholder Management
- Product Collaboration
- Cross-functional Collaboration
- Technical Communication

## Frontend Development

### Core Technologies

- JavaScript (ES6+)
- TypeScript
- Flow
- React
- Next.js
- HTML5
- CSS3

### React Ecosystem

- React Hooks
- Component Architecture
- State Management
- Redux
- React Query
- Context API

### UI Engineering

- Responsive Design
- Accessibility (WCAG)
- Design Systems
- Component Libraries
- Frontend Performance Optimisation

## Backend Development

### JavaScript Backend

- Node.js
- Express.js
- NestJS
- REST APIs
- GraphQL
- WebSockets

### Application Development

- API Design
- Authentication
- Authorization
- Business Logic
- Server-side Development
- Integration Patterns

### Backend Architecture

- Service Design
- Application Architecture
- Error Handling
- Error Monitoring

## Data & Storage

### Databases

- PostgreSQL
- MySQL
- MongoDB
- Redis

### Data Access

- Database Design
- Data Modelling
- SQL
- ORM
- Query Optimisation

### Data Integration

- API Data Integration
- Data Validation
- Transaction Management

## Architecture & Design

### Architecture

- Software Architecture
- System Design
- Solution Design
- Technical Direction
- Architecture Reviews

### Engineering Design

- Clean Architecture
- Design Patterns
- SOLID Principles
- Domain-Driven Design

### Scalability & Maintainability

- Performance Optimisation
- Scalability
- Distributed Systems
- Microservices
- Technical Debt Management

## Engineering Practices & Quality

### Code Quality

- Code Reviews
- Clean Code
- Refactoring
- Coding Standards
- Design Reviews
- Technical Documentation

### Testing

- Test-Driven Development (TDD)
- Testing Strategy
- Unit Testing
- Integration Testing
- Jest
- React Testing Library
- Enzyme
- Cypress
- Playwright

### Ways of Working

- Agile Engineering Practices
- Continuous Improvement
- Developer Experience
- Process Improvement
- CI/CD Awareness

## Tools & Development Workflow

### Version Control

- Git
- GitHub
- GitLab

### Project Management

- Jira
- Documentation

### Development Workflow

- npm
- Package Management
- Vite
- Webpack
- ESLint
- Prettier
- API Testing
- Debugging
- Kibana
- Local Development Environments
