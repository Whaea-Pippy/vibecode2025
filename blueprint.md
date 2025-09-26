# Blueprint: Kids' Arcade Games

## Overview

This document outlines the design and features of a collection of kids' arcade games. The application is a framework-less web project built with modern HTML, CSS, and JavaScript, designed to be responsive, accessible, and visually engaging for a young audience.

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

## File Structure

*   `index.html`: The main landing page.
*   `style.css`: The stylesheet for the `index.html` page.
*   `maze_circle.html`: The main file for the **Circle Maze Adventure**.
*   `maze_rectangle.html`: The main file for the **Classic Maze Adventure**.
*   `paw_patrol_maze.html`: The main file for the **Paw Patrol Maze Adventure**.
*   `pattern.html`: The main file for the pattern game.
*   `pattern.js`: The JavaScript logic for the pattern game.
*   `pattern.css`: The stylesheet for the pattern game.

## Current Task: Bug Fixes

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
