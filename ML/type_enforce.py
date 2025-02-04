from functools import wraps
from typing import get_type_hints
from custom_exceptions import ParameterError

def enforce_types(func):
    # Get the type hints for the function
    type_hints = get_type_hints(func)

    @wraps(func)
    def wrapper(*args, **kwargs):
        # If the function is a static method, no 'self' argument should be checked
        start_idx = 0
        if not isinstance(func, staticmethod):
            start_idx = 0  # Skip the 'self' argument for instance methods

        # Check the arguments passed (excluding 'self' for instance methods)
        for i, (arg, (param, expected_type)) in enumerate(zip(args[start_idx:], list(type_hints.items())[start_idx:])):
            # Allow argument to be either of expected_type or None
            print("func")
            print(type(arg))
            print(arg)
            print(expected_type)
            print(param)
            if isinstance(expected_type, tuple) and len(expected_type) == 2 and None in expected_type:
                expected_type = tuple(t for t in expected_type if t is not None)
                if not isinstance(arg, expected_type) and arg is not None:
                    
                    raise ParameterError(f"Argument '{param}' at position {i + start_idx} is expected to be one of {expected_type} or None, but got {type(arg)}")
            elif not isinstance(arg, expected_type):
                raise ParameterError(f"Argument '{param}' at position {i + start_idx} is expected to be of type {expected_type}, but got {type(arg)}")

        # Now call the original function
        return func(*args, **kwargs)

    return wrapper
