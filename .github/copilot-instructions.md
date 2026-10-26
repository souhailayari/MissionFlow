## 1. PROJECT IDENTITY

MISSIONFLOW is a professional internal business application for managing:

- Demandes d'ordre de mission
- Validation des missions
- Ressources de mission
- Notifications
- Documents/PDF
- Audit
- Administration
- Reports / CSV

This is a SINGLE-COMPANY application.

DO NOT introduce:
- Multi-tenancy
- Organizations
- Subscriptions
- Billing
- Payments
- SaaS features
- Unrelated business modules
- Microservices unless explicitly requested

---

# 2. TECHNOLOGY STACK

## Frontend

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query when appropriate
- Reusable components
- Responsive UI

## Backend

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- JWT
- Refresh tokens
- bcrypt

## Other

- OSRM for routing
- PDF generation
- CSV exports
- Notifications
- Audit logs

---

# 3. CRITICAL RULE — DO NOT REBUILD EXISTING WORK

Before modifying anything:

1. Inspect the repository.
2. Inspect the existing architecture.
3. Inspect existing files.
4. Inspect existing components.
5. Inspect existing API services.
6. Inspect existing backend controllers, DTOs and endpoints.
7. Reuse existing code whenever possible.

NEVER create a second implementation of something that already exists.

DO NOT:
- Rebuild the backend from scratch.
- Create a second authentication system.
- Create a second API client.
- Create duplicate components.
- Create duplicate pages.
- Create duplicate services.
- Create duplicate DTOs.
- Create fake backend endpoints.
- Replace working code without a reason.

The backend is already implemented and validated.

CURRENT PRIORITY:

Build and integrate the professional Next.js frontend with the existing backend.

---

# 4. BACKEND STATUS

The backend is already implemented with:

- NestJS
- Prisma
- PostgreSQL
- JWT authentication
- Refresh tokens
- bcrypt
- RBAC
- Missions
- Validation workflow
- Direction resources
- RH
- Notifications
- Audit
- PDF/document handling
- OSRM routing
- CSV reports
- Health checks

The backend has already been tested.

DO NOT restart backend development unless a real frontend integration requirement makes a backend change necessary.

If a backend change is genuinely necessary:

1. Explain why.
2. Make the smallest possible change.
3. Preserve existing behavior.
4. Do not redesign the backend.
5. Run relevant tests after the change.

---

# 5. SOURCE OF TRUTH

The backend is the security and business-logic authority.

The frontend must NEVER assume that frontend permissions are sufficient for security.

Frontend RBAC is only for:
- UI visibility
- navigation
- user experience

Backend RBAC remains the final authority.

Never bypass backend authorization.

---

# 6. ROLES

## Global roles

```text
ADMIN
RH
DIRECTION
````

## Department roles

```text
DIRECTEUR_DEPARTEMENT
CHEF_EQUIPE
EMPLOYE
```

DO NOT invent additional roles.

---

# 7. ROLE PERMISSIONS

## ADMIN

Admin can:

* Create users
* Modify users
* Activate/deactivate users
* Create departments
* Modify departments
* Create teams
* Modify teams
* Manage department/team assignments
* Access reports
* Export mission CSV
* Export user CSV

ADMIN is the only role allowed to use exports.

---

## EMPLOYE

Employee can:

* Create a mission
* Save draft
* Modify own draft
* Submit mission
* View own missions
* View mission history
* View notifications

Employee CANNOT:

* Approve missions
* Reject missions
* Manage users
* Manage departments
* Manage teams
* Export reports
* Manage Direction resources

---

## CHEF_EQUIPE

Team leader can:

* View missions belonging to their team
* Approve missions assigned to their team
* Reject missions assigned to their team
* View relevant mission history

Team leader CANNOT:

* Approve missions outside their team
* Export reports
* Manage Direction resources
* Perform Direction approval

IMPORTANT:

A team leader must actually be the leader of the team concerned.

Never trust only the frontend role.

---

## DIRECTEUR_DEPARTEMENT

Department director can:

* View missions of their department
* Approve missions
* Reject missions
* View mission history

Department director CANNOT:

* Approve missions outside their department
* Export reports
* Manage Direction resources

---

## DIRECTION

Direction can:

* View missions waiting for Direction
* Add mission resources
* Validate/finalize the mission
* Manage fuel information
* Manage accommodation information
* Manage Pluxee information

Direction CANNOT reject missions.

Direction fields include:

* Numéro carte carburant
* Montant carburant
* Hébergement Oui/Non
* Lieu hébergement
* Nombre tickets Pluxee
* Montant tickets Pluxee

---

## RH

RH can:

* View rejected missions
* View relevant mission information

RH CANNOT:

* Reject missions
* Approve missions
* Export reports
* Manage Direction resources

---

# 8. MISSION WORKFLOW

The workflow is:

```text
DRAFT
    ↓
