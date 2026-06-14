## ADDED Requirements

### Requirement: Subscribe tab displays three pricing tiers

The system SHALL render three pricing cards (免费版 / 专业版 / 企业版) as static UI with no payment integration.

#### Scenario: Three pricing cards displayed

- **WHEN** user switches to "订阅升级" tab
- **THEN** three pricing cards are displayed for "免费版", "专业版", and "企业版"
- **AND** each card shows plan name, price (¥0/月, ¥29/月, ¥99/月), and key features
- **AND** cards use shadcn Card component for consistent styling

#### Scenario: Free plan marked as current

- **WHEN** the subscribe tab is rendered
- **THEN** the "免费版" card is marked with "当前方案" badge
- **AND** the other two cards show upgrade buttons ("升级" and "联系")
- **AND** all buttons are static (no click handlers for payment)

### Requirement: No payment logic or subscription state

The system SHALL hardcode the "当前方案" to the free tier and SHALL NOT read subscription status from the database or session.

#### Scenario: All users see free tier as current

- **WHEN** any authenticated user views the subscribe tab
- **THEN** "免费版" is always marked as "当前方案" regardless of actual subscription state
