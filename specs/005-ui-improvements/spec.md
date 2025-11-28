# Feature Specification: UI Improvements and Header Redesign

**Feature Branch**: `005-ui-improvements`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "Make a new spec using requirements in @new_spec.txt"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Updated Header with App Branding (Priority: P1)

As a user, I want to see the application name and relevant information in the header, so that I can identify the application and understand its capabilities at a glance.

**Why this priority**: The header is the primary visual identifier for the application. Updating it with proper branding and removing outdated elements is essential for establishing the application's identity and purpose.

**Independent Test**: Can be fully tested by loading the application and verifying the header displays the app icon, application name, and information links correctly, delivering immediate visual clarity about the application's purpose.

**Acceptance Scenarios**:

1. **Given** the application loads, **When** I view the top header panel, **Then** I see an app icon on the left side instead of the word "Admin"
2. **Given** I am viewing the header, **When** I look at the left side, **Then** I see the application name displayed (e.g., "DataFusion Plan Visualizer" or recommended alternative)
3. **Given** I am viewing the header, **When** I look at the right side, **Then** I see information about the plan-viz library, GitHub repository link, and offline capability description
4. **Given** I am viewing the header, **When** I look for the theme toggle button, **Then** it is no longer present in the header
5. **Given** I click on the GitHub repository link in the header, **When** the link is activated, **Then** I am taken to the plan-visualizer GitHub repository in a new tab

---

### User Story 2 - Second Sample Plan Option (Priority: P1)

As a user exploring execution plans, I want to load a second sample plan with different complexity, so that I can see how the visualizer handles various plan structures without manually entering plan text.

**Why this priority**: Providing multiple sample plans enables users to quickly understand the tool's capabilities and see different visualization patterns, which is essential for demonstrating value.

**Independent Test**: Can be tested by navigating to the Plan Visualizer page and verifying both "Load Sample 1" and "Load Sample 2" buttons are available and load their respective sample plans correctly.

**Acceptance Scenarios**:

1. **Given** I am on the Plan Visualizer page, **When** I look at the input area header, **Then** I see two buttons: "Load Sample 1" and "Load Sample 2"
2. **Given** I click "Load Sample 1", **When** the sample loads, **Then** the input field is populated with the current sample plan (existing behavior)
3. **Given** I click "Load Sample 2", **When** the sample loads, **Then** the input field is populated with the new sample plan containing a join operation with multiple file groups
4. **Given** I load Sample 2 and click Visualize, **When** the visualization renders, **Then** I see a diagram showing the join operation with multiple data sources

---

### User Story 3 - Centered Plan Visualization (Priority: P2)

As a user viewing a plan diagram, I want the visualization to be centered in the display area, so that I can see the full diagram without needing to pan immediately.

**Why this priority**: Centering improves the initial viewing experience and makes the diagram more accessible, but the feature remains functional if plans are left-aligned.

**Independent Test**: Can be tested by visualizing any plan and verifying the diagram appears centered horizontally in the visualization panel.

**Acceptance Scenarios**:

1. **Given** I visualize an execution plan, **When** the diagram renders, **Then** the plan diagram is centered horizontally in the visualization panel
2. **Given** I visualize a small plan with few nodes, **When** the diagram renders, **Then** it appears centered rather than aligned to the left edge
3. **Given** I visualize a large plan, **When** the diagram renders, **Then** the initial view shows the center portion of the diagram

---

### User Story 4 - Resizable Input and Output Panels (Priority: P2)

As a user working with plans, I want to adjust the size of the input and output panels, so that I can allocate screen space based on my current task (entering plans vs. viewing visualizations).

**Why this priority**: Resizable panels enhance usability by allowing users to customize their workspace, but the feature is functional with fixed panel sizes.

**Independent Test**: Can be tested by dragging the panel divider and verifying both panels resize proportionally while maintaining minimum usable sizes.

**Acceptance Scenarios**:

1. **Given** I am on the Plan Visualizer page, **When** I drag the divider between input and output panels upward, **Then** the input panel becomes smaller and the output panel becomes larger
2. **Given** I am on the Plan Visualizer page, **When** I drag the divider downward, **Then** the input panel becomes larger and the output panel becomes smaller
3. **Given** I resize the panels, **When** I adjust to extreme positions, **Then** both panels maintain minimum sizes that keep them usable
4. **Given** I resize the panels to my preference, **When** I refresh the page, **Then** my panel size preference is preserved

