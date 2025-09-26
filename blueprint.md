# Blueprint: Paw Patrol Games

## Overview

This document outlines the design and features of the Paw Patrol games. The application is designed to be responsive, accessible, and visually engaging for a young audience.

## Games

### Paw Patrol Maze Adventure

*   **Objective:** Fix the player character display, add a missing character, and enhance the winning message.
*   **Player Character Display:** The player's avatar in the maze should correctly display the selected character.
*   **Winning Modal:**
    *   The winning message will be updated to dynamically display which character saved the lost pup (e.g., "Chase found and saved Skye").
*   **Missing Character:** Add the missing "Rubble" character to the character selection and the game.

#### Core Gameplay

*   **Random Maze Generation:** Mazes are generated using a recursive backtracking algorithm, ensuring a new experience every time.
*   **Difficulty Levels:** Users can choose from three difficulty levels: Easy (8x8), Medium (12x12), and Hard (16x16).
*   **Character Selection:** In landscape mode, players can select their character from a list of Paw Patrol pups.
*   **Random Goal Character:** The character at the end of the maze is randomly selected from the available characters, ensuring a surprise ending.
*   **Static Entry & Dynamic Exit:** The maze's starting point is permanently set to the middle of the left edge, while the exit character on the right is randomized.
*   **Controls:** 
    *   **Keyboard:** Players can use the arrow keys for precise, one-square-at-a-time movement.
    *   **Touchscreen:** Players can trace a path with their finger in real-time.

#### Visual & Interactive Features

*   **Paw Patrol Theme:** The game features Paw Patrol characters (Chase, Rubble, Skye, Marshall, Zuma) to create an engaging experience for kids. All character images are stored locally for fast, reliable loading.
*   **Character Selection UI:** In landscape mode, a vertical panel on the left displays the available characters. The selected character is highlighted.
*   **Larger Images:** Character images in the selection panel, the goal area, and the winning modal have been enlarged by 50% for better visibility.
*   **Visual Cues:** The starting cell is colored light green, and the ending cell is colored light blue, making them instantly recognizable.
*   **Rainbow Path Tracing:** The player's path is traced with a vibrant, multi-colored rainbow effect.
*   **Dynamic Layout:** The application layout dynamically adjusts to the true visible area of the browser window.
*   **Congratulations Modal:** A celebratory modal with all the Paw Patrol characters appears when the maze is solved.

### Paw Patrol Pattern Game

#### Core Gameplay

*   **Pattern Matching:** The game presents a sequence of Paw Patrol characters, and the player must complete the pattern.
*   **Selectable Pattern Length:** Users can select a pattern length of 2, 3, or 4 characters via on-screen buttons.
*   **Random Pattern Display:** The selected pattern is repeated randomly between two and three times. The user is then prompted to add the next characters in the sequence.
*   **Interactive Pattern Completion:** The user can drag and drop characters into empty slots to complete the pattern.
*   **Visual Feedback:** Correctly placed characters are visually confirmed.

#### Winning Display

*   **Large, Rainbow Text:** Upon successful completion, a large, rainbow-colored "Congratulations!" message is displayed below the game board.
*   **Pattern Characters Displayed:** The message includes the images of the characters that formed the winning pattern.
*   **Not a Modal:** The winning display is part of the main page flow, not an overlay, allowing the user to see both the completed pattern and the congratulatory message.

## File Structure

*   `index.html`: The main landing page.
*   `style.css`: The stylesheet for the `index.html` page.
*   `maze_image_test.html`: The main file for the maze game.
*   `pattern.html`: The main file for the pattern game.
*   `pattern.css`: The stylesheet for the pattern game.
*   `pattern.js`: The JavaScript logic for the pattern game.

## Recent Changes

*   **Fix: Skye Image Path:** Corrected the file path for the character "Skye" from `sky.jpg` to `skye.jpg` in `maze_image_test.html` and `pattern.js` to resolve loading issues and ensure the image displays correctly in both the maze and pattern games.