PENDING_TEAM_LEADER
    ↓
PENDING_DEPARTMENT_DIRECTOR
    ↓
PENDING_DIRECTION
    ↓
APPROVED
```

If the employee has no team:

```text
DRAFT
    ↓
PENDING_DEPARTMENT_DIRECTOR
    ↓
PENDING_DIRECTION
    ↓
APPROVED
```

Rejection:

```text
PENDING_TEAM_LEADER
        ↓
     REJECTED
```

or:

```text
PENDING_DEPARTMENT_DIRECTOR
        ↓
     REJECTED
```

Only:

* CHEF_EQUIPE
* DIRECTEUR_DEPARTEMENT

can reject.

DIRECTION cannot reject.

RH cannot reject.

EMPLOYE cannot reject.

---

# 9. MISSION STATUS

Existing statuses:

```text
DRAFT
SUBMITTED
PENDING_TEAM_LEADER
PENDING_DEPARTMENT_DIRECTOR
PENDING_DIRECTION
APPROVED
REJECTED
```

DO NOT create new statuses unless explicitly required.

---

# 10. MISSION FORM

The mission form must support the existing business requirements.

Fields include:

* Employee
* Fonction
* Véhicule immatriculé
* Déplacement à destination
* Accompagné de
* Date
* Client
* Motif
* Hébergement
* Donneur d'ordre
* Objet de la mission
* Lieu de la mission
* Date de départ
* Date de retour
* Nombre de jours
* Destination
* Numéro intervention when supported by backend
* Transport when supported by backend

Direction-managed fields:

* Numéro carte carburant
* Montant carburant
* Hébergement
* Lieu hébergement
* Nombre tickets Pluxee
* Montant tickets Pluxee

---

# 11. NUMBER OF DAYS

The backend calculates and validates the number of days.

Frontend MUST NOT be the authority for this value.

Frontend may display a calculated preview, but backend data remains authoritative.

Do not allow the frontend to manipulate business-critical calculated values.

---

# 12. ROUTING

Routing uses OSRM.

Direction needs route information between:

* Departure
* Destination

Persisted route information includes:

* Departure latitude
* Departure longitude
* Destination latitude
* Destination longitude
* Route distance in km
* Route duration in minutes
* Route calculation date
* Route provider

Frontend must consume the backend routing result.

DO NOT invent route distances.

DO NOT calculate fake distances in frontend.

DO NOT hardcode route values.

---

# 13. API INTEGRATION

Before calling an endpoint:

1. Inspect the NestJS controller.
2. Inspect the DTO.
3. Inspect the route.
4. Inspect request parameters.
5. Inspect response structure.
6. Use the real API.

NEVER guess endpoint names.

NEVER create fake endpoints.

NEVER use fake API data.

NEVER hardcode production data.

Use one centralized API client.

Example architecture:

```text
src/lib/api/
```

Avoid scattered raw `fetch()` calls throughout the application.

---

# 14. AUTHENTICATION

Authentication uses:

* JWT access token
* Refresh token
* Login
* Logout
* Password management
* Forgot password
* Reset password

Frontend must correctly handle:

* Login
* Session restoration
* Access token expiration
* Refresh token
* Logout
* Unauthorized responses
* Redirect to login when necessary

Never store passwords in frontend code.

Never expose secrets.

Never expose JWT secrets.

---

# 15. AUTHORIZATION UX

Frontend should hide or disable actions that the current user cannot perform.

Examples:

Employee:

```text
Créer une mission
Mes missions
Notifications
Profil
```

Team leader:

```text
Missions à valider
Missions de mon équipe
```

Department director:

```text
Missions de mon département
```

Direction:

```text
Missions à traiter
Ressources
```

RH:

```text
Missions rejetées
```

Admin:

```text
Utilisateurs
Départements
Équipes
Reports
```

However, UI restrictions are NOT security.

Backend authorization remains mandatory.

---

# 16. FRONTEND ARCHITECTURE

Prefer a structure similar to:

```text
src/
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── missions/
│   ├── notifications/
│   ├── profile/
│   ├── admin/
│   │   ├── users/
│   │   ├── departments/
│   │   └── teams/
│   ├── direction/
│   ├── rh/
│   └── reports/
│
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── ui/
│   ├── missions/
│   ├── users/
│   └── forms/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── permissions/
│   └── utils/
│
├── hooks/
├── types/
└── config/
```

Adapt this structure to the existing project.

DO NOT recreate folders that already exist unnecessarily.

---

# 17. REUSABLE COMPONENTS

Create reusable components for:

* Buttons
* Inputs
* Selects
* Modals
* Dialogs
* Tables
* Cards
* Badges
* Status badges
* Alerts
* Loading states
* Empty states
* Error states
* Pagination
* Confirmation dialogs
* Form fields
* Date pickers

Avoid duplicated UI implementations.

---

# 18. MISSION UI

Mission list should support:

* Search
* Filters
* Status
* Department
* Team
* Dates when supported
* Pagination
* Sorting when supported

Mission detail should show:

* Employee
* Mission information
* Dates
* Destination
* Client
* Motif
* Status
* Workflow
* History
* Rejection reason
* Direction resources
* Routing information
* Documents
* Audit information when authorized

---

# 19. APPROVAL UI

Approval pages must clearly show:

* Current status
* Current validation step
* Who must act
* Mission information
* Previous decisions
* History

For authorized users:

```text
Approuver
Rejeter
```

Rejection must require a reason when required by backend.

Do not display rejection actions to:

* DIRECTION
* RH
* EMPLOYE

---

# 20. DIRECTION UI

Direction should have a dedicated workspace.

Display:

* Departure
* Destination
* Route
* Distance
* Dates
* Number of days
* Fuel
* Accommodation
* Pluxee

Provide clear resource forms.

Do not allow Direction to reject missions.

---

# 21. RH UI

RH should have a dedicated rejected-missions page.

Display:

* Mission reference
* Employee
* Department
* Mission dates
* Destination
* Rejection reason
* Rejected by
* Rejection date

RH must not see rejection controls.

---

# 22. ADMIN UI

Admin pages:

```text
/admin/users
/admin/departments
/admin/teams
```

Admin must be able to:

* Create users
* Edit users
* Activate/deactivate users
* Create departments
* Edit departments
* Create teams
* Edit teams
* Assign users appropriately

Validate forms with Zod.

Backend remains the final validation authority.

---

# 23. REPORTS

Only ADMIN can export reports.

Mission export:

```text
GET /api/reports/missions/export
```

User export:

```text
GET /api/reports/users/export
```

Mission export contains the existing required business columns.

User export contains the existing required business columns.

Supported filters should follow the backend implementation.

DO NOT add export buttons for:

* RH
* DIRECTION
* DIRECTEUR_DEPARTEMENT
* CHEF_EQUIPE
* EMPLOYE

---

# 24. NOTIFICATIONS

Use the backend notification system.

Frontend must provide:

* Notification list
* Read/unread state
* Notification count
* Navigation to related mission when available

Do not invent notifications locally.

---

# 25. DOCUMENTS AND PDF

Use the existing backend document/PDF functionality.

Frontend should:

* Display available documents
* Allow authorized download/view actions
* Show loading states
* Handle errors

Do not implement a second PDF generation system unless explicitly required.

---

# 26. AUDIT

Audit data belongs to the backend.

Frontend may display authorized audit information.

Do not create fake audit records in frontend.

---

# 27. TYPESCRIPT

Use strict TypeScript.

Avoid:

```ts
any
```

Do not use `any` to bypass typing problems.

Prefer:

* Interfaces
* Types
* DTO types
* API response types
* Type guards
* Generics

If the API response is unknown, model it correctly.

---

# 28. FORMS

Use:

* React Hook Form
* Zod

Forms must have:

* Labels
* Validation
* Error messages
* Loading state
* Submit state
* Success feedback
* Server error handling

Do not duplicate validation logic unnecessarily.

Backend remains the final validation authority.

---

# 29. UI LANGUAGE

The business UI must be in French.

Examples:

```text
Connexion
Tableau de bord
Missions
Créer une mission
Modifier
Soumettre
Approuver
Rejeter
Historique
Notifications
Administration
Utilisateurs
Départements
Équipes
Direction
RH
Rapports
Déconnexion
```

Technical code can remain in English.

---

# 30. STATUS LABELS

Use clear French labels.

Example:

```text
DRAFT                    → Brouillon
SUBMITTED                → Soumise
PENDING_TEAM_LEADER      → En attente du chef d'équipe
PENDING_DEPARTMENT_DIRECTOR → En attente du directeur de département
PENDING_DIRECTION        → En attente de la direction
APPROVED                 → Approuvée
REJECTED                 → Rejetée
```

Do not change backend enum values.

---

# 31. RESPONSIVE DESIGN

The application must work on:

* Desktop
* Laptop
* Tablet
* Mobile

Use responsive layouts.

Tables should have an appropriate mobile strategy.

Forms must remain usable on small screens.

Navigation must adapt to mobile.

---

# 32. UI QUALITY

Build a professional B2B application.

Prioritize:

* Clear hierarchy
* Consistent spacing
* Consistent typography
* Consistent buttons
* Consistent forms
* Consistent cards
* Consistent status badges
* Accessible contrast
* Clear feedback
* Professional empty states
* Professional error states

Avoid:

* Excessive animations
* Random colors
* Unnecessary gradients
* Clutter
* Huge components
* Duplicate designs

---

# 33. LOADING / EMPTY / ERROR STATES

Every asynchronous page should handle:

### Loading

Display a professional loading state.

### Empty

Display a useful message.

Example:

```text
Aucune mission trouvée.
```

### Error

Display a useful error message.

Example:

```text
Une erreur est survenue.
Veuillez réessayer.
```

Never leave a blank screen.

---

# 34. DATA FETCHING

Use TanStack Query or the project's existing data-fetching standard.

Avoid unnecessary requests.

Use:

* Query caching
* Query invalidation
* Mutations
* Loading states
* Error states

After mutation, invalidate/update relevant queries correctly.

---

# 35. SERVER VS CLIENT COMPONENTS

Use Server Components by default where appropriate.

Use Client Components only when necessary for:

* Forms
* Interactive tables
* Modals
* Client state
* Browser APIs
* React Query hooks
* Interactive UI

Do not make the entire application a Client Component without a reason.

---

# 36. SECURITY

Never put secrets in:

* Client components
* Public environment variables
* Git
* Source code

Never expose:

```text
JWT_SECRET
DATABASE_URL
REFRESH_TOKEN_SECRET
```

Never trust frontend authorization.

Never trust client-provided calculated values.

Never expose unauthorized data.

---

# 37. ENVIRONMENT VARIABLES

Use environment variables for configuration.

Frontend public configuration may use:

```text
NEXT_PUBLIC_API_URL
```

Never expose backend secrets.

Do not hardcode URLs that should be configurable.

---

# 38. ERROR HANDLING

Handle:

* 400
* 401
* 403
* 404
* 409
* 422
* 500
* Network errors
* Session expiration

Messages shown to users must be understandable.

Do not display raw stack traces to users.

---

# 39. PERFORMANCE

Avoid:

* Unnecessary re-renders
* Huge client bundles
* Repeated API requests
* Duplicate data fetching
* Unnecessary dependencies

Use pagination for large datasets.

Do not load all data if the backend supports pagination/filtering.

---

# 40. CODE QUALITY

Follow:

* SOLID principles where appropriate
* DRY
* Clear naming
* Small reusable functions
* Small reusable components
* Strong typing
* Consistent imports
* No dead code

Do not over-engineer.

Prefer simple maintainable code.

---

# 41. FILE ORGANIZATION

Do not create random files.

Before creating a file, check whether an existing file already handles the same responsibility.

Do not create:

```text
MissionCard2.tsx
MissionCardNew.tsx
MissionCardFinal.tsx
api2.ts
authNew.ts
```

Instead, modify and improve the correct existing implementation.

---

# 42. NO TEMPORARY PRODUCTION CODE

Do not leave:

```ts
console.log()
```

debug code.

Do not leave:

```ts
TODO
FIXME
TEMP
MOCK
FAKE
```

unless explicitly documented and intentionally required.

No fake data in production UI.

---

# 43. API CONTRACT FIRST

Before implementing a frontend feature:

1. Find the backend endpoint.
2. Read its DTO.
3. Read its response.
4. Understand permissions.
5. Implement the frontend against that contract.

If the endpoint does not exist:

DO NOT invent it.

Report the missing backend capability and only modify the backend if absolutely necessary.

---

# 44. TESTING

Before considering a feature complete:

Run relevant:

```text
npm run lint
npm run typecheck
npm test
npm run build
```

Use the actual scripts available in package.json.

Do not invent scripts.

Fix TypeScript errors.

Fix lint errors.

Fix build errors.

Do not declare a feature finished if the project does not build.

---

# 45. E2E / INTEGRATION

Important workflows must be tested.

At minimum:

* Login
* Mission creation
* Mission submission
* Team approval
* Department approval
* Direction validation
* Rejection
* RH visibility
* Admin operations
* Notifications
* Reports permissions

Do not weaken tests just to make them pass.

---

# 46. DEVELOPMENT WORKFLOW

For every task follow:

```text
INSPECT
↓
PLAN
↓
IMPLEMENT
↓
INTEGRATE
↓
TEST
↓
REVIEW
↓
BUILD
```

Do not immediately start creating files.

First understand the existing project.

---

# 47. BEFORE CODING

Always inspect:

```text
package.json
src/
app/
components/
lib/
hooks/
types/
.env.example
existing API client
existing auth
existing routes
```

For backend integration inspect:

```text
controllers
DTOs
services
guards
Prisma models
API routes
```

Only inspect what is relevant to the requested feature, but never guess.

---

# 48. CHANGE DISCIPLINE

Make the smallest change required.

Do not refactor unrelated code.

Do not rename unrelated files.

Do not change working backend behavior.

Do not replace the architecture because of personal preference.

Do not introduce new dependencies unless necessary.

Before adding a dependency, verify whether an existing dependency already solves the problem.

---

# 49. WHEN A FEATURE ALREADY EXISTS

If an implementation already exists:

1. Reuse it.
2. Improve it if necessary.
3. Do not create a duplicate.

If two implementations already exist:

* Determine which one is actually used.
* Keep the correct one.
* Remove duplicate code only when safe.
* Do not silently break imports.

---

# 50. WHEN REQUIREMENTS ARE AMBIGUOUS

Do not invent business rules.

Use the existing project rules.

If a decision cannot be determined from:

* Existing code
* Backend API
* DTOs
* Database schema
* Project instructions

then stop before implementing the ambiguous business behavior and clearly identify what is missing.

Do not silently invent a new workflow.

---

# 51. BACKEND CHANGES

Backend changes are exceptional.

Only modify backend when:

* Frontend requires a missing endpoint
* Existing endpoint has a real bug
* Existing API contract is inconsistent
* Security issue must be fixed

When modifying backend:

* Make the smallest change
* Preserve existing API behavior
* Update tests
* Run backend tests
* Run frontend tests
* Do not redesign architecture

---

# 52. DATABASE

Frontend must NEVER connect directly to PostgreSQL.

Architecture:

```text
Next.js
   ↓
