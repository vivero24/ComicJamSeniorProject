This folder is part of the Download Page feature, specifically requirement D.2.

Each folder inside /comics/<gameId>/ represents a single completed comic created during the game. This folder contains all of the image pages for this comic (page1.png, page2.png, etc.).

D.2 Requirement:
When a user selects a comic to download, the backend zips the entire comic folder and returns it as a downloadable file. This allows multi-page comics to be downloaded as a single .zip archive.

The backend uses this folder's contents to generate the downloadable file for the user. These placeholder files exist so the folder structure is tracked in Git and can be used during development.
