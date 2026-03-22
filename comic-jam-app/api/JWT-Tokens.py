from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token
import uuid
import random
import string

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super-secret-key"
jwt = JWTManager(app)

# --- Helpers -----------------------------------------------------

def generate_game_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))

def validate_game_code(code):
    # TODO: Replace with real DB lookup
    return True if code else False

# --- API Endpoints ----------------------------------------------

@app.route("/api/create-lobby", methods=["GET"])
def create_lobby():
    user_id = str(uuid.uuid4())
    token = create_access_token(identity=user_id)
    game_code = generate_game_code()

    # TODO: Save game object to DB or memory

    return jsonify({
        "jwt": token,
        "user_id": user_id,
        "game_code": game_code
    })

@app.route("/api/join-lobby", methods=["GET"])
def join_lobby():
    username = request.args.get("username")
    game_code = request.args.get("game_code")

    if not validate_game_code(game_code):
        return jsonify({"error": "Invalid game code"}), 400

    user_id = str(uuid.uuid4())
    token = create_access_token(identity=user_id)

    # TODO: Add user to game's player list

    return jsonify({
        "jwt": token,
        "user_id": user_id
    })

@app.route("/api/protected")
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    return jsonify({"message": "Hello!", "user_id": user_id})
