from flask import Flask, Blueprint

main = Blueprint("main", __name__)

@main.route('/')
def root():
    return "ComicJam Flask Server"


