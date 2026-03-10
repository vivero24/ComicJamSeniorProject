# ComicJamSeniorProject
Web-based collaborative drawing game using HTML/CSS/JavaScript along with Python

## React Webapp
### Setup
While inside the ```comic-jam-app/``` directory, run ```npm install```
to install the project the dependencies.
### Installing new packages
```npm install [package]``` can be used to install new packages. This will automatically update ```package.json``` with the new dependency. 

**Make sure to include this file in your commits!**

### Running
After completing the setup, the webapp can be run with the command:

```npm run dev```
###

## Flask Server
### Setup
While inside the ```comic-jam-app/api/``` directory, create a virtual environment:

```python3 -m venv .venv```

Then, activate the virtual environment:

Windows:```venv\Scripts\activate```

Linux/macOS:```source .venv/bin/activate``` 

Finally, install the project dependencies:

```python -m pip install -r requirements.txt```

### Installing new packages
```requirements.txt``` must be manually updated upon installing a new package/adding a new dependency:

```python -m pip freeze > requirements.txt```

**Make sure to include this file in your commits!**
### Running
After completing the setup, the server can be run with the command:

```npm run api```
