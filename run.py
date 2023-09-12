from app import create_app, socketio

app = create_app(conf=None)

if __name__ == "__main__":
    socketio.run(app, debug=True)