from app import create_app, socketio

# Entrance point for the Flask server,
# simply create and run the app
app = create_app()

if __name__ == '__main__':
       socketio.run(app)
