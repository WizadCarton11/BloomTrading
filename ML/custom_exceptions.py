import sys
import os
class CustomException(Exception):
    """
    Base class for custom exceptions.
    """
    def __init__(self, message=None, code=None, context=None):
        """
        Initialize the custom exception.

        Args:
            message (str): Custom error message.
            code (int): Optional error code.
            context (dict): Additional context or data about the error.
        """
        self.message = message or "An unexpected error occurred."
        self.code = code
        self.context = context
        super().__init__(self.message)

    def __str__(self):
        """
        String representation of the exception.
        """
        details = f"{self.message}"
        if self.code:
            details += f" (Error Code: {self.code})"
        if self.context:
            details += f" | Context: {self.context}"
        return details


class ValidationError(CustomException):
    """
    Exception for validation errors.
    """
    def __init__(self, message="Validation failed", code=400, context=None):
        super().__init__(message, code, context)


class DatabaseError(CustomException):
    """
    Exception for database-related errors.
    """
    def __init__(self, message="Database operation failed", code=500, context=None):
        super().__init__(message, code, context)


class NotFoundError(CustomException):
    """
    Exception for resource not found.
    """
    def __init__(self, resource="Resource", identifier=None, code=404):
        message = f"{resource} not found."
        context = {"identifier": identifier} if identifier else None
        super().__init__(message, code, context)


class PermissionDeniedError(CustomException):
    """
    Exception for permission-related errors.
    """
    def __init__(self, message="Permission denied", code=403, context=None):
        super().__init__(message, code, context)

class ScraperError(CustomException):
    """
    Exception for scraping-related errors.
    """
    def __init__(self, message="Scraping failed", code=500, context=None):
        super().__init__(message, code, context)

class ValueError(CustomException):
    """
    Exception for value-related errors.
    """
    def __init__(self, message="Value error", code=400, context=None):
        super().__init__(message, code, context)

class ParameterError(CustomException):
    """
    Exception for parameter-related errors.
    """
    def __init__(self, message="Parameter error", code=400, context=None):
        super().__init__(message, code, context)
# Utility function for raising exceptions dynamically
def raise_custom_exception(exception_type, **kwargs):
    """
    Dynamically raises a custom exception.

    Args:
        exception_type (type): The custom exception class to raise.
        kwargs: Arguments to pass to the exception.

    Raises:
        CustomException: The dynamically raised custom exception.
    """
    if not issubclass(exception_type, CustomException):
        raise TypeError("Provided exception type must inherit from CustomException.")
    raise exception_type(**kwargs)

__all__ = [
    "CustomException",
    "ValidationError",
    "NotFoundError",
    "DatabaseError",
    "raise_custom_exception",
    "ScraperError"
]

# # Example usage
