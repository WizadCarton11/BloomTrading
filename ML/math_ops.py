import numpy as np
from custom_exceptions import ValidationError, CustomException
from custom_logger import CustomLogger
from type_enforce import enforce_types
# from typeguard import typechecked, CollectionCheckStrategy
# Initialize logger
logger = CustomLogger(name="MathOpsLogger", log_file="./Logs/math_ops.log").get_logger()

class MathOps:
    """
    Class for mathematical operations
    """
    def __init__(self):
        pass
    
    @staticmethod
    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def dot_product(matrix_1: np.float64, matrix_2: np.float64) -> np.float64:
        """
        Calculate the dot product of two matrices.

        Args:
            matrix_1 (np.float64): The first matrix
            matrix_2 (np.float64): The second matrix

        Returns:
            np.float64: The dot product of the two matrices
        """
        try:
            if not isinstance(matrix_1, np.float64) or not isinstance(matrix_2, np.float64):
                raise ValidationError("Both inputs must be NumPy arrays.")

            
            result = np.dot(matrix_1, matrix_2)
            # logger.info(f"Dot product computed successfully for shapes {matrix_1.shape} and {matrix_2.shape}")
            return result

        except ValidationError as ve:
            logger.error(f"Validation Error in dot_product: {ve}")
            raise ve

        except Exception as e:
            logger.critical(f"Unexpected error in dot_product: {e}")
            raise CustomException("An unexpected error occurred in dot_product.", context={"error": str(e)})

    @staticmethod
    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def scalar_multiplication(matrix_1: np.float64) -> np.float64:
        try:
            for i in range(0, matrix_1.shape[0]):
                new_value=1                
                for j in range(0, matrix_1.shape[1]):
                    new_value= new_value * matrix_1[i][j]
                matrix_1[i][j]=new_value
        except Exception as e:
            logger.critical(f"Unexpected error in scalar_multiplication: {e}")
            raise CustomException("An unexpected error occurred in scalar_multiplication.", context={"error": str(e)})  

