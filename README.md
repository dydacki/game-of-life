# Conway's Game of Life

## Overview

The repository contains a simplified implementation of Conway's Game of Life. It was created to work with any web browser and can be tested in current versions of Google Chrome, MS Edge or Safari.

For the sake of presentation, the most basic pattern of the **Glider** was used. It traverses the infinite stage made of 625 (25x25) square tiles at the speed of c4.

## Running the application

The application consists of two files: a html file that can be opened in a browser of choice and a javascript containing the logic of the animated canvas. In order to run it, the user needs to download both files to the chosen directory (both files should be in the same directory) and open the `index.html` file in the browser.

The application contains two buttons:

    1. Start/Stop/Resume button - starts, pauses or resumes a paused game/animation.
    2. Reset button - resets the animation to the starting point and stops it.