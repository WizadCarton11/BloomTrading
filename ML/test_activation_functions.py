import pytest
import numpy as np
from activation_functions import ActivationClass
from typeguard import TypeCheckError
def test_relu_activation_valid():
    """Test ReLU activation function with valid input."""
    activation = ActivationClass()
    input_array = np.array([[-1, 2, -3, 4, 0]])
    expected_output = np.array([[0, 2, 0, 4, 0]])
    result = activation.relu_activation_function(input_array)
    assert np.array_equal(result, expected_output), "ReLU activation function output is incorrect."

def test_relu_activation_empty():
    """Test ReLU activation function with an empty array."""
    activation = ActivationClass()
    input_array = np.array([])
    result = activation.relu_activation_function(input_array)
    assert np.array_equal(result, np.array([])), "ReLU should return an empty array for empty input."

def test_relu_activation_large_values():
    """Test ReLU activation function with large values."""
    activation = ActivationClass()
    input_array = np.array([-1000, 0, 1000])
    expected_output = np.array([0, 0, 1000])
    result = activation.relu_activation_function(input_array)
    assert np.array_equal(result, expected_output), "ReLU activation function failed for large values."

def test_relu_activation_exception_handling():
    """Test ReLU activation function handles invalid input."""
    activation = ActivationClass()
    with pytest.raises(TypeCheckError, match=r'argument "x" \(str\) is not an instance of numpy.ndarray'):
        activation.relu_activation_function("invalid_input")

def test_sigmoid_activation_valid():
    """Test Sigmoid activation function with valid input."""
    activation = ActivationClass()
    input_array = np.array([-1, 0, 1])
    expected_output = 1 / (1 + np.exp(-input_array))
    result = activation.sigmoid_activation_function(input_array)
    assert np.allclose(result, expected_output, atol=1e-6), "Sigmoid activation function output is incorrect."

def test_sigmoid_activation_empty():
    """Test Sigmoid activation function with an empty array."""
    activation = ActivationClass()
    input_array = np.array([])
    result = activation.sigmoid_activation_function(input_array)
    assert np.array_equal(result, np.array([])), "Sigmoid should return an empty array for empty input."

def test_sigmoid_activation_large_values():
    """Test Sigmoid activation function with large values to check stability."""
    activation = ActivationClass()
    input_array = np.array([-1000, 1000])  # Extremely large values
    expected_output = np.array([0.0, 1.0])  # Sigmoid should approximate these values
    result = activation.sigmoid_activation_function(input_array)
    assert np.allclose(result, expected_output, atol=1e-6), "Sigmoid activation function failed for large values."

def test_sigmoid_activation_invalid_type():
    """Test Sigmoid activation function with invalid input type."""
    activation = ActivationClass()
    with pytest.raises(TypeCheckError, match=r'argument "x" \(str\) is not an instance of numpy.ndarray'):
        activation.sigmoid_activation_function("invalid_input")

def test_tanh_activation_valid():
    """Test Tanh activation function with valid input."""
    activation = ActivationClass()
    input_array = np.array([-1, 0, 1])
    expected_output = np.tanh(input_array)
    result = activation.tanh_activation_function(input_array)
    assert np.allclose(result, expected_output, atol=1e-6), "Tanh activation function output is incorrect."

def test_tanh_activation_empty():
    """Test Tanh activation function with an empty array."""
    activation = ActivationClass()
    input_array = np.array([])
    result = activation.tanh_activation_function(input_array)
    assert np.array_equal(result, np.array([])), "Tanh should return an empty array for empty input."

def test_tanh_activation_large_values():
    """Test Tanh activation function with large values."""
    activation = ActivationClass()
    input_array = np.array([-1000, 0, 1000])
    expected_output = np.array([-1.0, 0.0, 1.0])
    result = activation.tanh_activation_function(input_array)
    assert np.allclose(result, expected_output, atol=1e-6), "Tanh activation function failed for large values."

def test_tanh_activation_invalid_type():
    """Test Tanh activation function with invalid input type."""
    activation = ActivationClass()
    with pytest.raises(TypeCheckError, match=r'argument "x" \(str\) is not an instance of numpy.ndarray'):
        activation.tanh_activation_function("invalid_input")
    
def test_leaky_relu_activation_valid():
    """Test Leaky ReLU activation function with valid input."""
    activation = ActivationClass()
    input_array = np.array([[-1, 2, -3, 4, 0]])
    expected_output = np.array([[-0.01, 2, -0.03, 4, 0]])
    result = activation.leaky_relu_activation_function(input_array)
    assert np.array_equal(result, expected_output), "Leaky ReLU activation function output is incorrect."

def test_leaky_relu_activation_empty():
    """Test Leaky ReLU activation function with an empty array."""
    activation = ActivationClass()
    input_array = np.array([])
    result = activation.leaky_relu_activation_function(input_array)
    assert np.array_equal(result, np.array([])), "Leaky ReLU should return an empty array for empty input."

def test_leaky_relu_activation_large_values():
    """Test Leaky ReLU activation function with large values."""
    activation = ActivationClass()
    input_array = np.array([-1000, 0, 1000])
    expected_output = np.array([-10, 0, 1000])
    result = activation.leaky_relu_activation_function(input_array)
    assert np.array_equal(result, expected_output), "Leaky ReLU activation function failed for large values."

def test_elu_activation_valid():
    """Test ELU activation function with valid input."""
    activation = ActivationClass()
    input_array = np.array([[-1, 2, -3, 4, 0]])
    expected_output = np.array([[-0.63212056, 2, -0.95021293, 4, 0]])
    result = activation.elu_activation_function(input_array)
    assert np.allclose(result, expected_output, atol=1e-6), "ELU activation function output is incorrect."

def test_elu_activation_empty():
    """Test ELU activation function with an empty array."""
    activation = ActivationClass()
    input_array = np.array([])
    result = activation.elu_activation_function(input_array)
    assert np.array_equal(result, np.array([])), "ELU should return an empty array for empty input."

def test_elu_activation_large_values():
    """Test ELU activation function with large values."""
    activation = ActivationClass()
    input_array = np.array([-1000, 0, 1000])
    expected_output = np.array([-0.9999546, 0, 1000])
    result = activation.elu_activation_function(input_array)
    assert np.allclose(result, expected_output, atol=1e-4), "ELU activation function failed for large values."

def test_elu_activation_invalid_type():
    """Test ELU activation function with invalid input type."""
    activation = ActivationClass()
    with pytest.raises(TypeCheckError, match=r'argument "x" \(str\) is not an instance of numpy.ndarray'):
        activation.elu_activation_function("invalid_input")



if __name__ == "__main__":
    pytest.main()
