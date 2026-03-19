#Setup (Flask + JWT)
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token
import uuid

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super-secret-key"
jwt = JWTManager(app)


# REST Endpoint for Host Token(/create-lobby)
import random
import string

def generate_game_code():
  return ''.join(random.choices(string.ascii_uppercase + string.digit, k=5))

@app.route("/create-lobby", methods=["GET"])
def create_lobby():
  user_id = str(uuid.uuid4()) # Unique host ID
  token = create_access_token(identity=user_id)

game_code = generate_game_code()

#TODO: Create Game object in DB or memory:
#Game(host_id=user_id, game_code=game_code, ...)

return jsonify({
  "jwt": token,
  "user_id": user_id,
  "game_code": game_code
})



#REST Endpoint for Player Token(/join-lobby)

@app.route("/join-lobby", methods=["GET"])
def join_lobby():
    username = request.args.get("username")
    game_code = request.args.get("game_code")

    if not validate_game_code(game_code):
        return jsonify({"error": "Invalid game code"}), 400

    user_id = str(uuid.uuid4())  # Unique player ID
    token = create_access_token(identity=user_id)

    # TODO: Add user_id to the game's Player IDs list

    return jsonify({
        "jwt": token,
        "user_id": user_id
    })



#Using Token for later use(Protected Routes)

from flask_jwt_extended import jwt_required, get_jwt_identity

@app.route("/protected")
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    return jsonify({"message": "Hello!", "user_id": user_id})



