# Components

This folder contains reusable UI components.

- `AuthCard.jsx` is the wrapper component for login/auth page sections.
- `RequestProgress.jsx` visually tracks the workflow progress of a certification request. It dynamically renders the correct pipeline stages based on the `modeStr` prop ("Mode 1", "Mode 2", or "Mode 3"), highlights the current active stage based on the `status` prop, and can scale down its size for tighter layouts (like cards) using the `compact={true}` prop.
- Add reusable UI building blocks like buttons, cards, inputs, and form sections here.
