from app import create_app, socketio

app = create_app(conf=None)

if __name__ == "__main__":
    debug_mode = app.config.get('DEBUG', False)
    socketio.run(app, debug=debug_mode)