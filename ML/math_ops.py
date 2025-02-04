import numpy as np
from custom_exceptions import ValidationError, CustomException
from custom_logger import CustomLogger
from type_enforce import enforce_types
from typeguard import typechecked, CollectionCheckStrategy
# Initialize logger
logger = CustomLogger(name="MathOpsLogger", log_file="./Logs/math_ops.log").get_logger()

class MathOps:
    """
    Class for mathematical operations
    """
    def __init__(self):
        pass
    
    @staticmethod
    @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def dot_product(matrix_1: np.ndarray, matrix_2: np.ndarray) -> np.ndarray:
        """
        Calculate the dot product of two matrices.

        Args:
            matrix_1 (np.ndarray): The first matrix
            matrix_2 (np.ndarray): The second matrix

        Returns:
            np.ndarray: The dot product of the two matrices
        """
        try:
            if not isinstance(matrix_1, np.ndarray) or not isinstance(matrix_2, np.ndarray):
                raise ValidationError("Both inputs must be NumPy arrays.")

            if matrix_1.shape[1] != matrix_2.shape[0]:
                raise ValidationError(f"Incompatible dimensions for dot product: {matrix_1.shape} and {matrix_2.shape}")

            result = np.dot(matrix_1, matrix_2)
            logger.info(f"Dot product computed successfully for shapes {matrix_1.shape} and {matrix_2.shape}")
            return result

        except ValidationError as ve:
            logger.error(f"Validation Error in dot_product: {ve}")
            raise ve

        except Exception as e:
            logger.critical(f"Unexpected error in dot_product: {e}")
            raise CustomException("An unexpected error occurred in dot_product.", context={"error": str(e)})

