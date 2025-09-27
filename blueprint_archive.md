# Blueprint History: Kids' Arcade Games

## Previous Task: Fix Broken Image Links in Archived Games (September 27, 2025)

*   **Goal:** Fix broken image links in all archived games within the `v1_games` directory.
*   **Problem:** After archiving the games by moving them into the `v1_games` folder, the relative image paths were broken, preventing images from loading.
*   **Solution:**
    *   Copied the entire `images` directory into the `v1_games` directory.
    *   This approach makes the archived games self-contained and ensures that all relative image paths within the game files resolve correctly without needing to modify each file individually.
    *   Verified that all archived games now load their images correctly.

# Blueprint: Kids' Arcade Games

## Overview

This document outlines the design and features of a collection of kids' arcade games. The application is a framework-less web project built with modern HTML, CSS, and JavaScript, designed to be responsive, accessible, and visually engaging for a young audience.

## Project Repository

*   **GitHub:** https://github.com/Whaea-Pippy/vibecode2025

## Games

### Circle Maze Adventure

*   **Objective:** Navigate a character from the outer edge of a circular maze to the goal character at the center.
*   **Dynamic Circular Maze:** The maze is randomly generated using a recursive backtracking algorithm adapted for a circular grid, creating a new challenge every time.
*   **Character Universe:** Features the combined roster of characters from **Paw Patrol** and **Gabby's Dollhouse**.
*   **Dynamic Character Selection:** A random set of 6 characters is chosen for each game. Players can select their avatar from this set, which is displayed on the side in landscape mode.
*   **Canvas-Based Rendering:** The maze, player, and goal are all drawn on an HTML5 canvas, allowing for a smooth and scalable visual experience.
*   **Difficulty Levels:** Players can choose from Easy (6 levels), Medium (9 levels), and Hard (12 levels).
*   **Controls:** Supports keyboard arrow keys for radial and tangential movement, as well as intuitive swipe gestures on touchscreens.
*   **Winning Modal:** A modal appears when the player reaches the center, celebrating the win with the characters from that round.

### Classic Maze Adventure

*   **Objective:** Navigate a character through a randomly generated rectangular maze to find a goal character.
*   **Character Universe:** The game features a combined roster of characters from both **Paw Patrol** and **Gabby's Dollhouse**.
*   **Dynamic Character Selection:** For each new game, a random set of 6 characters is selected from the combined universe and displayed in a 3x2 grid, allowing the player to choose their avatar. The player icon now correctly updates mid-game when a new character is selected.
*   **Winning Modal:** The congratulatory modal now correctly displays only the two relevant characters: the player character and the goal character.
*   **Core Gameplay Features:**
    *   **Random Maze Generation:** Mazes are generated using a recursive backtracking algorithm.
    *   **Difficulty Levels:** Easy (8x8), Medium (12x12), and Hard (16x16) options are available.
    *   **Controls:** Supports both keyboard arrow keys and touchscreen path tracing.

### Paw Patrol Maze Adventure

*   **Objective:** Navigate a Paw Patrol pup through a maze to rescue another pup.
*   **Character Selection:** In landscape mode, players can select their character from a complete list of Paw Patrol pups.
*   **Random Goal Character:** The character to be rescued is randomly selected.

### Paw Patrol Pattern Game

*   **Objective:** Complete a repeating pattern of Paw Patrol characters.
*   **Pattern Length:** Players can choose a pattern length of 2, 3, or 4 characters.
*   **Drag-and-Drop:** Players complete the sequence by dragging and dropping the correct character into place.

## Current Task: Enhance Counting Game

*   **User Feedback:** The initial version of the counting game is "awesome!"
*   **Original Objective:** Count the number of characters displayed (from 1 to 6) and select the correct number.
*   **Goal:** Enhance the counting game with difficulty levels and an improved layout.
*   **Implementation Plan:**
    *   **Level Buttons:**
        *   Introduce difficulty levels with the following ranges: [1 to 6], [7 to 12], [13 to 20], and a challenge mode of [0 to 20].
    *   **Visual Layout:**
        *   Characters will always be displayed in 2 to 4 rows to make quantities easier to perceive.
        *   This grid layout will make even numbers more obvious (e.g., 4 will be two rows of two, 6 will be two rows of three).
    *   **Responsive Design:**
        *   The layout will be adapted for mobile devices, considering the different screen sizes and aspect ratios.

## Known Issues

