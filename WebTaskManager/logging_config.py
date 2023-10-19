import logging

def init_app_logging(app):
    log_level = app.config.get('LOGGING_LEVEL', logging.DEBUG)
    log_format = app.config.get('LOGGING_FORMAT', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(log_level)
    stream_handler.setFormatter(logging.Formatter(log_format))

    del app.logger.handlers[:]
    app.logger.addHandler(stream_handler)
    app.logger.setLevel(log_level)

    app.logger.info("Logger is set up!")