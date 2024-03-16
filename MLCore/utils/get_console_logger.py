import logging


def get_console_logger(
        module_name: str,
        logging_level: int,
        format_str: str = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
):
    logger = logging.getLogger(module_name)
    logger.setLevel(logging_level)

    console_handler = logging.StreamHandler()
    formatter = logging.Formatter(format_str)
    console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)

    return logger