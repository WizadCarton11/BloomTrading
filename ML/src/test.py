import sys
import os
from src.custom_exceptions import CustomException, DatabaseError, NotFoundError, ValidationError, raise_custom_exception

    

try:
    # Simulate a resource not found error
    raise NotFoundError(resource="User", identifier=123)
except CustomException as e:
    print(f"Caught Exception: {e}")

try:
    # Dynamically raise a database error
    raise_custom_exception(DatabaseError, message="Database connection lost", context={"db": "PostgreSQL"})
except CustomException as e:
    print(f"Caught Exception: {e}")