NestJS API
   ↓
Prisma
   ↓
PostgreSQL
```

Never bypass NestJS.

---

# 53. BUSINESS LOGIC

Business logic belongs primarily in the backend.

Frontend should handle:

* Presentation
* Forms
* UX
* Client validation
* Navigation
* Loading/error states

Backend handles:

* Authorization
* Workflow
* Business rules
* Data validation
* Calculations
* Transactions
* Audit
* Notifications
* Persistence

---

# 54. TRANSACTIONAL WORKFLOW

Mission workflow operations are backend-controlled.

Frontend must not simulate approval states locally.

After:

* Approve
* Reject
* Submit
* Direction validation

refresh the server state.

Never assume the mutation succeeded without checking the API response.

---

# 55. SESSION EXPIRATION

If access token expires:

1. Try refresh token when appropriate.
2. Retry the original request if refresh succeeds.
3. If refresh fails, clear session.
4. Redirect to login.

Avoid infinite refresh loops.

---

# 56. CONCURRENCY

Do not allow stale mission data to silently overwrite newer server data.

After workflow actions:

* Refresh mission detail
* Refresh mission list
* Refresh notifications when relevant

Server state is authoritative.

---

# 57. NOTIFICATION CONSISTENCY

After workflow changes, notifications may change.

Invalidate or refresh notification queries when appropriate.

Do not create local fake notification records.

---

# 58. DASHBOARD

Dashboard content must depend on the current role.

Do not show irrelevant actions.

Dashboard may include:

* Mission counts
* Pending actions
* Recent missions
* Recent notifications
* Quick actions

Only show information authorized by backend.

---

# 59. PROFESSIONAL NAVIGATION

Navigation should be role-aware.

Use a central permission/navigation configuration where possible.

Avoid repeating role checks in dozens of components.

Prefer helpers such as:

```ts
hasRole()
hasPermission()
canApproveMission()
canRejectMission()
canManageUsers()
canExportReports()
```

Adapt to existing project conventions.

---

# 60. REJECTION UX

Rejection should be explicit.

Use a confirmation dialog.

Require a rejection reason when required by the backend.

Example:

```text
Motif du rejet
[ textarea ]

