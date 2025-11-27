# Feature Specification: Plan Visualizer

**Feature Branch**: `002-plan-visualizer`  
**Created**: 2025-11-26  
**Status**: Draft  
**Input**: User description: "Add a new feature called Plan Visualizer that allows users to enter a string of DataFusion Physical Execution Plan, called executionPlan, and use convertPlanToExcalidraw() in npm package called 'plan-viz' to convert the executionPlan to excalidrawJson. Then use Excalidraw from '@excalidraw/excalidraw' to display the excalidrawJson."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enter and Visualize Execution Plan (Priority: P1)

As a developer or data engineer, I want to paste a DataFusion Physical Execution Plan text into an input field and see it rendered as an interactive diagram so that I can understand the query execution flow visually.

**Why this priority**: This is the core functionality of the feature. Without the ability to input a plan and see it visualized, the feature has no value.

**Independent Test**: Can be fully tested by pasting a valid execution plan string and verifying an interactive diagram appears, delivering immediate visual understanding of query execution flow.

**Acceptance Scenarios**:

1. **Given** the Plan Visualizer page is loaded, **When** I paste a valid DataFusion Physical Execution Plan into the input area, **Then** the plan is converted and displayed as an interactive Excalidraw diagram below the input.

2. **Given** a plan has been entered and visualized, **When** I modify the plan text, **Then** the diagram updates to reflect the new plan structure.

3. **Given** an empty input field, **When** I click visualize without entering any text, **Then** I see a helpful message indicating that a plan is required.

---

### User Story 2 - Interact with the Visualization (Priority: P2)

As a user viewing a plan diagram, I want to pan, zoom, and interact with the Excalidraw canvas so that I can explore large or complex execution plans in detail.

**Why this priority**: Interaction capabilities enhance usability for complex plans but are not strictly required for basic visualization.

**Independent Test**: Can be tested by rendering any plan and verifying zoom, pan, and selection behaviors work as expected on the Excalidraw canvas.

**Acceptance Scenarios**:

1. **Given** a plan diagram is displayed, **When** I use scroll or pinch gestures, **Then** I can zoom in and out of the diagram.

2. **Given** a plan diagram is displayed, **When** I click and drag on the canvas, **Then** I can pan to view different parts of the diagram.

3. **Given** a plan diagram is displayed, **When** I click on a node in the diagram, **Then** the node is selected and highlighted.

---

### User Story 3 - Handle Invalid Input Gracefully (Priority: P2)

As a user, when I enter an invalid or malformed execution plan, I want to see a clear error message so that I understand what went wrong and how to fix it.

**Why this priority**: Error handling is essential for good user experience, preventing confusion when invalid input is provided.

**Independent Test**: Can be tested by entering known invalid plan strings and verifying appropriate error messages are displayed.

**Acceptance Scenarios**:

1. **Given** the input field contains invalid plan text, **When** I attempt to visualize, **Then** I see a descriptive error message explaining the input is not a valid execution plan.

2. **Given** the conversion fails for any reason, **When** the error occurs, **Then** the previous valid visualization (if any) remains visible while the error message is shown.

---

### User Story 4 - Access Plan Visualizer from Navigation (Priority: P3)

As a user of the admin template, I want to access the Plan Visualizer from the sidebar navigation so that I can easily find and use this tool.

**Why this priority**: Navigation integration is a polish item; the feature can be accessed directly via URL during initial development.

**Independent Test**: Can be tested by clicking the navigation item and verifying the Plan Visualizer page loads.

**Acceptance Scenarios**:

1. **Given** I am on any page of the admin template, **When** I click "Plan Visualizer" in the sidebar, **Then** I am navigated to the Plan Visualizer page.

---

### Edge Cases

- What happens when the execution plan is extremely large (thousands of nodes)?
- How does the system handle special characters or encoding issues in the plan text?
- What happens if the plan-viz library fails to load or is unavailable?
- How does the visualization behave when the browser window is resized?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a text input area where users can enter or paste DataFusion Physical Execution Plan text
- **FR-002**: System MUST convert the entered plan text to Excalidraw JSON format using the plan-viz library's convertPlanToExcalidraw() function
- **FR-003**: System MUST display the converted plan as an interactive Excalidraw diagram
- **FR-004**: System MUST allow users to interact with the diagram (zoom, pan, select elements)
- **FR-005**: System MUST display user-friendly error messages when plan conversion fails
- **FR-006**: System MUST preserve the input text when conversion fails, allowing users to correct and retry
- **FR-007**: System MUST integrate with the existing sidebar navigation
- **FR-008**: System MUST maintain responsive layout across different screen sizes (320px to 1920px width)
- **FR-009**: System MUST support both light and dark themes for the visualization area

### Key Entities

- **ExecutionPlan**: The raw text string representing a DataFusion Physical Execution Plan entered by the user
- **ExcalidrawJson**: The converted JSON structure compatible with Excalidraw, containing nodes and connections representing the plan
- **VisualizationState**: The current state of the visualization including zoom level, pan position, and selected elements

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can visualize an execution plan within 3 seconds of clicking the visualize button
- **SC-002**: The visualization correctly represents all nodes and relationships in the execution plan
- **SC-003**: Users can zoom to view plans with up to 100 nodes without performance degradation
- **SC-004**: Error messages are displayed within 1 second of detecting invalid input
- **SC-005**: The feature is accessible from the main navigation within 2 clicks from any page
- **SC-006**: Visualization renders correctly on screens from 320px to 1920px width
- **SC-007**: Both light and dark themes are fully supported with readable contrast ratios

## Assumptions

- The plan-viz npm package provides a stable `convertPlanToExcalidraw()` function that accepts a string and returns valid Excalidraw JSON
- DataFusion Physical Execution Plans follow a consistent text format that the plan-viz library can parse
- The @excalidraw/excalidraw library supports embedding as a React component with programmatic control over displayed content
- Users are familiar with DataFusion execution plans and understand the visual representation
- The input plans will typically range from simple (5-10 nodes) to moderately complex (up to 100 nodes)
- Network latency for loading the Excalidraw and plan-viz libraries is acceptable for the use case

## Dependencies

- npm package: `plan-viz` (provides `convertPlanToExcalidraw()` function)
- npm package: `@excalidraw/excalidraw` (provides the visualization component)
- Existing admin template infrastructure (navigation, theming, layout)

## Out of Scope

- Saving or exporting visualizations to files
- Sharing visualizations via URL or link
- Editing the visual diagram and regenerating the plan text
- Support for other query plan formats (only DataFusion Physical Execution Plans)
- Historical plan storage or comparison between plans
- Authentication or access control for the visualizer

