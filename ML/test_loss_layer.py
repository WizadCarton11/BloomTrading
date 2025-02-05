import pytest
import numpy as np
from loss_layer import LossLayer
from custom_exceptions import CustomException
from typeguard import TypeCheckError

def test_mean_squared_error_valid():
    loss = LossLayer()
    y_true = np.array([1.0, 2.0, 3.0])
    y_pred = np.array([1.5, 2.5, 3.5])
    expected_output = np.mean((y_true - y_pred) ** 2)
    assert np.isclose(loss.mean_squared_error(y_true, y_pred), expected_output, atol=1e-6)


def test_mean_absolute_error_valid():
    loss = LossLayer()
    y_true = np.array([1.0, 2.0, 3.0])
    y_pred = np.array([1.5, 2.5, 3.5])
    expected_output = np.mean(np.abs(y_true - y_pred))
    assert np.isclose(loss.mean_absolute_error(y_true, y_pred), expected_output, atol=1e-6)

def test_cross_entropy_valid():
    loss = LossLayer()
    y_true = np.array([1, 0, 1])
    y_pred = np.array([0.9, 0.1, 0.8])
    expected_output = -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))
    assert np.isclose(loss.cross_entropy(y_true, y_pred), expected_output, atol=1e-6)

def test_cross_entropy_invalid_values():
    loss = LossLayer()
    y_true = np.array([1, 0, 1])
    y_pred = np.array([1.2, -0.1, 0.8])  # Invalid probability values
    assert np.isnan(loss.cross_entropy(y_true, y_pred)), "Cross entropy should return NaN for invalid probabilities."

def test_mean_squared_logarithmic_error_valid():
    loss = LossLayer()
    y_true = np.array([1.0, 2.0, 3.0])
    y_pred = np.array([1.5, 2.5, 3.5])
    expected_output = np.mean((np.log1p(y_true) - np.log1p(y_pred)) ** 2)
    assert np.isclose(loss.mean_squared_logarithmic_error(y_true, y_pred), expected_output, atol=1e-6)

if __name__ == "__main__":
    pytest.main()
