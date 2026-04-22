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

Windows:```.\venv\Scripts\activate```

Linux/macOS:```source .venv/bin/activate``` 

Finally, install the project dependencies:

```pip3 install -r requirements.txt```

### Installing new packages
```requirements.txt``` must be manually updated upon installing a new package/adding a new dependency:

while **inside** the ```api/``` direct and with the virtual environment activated, run:

```pip install pipreqs ; pipreqs . --ignore .venv --force ; echo 'dotenv==0.9.9' >> requirements.txt```

This will install and run the pipreqs utility, which generates a new requirements.txt based on the import statements in the project. Note that we must manually append ```dotenv``` onto this requirements.txt. Although ```dotenv``` is not used within the source code, it is necessary to run the Flask server via npm. 

**Make sure to include this file in your commits!**
### Running
After completing the setup, the server can be run with the command:

Linux/macOS: ```npm run api```

Windows: ```npm run api-windows```
