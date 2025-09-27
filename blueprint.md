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

---

## Current Development Plan

**Status:** The "Multi Patterns" game is now complete and fully functional with the new, standardized input logic. All known layout and gameplay bugs have been resolved. The project is in a stable state.

**Next Steps:** Awaiting further user requests.
