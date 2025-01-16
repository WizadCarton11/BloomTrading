import logging
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
import os


class CustomLogger:
    """
    A custom logger class with advanced features like rotating logs and daily logs.
    """

    def __init__(self,
                 name,
                 log_file=None,
                 log_level=logging.INFO,
                 rotation_type="size",
                 max_bytes=5 * 1024 * 1024,
                 backup_count=5,
                 interval=1):
        """
        Initializes the custom logger.

        Args:
            name (str): Name of the logger.
            log_file (str, optional): Path to the log file. Defaults to None.
            log_level (int): Logging level (e.g., logging.INFO, logging.DEBUG). Defaults to logging.INFO.
            rotation_type (str): Type of log rotation ('size' or 'time'). Defaults to 'size'.
            max_bytes (int): Maximum file size for rotation (in bytes). Used if rotation_type='size'. Defaults to 5 MB.
            backup_count (int): Number of backup files to keep. Defaults to 5.
            interval (int): Interval for time-based rotation (in days). Used if rotation_type='time'. Defaults to 1 day.
        """
        self.logger = logging.getLogger(name)

        # Avoid adding multiple handlers if logger already exists
        if not self.logger.hasHandlers():
            self.logger.setLevel(log_level)
            self.logger.propagate = False  # Prevent duplicate logging

            # Define log format
            log_format = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )

            # Console handler
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(log_format)
            self.logger.addHandler(console_handler)

            # File handler with rotation (if log_file is provided)
            if log_file:
                os.makedirs(os.path.dirname(log_file), exist_ok=True)  # Ensure the directory exists
                if rotation_type == "size":
                    file_handler = RotatingFileHandler(
                        log_file, maxBytes=max_bytes, backupCount=backup_count
                    )
                elif rotation_type == "time":
                    file_handler = TimedRotatingFileHandler(
                        log_file, when="midnight", interval=interval, backupCount=backup_count
                    )
                else:
                    raise ValueError("Invalid rotation_type. Choose 'size' or 'time'.")

                file_handler.setFormatter(log_format)
                self.logger.addHandler(file_handler)

    def get_logger(self):
        """
        Returns the configured logger instance.
        """
        return self.logger


# Example usage
if __name__ == "__main__":
    # Initialize the custom logger with size-based rotation
    logger = CustomLogger(
        name="AdvancedAppLogger",
        log_file="./Logs/advanced_app.log",
        log_level=logging.DEBUG,
        rotation_type="size",  # Change to "time" for daily rotation
        max_bytes=2 * 1024 * 1024,  # 2 MB max file size
        backup_count=3  # Keep 3 backup files
    ).get_logger()

    # Log messages with various levels
    logger.debug("This is a DEBUG message.")
    logger.info("This is an INFO message.")
    logger.warning("This is a WARNING message.")
    logger.error("This is an ERROR message.")
    logger.critical("This is a CRITICAL message.")
