import pytest
import numpy as np
from math_ops import MathOps
from custom_exceptions import ValidationError, CustomException

def test_dot_product_valid():
    """Test dot product for valid inputs."""
    matrix_1 = np.array([[1, 2], [3, 4]])
    matrix_2 = np.array([[5, 6], [7, 8]])
    
    expected_result = np.dot(matrix_1, matrix_2)
    result = MathOps.dot_product(matrix_1, matrix_2)

    assert np.array_equal(result, expected_result), "Dot product computation is incorrect."


def test_dot_product_invalid_type():
    """Test if ValidationError is raised for non-numpy inputs."""
    with pytest.raises(ValidationError, match="Both inputs must be NumPy arrays."):
        MathOps.dot_product([[1, 2]], np.array([[3, 4]]))  # First input is not a NumPy array


def test_dot_product_invalid_shape():
    """Test if ValidationError is raised for incompatible matrix dimensions."""
    matrix_1 = np.array([[1, 2, 3]])
    matrix_2 = np.array([[4, 5], [6, 7]])  # Incompatible shape
    
    with pytest.raises(ValidationError, match="Incompatible dimensions for dot product"):
        MathOps.dot_product(matrix_1, matrix_2)




if __name__ == "__main__":
    pytest.main()