Annuler
Confirmer le rejet
```

Do not allow accidental rejection.

---

# 61. APPROVAL UX

Approval should also have confirmation where appropriate.

Example:

```text
Confirmer l'approbation de cette mission ?
```

Show success feedback after successful API response.

---

# 62. ADMIN TABLES

Admin tables should provide:

* Search
* Filters when supported
* Pagination
* Clear actions
* Confirmation for destructive actions
* Loading state
* Empty state
* Error state

Avoid enormous tables on mobile.

---

# 63. ACCESSIBILITY

Use semantic HTML.

Provide:

* Labels
* Keyboard navigation
* Focus states
* Accessible dialogs
* Accessible buttons
* Appropriate aria attributes when needed

Do not rely only on color to communicate status.

---

# 64. MOBILE

Mobile is not an afterthought.

Ensure:

* Forms are usable
* Buttons are tappable
* Tables are readable
* Navigation works
* Modals fit the screen
* No horizontal overflow unless intentional

---

# 65. CODE COMMENTS

Comments should explain WHY, not obvious WHAT.

Avoid unnecessary comments.

Do not leave comments describing temporary hacks as permanent architecture.

---

# 66. GIT-FRIENDLY CHANGES

Keep changes:

* Focused
* Small
* Understandable
* Easy to review

Do not modify unrelated files.

---

# 67. COPILOT BEHAVIOR

Copilot must NOT repeatedly redo completed work.

Before coding, determine:

```text
What already exists?
What is missing?
What needs modification?
What can be reused?
```

Then implement only what is missing.

Never restart from zero because the current implementation is not written by Copilot.

Existing code is valuable.

---

# 68. DUPLICATION PREVENTION

Before creating any:

* Component
* Hook
* Service
* API client
* Type
* Page
* Utility
* Permission helper

search the repository first.

If an equivalent exists, reuse it.

---

# 69. FEATURE IMPLEMENTATION ORDER

When building the frontend, use this general order:

### Phase 1

* Login
* Authentication
* Layout
* Navigation
* Session
* Dashboard

### Phase 2

* Mission list
* Mission creation
* Mission edit
* Mission detail
* Mission history
* Submission

### Phase 3

* Team leader validation
* Department director validation
* Direction validation
* Rejection

### Phase 4

* Direction resources
* Routing
* Fuel
* Accommodation
* Pluxee

### Phase 5

* RH
* Admin users
* Departments
* Teams

### Phase 6

* Reports
* CSV
* Notifications
* Documents
* PDF

### Phase 7

* Responsive refinement
* Accessibility
* Testing
* Performance
* Build verification

Adapt this order to the existing implementation state.

Do not rebuild completed phases.

---

# 70. FINAL REVIEW BEFORE COMPLETION

Before saying a feature is complete, verify:

```text
[ ] Existing implementation inspected
[ ] No duplicate implementation created
[ ] Real backend endpoint used
[ ] Correct DTO used
[ ] Correct permissions implemented
[ ] No fake data
[ ] No hardcoded business logic
[ ] No `any`
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Success feedback
[ ] Responsive UI
[ ] French UI
[ ] Tests passed
[ ] TypeScript passed
[ ] Lint passed
[ ] Build passed
```

---

# 71. IMPORTANT BUSINESS RULES — NEVER VIOLATE

Never change these rules without explicit instruction:

```text
ADMIN = administration + reports/export