### Cirlce Maze
*   Images are too small.
*   The maze layout is confusing.
*   Arrows allow the character to move through maze walls.
*   Touch screen trace functionality does not work at all.

### Paw Patrol Maze
*   This maze needs the same fixes that the Classic Maze needs.

### Pattern Games (Both)
*   The touch screen drag-and-drop functionality has never worked and still does not.

## File Structure

*   `index.html`: The main landing page.
*   `style.css`: The stylesheet for the `index.html` page.
*   `maze_circle.html`: The main file for the **Circle Maze Adventure**.
*   `maze_rectangle.html`: The main file for the **Classic Maze Adventure**.
*   `paw_patrol_maze.html`: The main file for the **Paw Patrol Maze Adventure**.
*   `pattern.html`: The main file for the pattern game.
*   `pattern.js`: The JavaScript logic for the pattern game.
*   `pattern.css`: The stylesheet for the pattern game.
*   `counting.html`: The main file for the counting game.
*   `counting.js`: The JavaScript logic for the counting game.
*   `counting.css`: The stylesheet for the counting game.

## Previous Task: Critical Movement Bug Fix (September 26, 2025)

*   **Goal:** Fix a critical bug in the Classic Maze Adventure causing erratic movement, a broken trail, and unresponsiveness, making the game unplayable.
*   **Fix:** A critical typo was identified and corrected in the `moveTo` function. The line `moved.true;` was changed to `moved = true;`. This error was preventing rightward moves from being registered, causing the player's logical and visual positions to de-synchronize. This single fix resolves the erratic diagonal movement, the broken trail, and the general unresponsiveness.

## Previous Task: Bug Fixes

*   **Goal:** Address several bugs in the maze games to improve functionality and user experience.
*   **Changes Implemented:**
    *   **Circle Maze Fix:** Corrected a critical rendering bug in `maze_circle.html`. The maze was failing to draw because the canvas context was not correctly retrieving CSS variable colors. The code was updated to use `getComputedStyle` to ensure the maze renders correctly.
    *   **Classic Maze Fix 1 (Player Icon):** In `maze_rectangle.html`, the logic was fixed to ensure the player's icon in the maze updates instantly when a new character is selected from the side panel without requiring a full game reset.
    *   **Classic Maze Fix 2 (Win Modal):** The winning modal in `maze_rectangle.html` was modified to display only the player's character and the goal character, providing a more focused and relevant win screen.
    *   **Blueprint Process Correction:** Updated the blueprint to add new tasks without deleting the history of previous tasks.

## Previous Task: Create Circle Maze

*   **Goal:** Create a new maze game with a circular layout, incorporating the advanced features from the other mazes.
*   **Changes Implemented:**
    *   Developed a new maze generation algorithm for a circular grid.
    *   Rendered the maze, player, and goal on an HTML5 canvas.
    *   Integrated the combined Paw Patrol and Gabby's Dollhouse character set with a 6-character random selection screen.
    *   Implemented controls for both keyboard (arrow keys) and touch (swipe gestures).
    *   Added the new game to the project blueprint.

## Previous Task: Fix Player Visibility Bug

**Goal:** Fix a visual bug in the Classic Maze Adventure where the player's character disappears after the first game session.

**Detailed Description:** The player's avatar is visible and controllable on the first game (Easy level). However, when the game is reset (either by winning and playing again, or by changing the difficulty), the player's avatar is no longer rendered on the screen. The underlying game logic remains functional—the user can still control the invisible character and trigger the win condition—but the visual representation is gone.

**Fix:** Modified the `drawMaze` function in `maze_rectangle.html` to ensure the `player` element is always re-appended to the `gameContainer` after the container is cleared. The line `gameContainer.append(player);` was moved to execute after the check for the player element's existence, ensuring it is added to the DOM on every redraw.

## Previous Task: Classic Maze Gameplay Fixes (September 26, 2025)

*   **Goal:** Address two gameplay bugs in the Classic Maze Adventure.
*   **Fixes:**
    1.  **Character Visibility on Change:** Resolved an issue where the player character would disappear if the user selected a new character mid-game. The `createCharacterSelection` function was updated to ensure the `player.src` is updated immediately upon selection.
    2.  **Static Goal Character:** Corrected the logic to ensure the goal character remains the same throughout a single game session, even when the player character is changed. The `startGame` function was modified to only reset the characters when `resetCharacters` is true, which is set to false when changing characters.
