import pytest
import numpy as np
from layers import Layer
from custom_exceptions import ValidationError, ValueError
# from typeguard import TypeCheckError
from custom_exceptions import CustomException
def test_assign_weights_valid():
    """Test assigning weights with valid input."""
    layer = Layer(activation_function="relu")
    layer.assign_weights(input_shape=3, number_of_neurons=5)
    assert layer.getWeights().shape == (3, 5), "Weight assignment is incorrect."

def test_assign_weights_invalid_input_shape_none():
    """Test if ValueError is raised when input_shape is None."""
    layer = Layer()
    with pytest.raises(TypeCheckError, match=r'argument "input_shape" \(None\) is not an instance of int'):
        layer.assign_weights(input_shape=None, number_of_neurons=5)

def test_assign_weights_invalid_input_shape_type():
    """Test if ValidationError is raised for non-integer input_shape."""
    layer = Layer()
    with pytest.raises(TypeCheckError, match=r'argument "input_shape" \(str\) is not an instance of int'):
        layer.assign_weights(input_shape="invalid", number_of_neurons=5)

def test_random_seed_consistency():
    """Test if weight initialization is consistent with the same random seed."""
    layer_1 = Layer()
    layer_1.assign_weights(input_shape=4, number_of_neurons=3, random_seed=42)
    weights_1 = layer_1.getWeights().shape

    layer_2 = Layer()
    layer_2.assign_weights(input_shape=4, number_of_neurons=3, random_seed=42)
    weights_2 = layer_2.getWeights().shape

    assert np.array_equal(weights_1, weights_2), "Weights should be identical for the same random seed."

def test_forward_valid():
    """Test forward pass with valid inputs."""
    layer = Layer()
    layer.assign_weights(input_shape=3, number_of_neurons=2)
    inputs = np.array([[0.5, 0.2, 0.1]])
    output = layer.forward(inputs)
    assert output.shape == (1, 2), "Forward pass output shape is incorrect."

def test_forward_invalid_input_type():
    """Test if TypeCheckError is raised for invalid input type."""
    layer = Layer()
    with pytest.raises(TypeCheckError):
        layer.forward("invalid_input")

def test_forward_exception_handling():
    """Test if exceptions in forward pass are logged and raised."""
    layer = Layer()
    with pytest.raises(Exception):
        layer.forward(np.array([[1, 2, 3]]))

def test_activation_function_exception_handling():
    """Test if exceptions in activation function are logged and raised."""
    with pytest.raises(CustomException, match="Activation function misc is not supported."):
        layer = Layer(activation_function="misc")
        # layer.assign_weights(input_shape=3, number_of_neurons=2)
        # inputs = np.array([[0.5, 0.2, 0.1]])
        # layer.forward(inputs=inputs, activation_function="misc")

if __name__ == "__main__":
    pytest.main()