---

### Edge Cases

- What happens when the header information text is too long for smaller screens?
  → Text wraps or truncates appropriately, or switches to a more compact layout on mobile devices
- How does the app icon display when the sidebar is collapsed?
  → Icon remains visible or switches to a compact version appropriate for the collapsed state
- What happens if Sample 2 plan text is invalid or cannot be visualized?
  → Error handling displays appropriate message, same as for any invalid plan input
- How does panel resizing behave on mobile devices with touch interfaces?
  → Resizing is disabled on mobile or uses touch-friendly drag gestures
- What happens when browser window is resized while panels are at custom sizes?
  → Panels maintain their relative proportions or reset to default responsive behavior
- How does the centered visualization behave with very wide plans that exceed viewport width?
  → Plan centers on its content, and users can pan to see edges if needed

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an app icon in the sidebar header instead of the text "Admin"
- **FR-002**: System MUST display the application name on the left side of the top header panel
- **FR-003**: System MUST remove the theme toggle button from the top header panel
- **FR-004**: System MUST display information about the plan-viz library on the right side of the header
- **FR-005**: System MUST display a link to the GitHub repository (plan-visualizer) on the right side of the header
- **FR-006**: System MUST display information about offline capability on the right side of the header with a brief description
- **FR-007**: System MUST provide two sample plan buttons: "Load Sample 1" and "Load Sample 2"
- **FR-008**: System MUST load the existing sample plan when "Load Sample 1" is clicked
- **FR-009**: System MUST load a new sample plan (with join operation and multiple file groups) when "Load Sample 2" is clicked
- **FR-010**: System MUST center the plan visualization horizontally in the visualization panel
- **FR-011**: System MUST allow users to resize the input and output panels by dragging a divider
- **FR-012**: System MUST maintain minimum sizes for both panels to ensure usability
- **FR-013**: System MUST preserve panel size preferences across page refreshes
- **FR-014**: System MUST ensure header information is readable and accessible on all screen sizes (320px to 1920px width)

### Key Entities

- **App Icon**: Represents the visual identifier for the application, displayed in the sidebar header. Attributes: image source, alt text, size
- **Sample Plan**: Represents a pre-configured execution plan for demonstration. Attributes: plan text, identifier (Sample 1 or Sample 2), description
- **Panel Size Preference**: Represents user's preferred division of space between input and output panels. Attributes: input panel height percentage, timestamp

### Assumptions

- The app icon image files are available and accessible for display
- Users understand that removing the theme toggle from the header does not remove theme functionality entirely (may be accessible elsewhere)
- The header information text can be arranged in one or multiple lines as needed for responsive design
- Panel resizing uses a standard drag handle or divider interface pattern
- Minimum panel sizes are defined to ensure both panels remain functional
- The application name "DataFusion Plan Visualizer" is acceptable, or a better name will be recommended during implementation
- Offline capability description will be concise (1-2 sentences) explaining that the app works without internet connection

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify the application name and purpose from the header within 2 seconds of page load
- **SC-002**: Users can access both sample plans within 1 click each, and plans load into the input field immediately
- **SC-003**: Plan visualizations appear centered in the display area for 90% of typical plan sizes (5-50 nodes)
- **SC-004**: Users can resize panels to their preferred configuration within 3 drag operations
- **SC-005**: Panel size preferences persist across page refreshes for 100% of users who set custom sizes
- **SC-006**: Header information remains readable and accessible on screens from 320px to 1920px width
- **SC-007**: All header links (GitHub repository) are functional and open in new tabs
- **SC-008**: Both sample plans visualize successfully without errors for 100% of visualization attempts
- **SC-009**: Users can complete panel resizing without the interface becoming unusable (minimum sizes enforced)

## Dependencies

- Existing sidebar component structure
- Existing header layout component
- Existing PlanInput component
- Existing ExcalidrawCanvas component
- App icon image files
- plan-viz library (already integrated)
- GitHub repository URL: https://github.com/NGA-TRAN/plan-visualize

## Out of Scope

- Changing the overall application theme or color scheme
- Adding new theme toggle location (removal only)
- Creating additional sample plans beyond Sample 1 and Sample 2
- Adding export or save functionality for visualizations
- Modifying the core plan visualization logic or Excalidraw integration
- Adding authentication or user accounts
- Changing the sidebar navigation structure beyond the header icon