EMPLOYE = create/submit own missions

CHEF_EQUIPE = approve/reject team missions

DIRECTEUR_DEPARTEMENT = approve/reject department missions

DIRECTION = resources + final validation, NO rejection

RH = rejected missions visibility, NO rejection
```

---

# 72. CURRENT DEVELOPMENT PRIORITY

The backend is already implemented and validated.

The current priority is:

```text
BUILD THE PROFESSIONAL NEXT.JS FRONTEND
AND CONNECT IT TO THE EXISTING NESTJS API.
```

Do NOT:

* restart backend
* recreate Prisma
* recreate PostgreSQL
* create a second API
* create mock APIs
* create duplicate architecture
* invent business rules

Instead:

```text
INSPECT EXISTING PROJECT
        ↓
IDENTIFY WHAT EXISTS
        ↓
IDENTIFY WHAT IS MISSING
        ↓
REUSE EXISTING CODE
        ↓
IMPLEMENT FRONTEND
        ↓
CONNECT REAL API
        ↓
TEST
        ↓
BUILD
        ↓
REVIEW
```

---

# 73. FINAL RULE

MISSIONFLOW must be treated as a real production-oriented business application.

Priorities:

1. Correctness
2. Security
3. Existing backend contract
4. Business rules
5. Maintainability
6. Reusability
7. UX
8. Responsive design
9. Performance

DO NOT optimize for generating the maximum amount of code.

Optimize for:

```text
CORRECT CODE
REUSABLE CODE
MAINTAINABLE CODE
INTEGRATED CODE
TESTED CODE
PRODUCTION-READY CODE
```

When in doubt:

```text
INSPECT FIRST.
REUSE SECOND.
IMPLEMENT THIRD.
TEST LAST.
```

````

