## Purpose

Admin authorization capability provides email-based whitelist mechanism for managing administrator access in the application.

## Requirements

### Requirement: Admin check function
The system SHALL provide isAdmin function that checks if email exists in ADMIN_EMAILS whitelist.

#### Scenario: Admin user check
- **WHEN** isAdmin is called with "admin@test.com" and ADMIN_EMAILS contains it
- **THEN** returns true

#### Scenario: Non-admin user check
- **WHEN** isAdmin is called with "user@test.com" not in whitelist
- **THEN** returns false

### Requirement: Session-based admin check
The system SHALL provide isAdminSession function that checks if current session user is admin.

#### Scenario: Admin session
- **WHEN** isAdminSession is called with session containing admin email
- **THEN** returns true

#### Scenario: No session
- **WHEN** isAdminSession is called with null session
- **THEN** returns false

### Requirement: tRPC context includes admin flag
The system SHALL add isAdmin boolean to tRPC context based on session email.

#### Scenario: Context with admin user
- **WHEN** tRPC procedure is called by admin user
- **THEN** context.isAdmin is true

#### Scenario: Context with regular user
- **WHEN** tRPC procedure is called by non-admin
- **THEN** context.isAdmin is false

### Requirement: Protected admin procedure
The system SHALL export adminProcedure that throws FORBIDDEN if user is not admin.

#### Scenario: Admin access granted
- **WHEN** adminProcedure is used and context.isAdmin is true
- **THEN** procedure executes normally

#### Scenario: Non-admin access denied
- **WHEN** adminProcedure is used and context.isAdmin is false
- **THEN** throws TRPCError with code FORBIDDEN

### Requirement: Case-insensitive email matching
The system SHALL perform case-insensitive matching when checking admin emails.

#### Scenario: Uppercase email
- **WHEN** ADMIN_EMAILS contains "Admin@Test.com" and checking "admin@test.com"
- **THEN** returns true

#### Scenario: Mixed case
- **WHEN** checking "AdMiN@TeSt.CoM" against "admin@test.com" in whitelist
- **THEN** returns true
