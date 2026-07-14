# Old → new skill mapping (user-corrected, APPROVED 2026-07-14)

Every old display name is preserved as a synonym on its new canonical skill. `jobIds`/`recommendationIds` transfer (union on merge, sorted per frozen-mapping rules).

## Canonical-name decisions (user-picked)

| Canonical (kept)               | Synonyms absorbed                                 |
| ------------------------------ | ------------------------------------------------- |
| Estimation & Planning          | Sprint Planning                                   |
| Technical Direction            | Technical Strategy                                |
| Roadmap Planning               | Roadmapping, Project Planning                     |
| Documentation                  | Confluence, Notion                                |
| Agile Delivery                 | Agile                                             |
| Cross-functional Collaboration | Cross-functional Teams, Cross-functional Delivery |
| Design Patterns                | Component Design Patterns                         |
| Mentoring & Coaching           | Mentoring, Coaching                               |
| Hiring & Interviewing          | Recruitment                                       |
| Stakeholder Management         | Stakeholder Communication                         |
| Error Monitoring (new skill)   | Sentry                                            |
| JavaScript (ES6+)              | JavaScript, JS, ECMAScript                        |
| Accessibility (WCAG)           | Accessibility, a11y                               |
| Design Systems                 | Design System, Stitches                           |
| Component Libraries            | Radix UI, Radix                                   |
| CSS3                           | CSS, CSS-in-JS, Sass, SCSS, Less                  |
| Package Management             | Yarn                                              |
| npm                            | Npm, NPM, Node Package Manager                    |

## Kept as separate skills (user decision — NOT merged)

- **Team Onboarding** (≠ Mentoring & Coaching) — Full: People Leadership
- **Enzyme** (≠ React Testing Library) — Full: Testing
- **Flow** (≠ TypeScript) — Full: Core Technologies
- **Kibana** — Full: Development Workflow
- **Testing Strategy** (≠ writing tests) — Full: Testing
- **Error Handling** (SWE list) stays separate from new **Error Monitoring**

## Dropped entirely

- **Software Development** — too generic; new taxonomy covers specifics
- **Team Operations** — removed per user

## New skills with no job evidence yet

All list entries not matched above start with `jobIds: []` → hidden from graphs/bars (user decision) until mapping adds evidence. Notable: Next.js, HTML5, Redux, Node.js, whole Data & Storage category.
