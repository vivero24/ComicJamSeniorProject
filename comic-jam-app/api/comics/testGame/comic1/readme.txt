This folder is part of the Download Page feature, specifically requirement D.1.

After a game session finishes, the server generates a directory for the game inside /comics/<gameId>/.
Each subfolder inside that directory (e.g., comic1, comic2, etc.) represents one completed comic created during the game.

Each comic folder contains the image pages that make up that comic (page1.png, page2.png, etc.).

D.1 Requirement:
The backend reads this directory structure to list all comics created during the game. The API endpoint for D.1 scans the /comics/<gameId>/ directory, identifies each comic folder, counts the pages, and returns a JSON list of available comics to the frontend.

These placeholder files exist so the folder structure is tracked in Git and can be used during development
