# Epic and Stories Template

## Epic: [Epic Name]

**Epic ID:** EPIC-XXX  
**Priority:** [High/Medium/Low]  
**Status:** [Not Started/In Progress/Completed]  
**Description:** [Brief description of the epic and its business value]

### User Stories

#### Story: [Story Title]
**Story ID:** STORY-XXX  
**Priority:** [High/Medium/Low]  
**Status:** [Not Started/In Progress/Completed]

---

## Template Usage Instructions

1. **Epic**: A large body of work that can be broken down into smaller stories. Typically represents a major feature or capability.
   - Give each epic a clear, descriptive name
   - Assign a unique ID (e.g., EPIC-001, EPIC-002)
   - Set priority based on business value and dependencies
   - Include a brief description of the epic's purpose

2. **User Story**: A specific piece of functionality told from the user's perspective, part of an epic.
   - Write story titles in format: "As a [user type], I want to [action] so that [benefit]"
   - Or simplified format: "[Action] [object]" (e.g., "Create new grocery item")
   - Assign unique IDs (e.g., STORY-001, STORY-002)
   - Stories should be small enough to complete in one sprint

3. **Story Titles Only Format** (for lightweight planning):
   - Omit acceptance criteria and technical details
   - Focus on what needs to be built, not how
   - Keep titles clear and concise
   - Group related stories under appropriate epics

4. **Priority Levels**:
   - **High**: Must have for MVP, blocking other work
   - **Medium**: Important but not blocking
   - **Low**: Nice to have, can be deferred

5. **Status Values**:
   - **Not Started**: Work hasn't begun
   - **In Progress**: Actively being worked on
   - **Completed**: Work is done and validated

---

## Example Epic with Stories (Story Titles Only)

### Epic: User Authentication
**Epic ID:** EPIC-001  
**Priority:** High  
**Status:** Not Started  
**Description:** Enable users to create accounts and securely log in to access their personalized data.

#### Stories:
- STORY-001: Create user registration form
- STORY-002: Implement email verification
- STORY-003: Build login page
- STORY-004: Add password reset functionality
- STORY-005: Implement session management
- STORY-006: Add logout capability

---

## Example Epic with Stories (Full Format with Acceptance Criteria)

### Epic: User Authentication
**Epic ID:** EPIC-001  
**Priority:** High  
**Status:** Not Started  
**Description:** Enable users to create accounts and securely log in to access their personalized data.

#### Story: Create user registration form
**Story ID:** STORY-001  
**Priority:** High  
**Status:** Not Started

**As a** new user  
**I want to** register for an account  
**So that** I can save my data and access it from any device

**Acceptance Criteria:**
- [ ] Registration form has email, password, and confirm password fields
- [ ] Password must be at least 8 characters
- [ ] Email validation prevents invalid formats
- [ ] Duplicate email addresses show appropriate error message
- [ ] Successful registration redirects to email verification page

**Technical Notes:**
- Use bcrypt for password hashing
- Store user data in users table
- Validate email format on both frontend and backend
