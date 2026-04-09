# Component Architecture

The project follows a modular, component-based architecture for clean separation of concerns and reusability.

## Core Components
- **`GradientEditor`**: The main container component that orchestrates the editor state and layout.
- **`ControlPanel`**: Houses all the configuration settings (types, layers, effects).
- **`ColorStopEditor`**: Handles the management and adjustment of color stops within a gradient.
- **`GradientPreview`**: A dedicated component for rendering the live preview of the generated CSS.
- **`CssExport`**: Provides the UI for viewing and copying the generated CSS code.
- **`NoiseFilter`**: Utility component for applying texture and grain effects.

## UI Library
Standardized UI components are located in `components/ui`. These are based on Radix UI and should be used for consistent interaction patterns:
- Buttons, Sliders, Switches, Tabs, etc.

## State & Logic
- **`lib/`**: Contains utility functions for gradient calculation, CSS generation, and color math.
- **`hooks/`**: Custom React hooks for shared logic like animation or external state persistence.
