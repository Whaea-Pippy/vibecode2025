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
-   **Architecture:** The core maze is a self-contained Web Component (`<multi-maze-circle>`).
-   **Layout & Structure:**
    -   **Three-Column Layout:** A main container using `flexbox` or `grid` to create three vertical sections.
        -   **Left Panel (`#circle-character-selection`):** A grid to display selectable character images.
        -   **Center Panel (`.maze-wrapper`):** A responsive container with a strict `aspect-ratio: 1 / 1` to ensure the maze canvas is always a perfect square, which in turn ensures the maze is a perfect circle.
        -   **Right Panel (`#circle-layer-selection`):** The primary user control panel.
    -   **No Scrolling:** The entire application must fit within the viewport without causing scrollbars.
    -   **Responsive:** The three-column layout must collapse into a single vertical column on smaller screens.
-   **Right Control Panel Details:** The right panel must be structured vertically with the following elements in this specific order:
    1.  **Responsive Heading:** A main title for the control area.
    2.  **Difficulty Buttons:** A group of four buttons for selecting maze complexity:
        -   `"3 LAYERS"` (This is the default setting on load).
        -   `"4 Layers"`
        -   `"5 Layers"`
        -   `"6 Layers"`
        -   The currently selected button must have a distinct `active` class or style.
    3.  **"Back to Arcade" Button:** A button that navigates the user back to `index.html`.
    4.  **Congratulations Message Area:** An initially hidden area that will display a detailed success message upon winning.
-   **Gameplay & Functionality:**
    -   **Theme Integration:** The game dynamically loads character themes from `themes.js`.
    -   **Player Avatar:** The user's selected character is used as the player piece in the maze.
    -   **Movement:** The player avatar is moved by dragging with a mouse or finger.
    -   **Trail:** A smooth, colorful trail is rendered behind the player as they move.
    -   **Win Condition:** Successfully reaching the center of the maze. Upon winning, the "Congratulations Message" in the right panel becomes visible.
    -   **Maze Logic:** The maze generation algorithm must be flawless, creating a valid, solvable path with no visual glitches, floating walls, or incorrect gaps.

---

## Current Development Plan

**--- URGENT - CHANGE OF PLANS ---**

**Current Priority:** Development on `multi-maze-circle` is **PAUSED**. The immediate and sole focus is to perfect the original, single-theme Paw Patrol circle maze (`v1_games/maze_circle.html`). The goal is to ensure it is 100% functional, bug-free, and polished.

**Future Plan:** Once the V1 maze is perfected and approved, its code will be used as the stable foundation to restart and correctly build the `multi-maze-circle` as described in Section 5 and the 'Next Steps' below.

**--- ORIGINAL PLAN (PRESERVED FOR FUTURE REFERENCE) ---**

**Status:** The "Multi Maze Circle" game is **not complete**. The layout and functionality do not match the requirements specified in this blueprint.

**Next Steps: Implement "Multi Maze Circle" Correctly**

The immediate goal is to build the game exactly as described in section 5 of this document.

1.  **Implement the Full Right Panel:** Modify `multi_maze_circle.html` to create the complete right-side control panel, including the heading, the four layer buttons, the "Back to Arcade" button, and the placeholder for the win message.
2.  **Set Default State:** Modify `multi_maze_circle_component.js` to ensure that the "3 LAYERS" difficulty is selected by default when the game loads.
3.  **Ensure Correct Maze Logic:** Review and fix the maze generation algorithm in the component to ensure it is 100% bug-free and generates a perfect, solvable maze every time, for every difficulty level.
4.  **Finalize Layout and Styling:** Adjust `multi_maze_circle.css` to ensure the three-column layout is implemented correctly, is fully responsive, and has no scrollbars.
