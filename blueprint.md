# Project Blueprint: Kids Arcade

## Overview

This document outlines the structure, features, and design of the Kids Arcade, a web-based collection of educational games for children. The arcade is designed to be a fun, engaging, and visually appealing platform with a consistent theme system that can be applied across multiple games. The project is built with modern, framework-less HTML, CSS, and JavaScript, prioritizing maintainability and a great user experience on both desktop and mobile devices.

## Project Structure

The project follows a simple, clear file structure:

-   `index.html`: The main entry point for the arcade, displaying the game selection menu.
-   `style.css`: The main stylesheet for the arcade menu.
-   `main.js`: Main JavaScript for the arcade menu (if any is needed).
-   `blueprint.md`: This document.
-   `themes.js`: A shared ES Module that exports all character and theme data for the games.
-   `multi_counting.html`, `multi_counting.css`, `multi_counting.js`: The files for the "Multi Counting" game.
-   `multi_patterns.html`, `multi_patterns.css`, `multi_patterns.js`: The files for the "Multi Patterns" game.
-   `multi_maze_circle.html`, `multi_maze_circle.css`, `multi_maze_circle.js`, `multi_maze_circle_component.js`: The files for the "Multi Maze Circle" game.
-   `images/`: A directory containing all character and theme images.
-   `v1_games/`: A directory containing the original, single-theme versions of the games for reference.

---

## Implemented Features & Design

### 1. Arcade Hub (`index.html`)

-   **Purpose:** Provides a central, welcoming landing page for users to choose a game.
-   **Design:**
    -   Clean, centered layout with a prominent title.
    -   Each game is represented by a large, visually distinct "card" that is easy to tap or click.
    -   A subtle, premium noise texture is applied to the background.
    -   The design is fully responsive and works well on mobile and desktop.

### 2. Theming System (`themes.js`)

-   **Purpose:** To create a centralized and easily expandable source of truth for all character and theme data. This allows for consistent branding and imagery across all games.
-   **Structure:**
    -   An ES Module (`themes.js`) exports a single object, `mazeThemes`.
    -   This object contains nested objects for each theme: `everyone`, `pawPatrol`, `gabby`, and `zog`.
    -   The `everyone` theme is a composite of all characters from the other themes.
    -   Each theme contains a `characters` array, where each character is an object with `name` and `image` properties.

### 3. "Multi Counting" Game

-   **Purpose:** An interactive counting game where the user finds and counts specific characters.
-   **Features:**
    -   **Theme Selection:** The user can choose between "Everyone", "Paw Patrol", "Gabby", and "Zog" themes.
    -   **Difficulty Selection:** The user can choose the number of characters to find (from 3 to 6).
    -   **Dynamic UI:** The game board and the target character display are dynamically generated based on the selected theme and difficulty.
    -   **Interactive Counting:** The user taps or clicks on the correct characters on the game board. A counter provides real-time feedback.
    -   **Win State:** Upon finding all characters, a celebratory "You did it!" message appears with confetti effects.

### 4. "Multi Patterns" Game

-   **Purpose:** A pattern recognition game where the user observes a sequence of characters and then completes the next three steps in the pattern.
-   **Features:**
    -   **Theme Selection:** The user can choose between "Everyone", "Paw Patrol", "Gabby", and "Zog" themes.
    -   **Difficulty Selection:** The user can choose the complexity of the underlying pattern (e.g., a 2-character pattern like A-B-A-B, or a 4-character pattern like A-B-C-D-A-B-C-D). This is set via the "Length" buttons.
    -   **Fixed Input Challenge:** Regardless of the underlying pattern complexity, the user is always challenged to correctly place the **next three characters** in the sequence. This standardizes the game's conclusion and UI.
    -   **Single-Line Layout:** The pattern and the three user input squares are displayed in a single, continuous, horizontally scrolling line.
    -   **Full-Width Scrolling:** The game board spans the full width of the browser viewport, with overflow handled correctly to prevent unwanted page-level scrollbars.
    -   **Cross-Device Input:**
        -   **Desktop:** Supports both traditional drag-and-drop and a click-to-select/click-to-place mechanic.
        -   **Mobile:** Relies on a clear and simple click-to-select/click-to-place mechanic.
    -   **Win State:** When the three input squares are correctly filled, a "Congratulations!" message appears with confetti and shows the three characters the user correctly chose.

### 5. "Multi Maze Circle" Game

-   **Purpose:** A circular maze game where the user navigates a character from the outer edge to the center.
-   **Features:**
    -   **Web Component Architecture:** The maze is built as a reusable Web Component (`<multi-maze-circle>`), encapsulating its own logic and rendering.
    -   **Theme & Difficulty Selection:** The user can select character themes and the number of maze layers (4, 5, or 6).
    -   **Responsive Controls:** Supports keyboard and mouse/touch drag-and-drop.
-   **Design:**
    -   **Corrected Flexbox Layout:** The layout uses a robust Flexbox implementation to guarantee a "fit-to-screen" experience with no unwanted scrolling.
    -   **Perfectly Circular Maze:** The maze container is forced into a `1:1` aspect ratio, ensuring the maze is always a perfect circle.

---

## Current Development Plan

**Status:** The "Multi Maze Circle" game is **Buggy**. The current maze generation algorithm, while functional, has several critical bugs that result in an incorrect and unfair maze layout. The visual feedback for player movement also requires refinement.

**Next Steps: Bug Fixes and Refinements for "Multi Maze Circle"**

The following issues will be addressed in the next development cycle:

1.  **Correct Barrier Placement:** Fix a bug causing some barrier walls to "float" instead of properly connecting to both sides of a ring path, making them ineffective. All barriers must be correctly drawn.
2.  **Ensure Single Gaps:** Fix a bug that can create multiple gaps in a single ring wall, violating the "one way through" principle for each layer. The algorithm will be corrected to generate exactly one gap (of the appropriate width) per ring wall.
3.  **Align Final Exit Path:** Implement a new rule to improve the end-game experience. The gap leading *out* of the second-to-innermost ring (Ring 1) will be algorithmically aligned with the final exit gap *in* the innermost ring (Ring 0), creating a clear and satisfying final move to the goal.
4.  **Smoother Player Trail:** Refactor the trail rendering logic. Instead of drawing a series of straight lines between discrete cell centers, the trail will be rendered as a smooth, curved path that more accurately follows the player's circular movement.
