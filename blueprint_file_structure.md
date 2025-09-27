# AI Developer's Guide to the Project Structure

This document defines the project structure in a way I, the AI assistant, will understand and follow without deviation.

---

## 1. The Two Project Folders: Archive vs. Active

There are two main areas in this project:

### **A. The Archive: `v1_games/`**

*   **Purpose:** This folder is a **MUSEUM**. It contains the old, original, standalone game files.
*   **My Instructions:**
    *   I will **NEVER** modify the files in this folder unless given a direct and explicit instruction to do so for a specific, isolated reason (like fixing a broken image path).
    *   I will use the code in this folder for **REFERENCE ONLY**. It is a source of logic and assets to be ported to the *Active Projects*.
    *   Bugs in these games are documented in `blueprint_future_goals.md` and are **NOT** part of my current work.

### **B. Active Projects: The Root Folder (`/`)**

*   **Purpose:** This is the **WORKSHOP**. This is where the new, consolidated, multi-game applications are built.
*   **Examples:** `multi_maze.html` is an Active Project.
*   **My Instructions:**
    *   This is where all my development work happens.
    *   The goal is to create single applications that contain multiple games (e.g., `multi_maze` will contain Classic, Paw Patrol, Zog, and Gabby mazes).
    *   The code must be modular and reusable. When I build the "Classic Maze," I am really building a "Maze Component" that can be reused with different themes.

---

## 2. What We Are Currently Working On: The STOP Sign Method

To ensure I do not get confused or go off-task, I will adhere to the following rule:

*   The **"Current Task"** section in the main `blueprint.md` is my **STOP SIGN**.
*   I will read it at the start of every session and after every command.
*   I will **ONLY** work on the tasks described in that section.
*   I will not work on bugs in the archive, suggest unrelated features, or modify any other part of the project unless it is part of the explicit "Current Task".

This structure is my absolute source of truth. I will follow it precisely to avoid any further errors in judgment or execution.
