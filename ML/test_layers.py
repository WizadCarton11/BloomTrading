import pytest
import numpy as np
from layers import Layer
from custom_exceptions import ValidationError, ValueError
from typeguard import TypeCheckError

def test_assign_weights_valid():
    """Test assigning weights with valid input."""
    layer = Layer()
    layer.assign_weights(input_shape=3, number_of_neurons=5)
    assert layer.getWeights() == (3, 5), "Weight assignment is incorrect."

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
    weights_1 = layer_1.getWeights()

    layer_2 = Layer()
    layer_2.assign_weights(input_shape=4, number_of_neurons=3, random_seed=42)
    weights_2 = layer_2.getWeights()

    assert np.array_equal(weights_1, weights_2), "Weights should be identical for the same random seed."

if __name__ == "__main__":
    pytest.main()