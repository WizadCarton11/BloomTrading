import numpy as np
from custom_exceptions import ValidationError, CustomException, ValueError, raise_custom_exception
from typing import Union
from custom_logger import CustomLogger
from typeguard import typechecked, CollectionCheckStrategy

class LossLayer:
    def __init__(self):
        pass

    @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def mean_squared_error(self, y_true: np.ndarray, y_pred: np.ndarray) -> np.float64:
        """
        Calculate the mean squared error.

        Args:
            y_true (np.ndarray): The true values.
            y_pred (np.ndarray): The predicted values.

        Returns:
            np.ndarray: The mean squared error.
        """
        try:
            return np.mean((y_true - y_pred) ** 2)
        except Exception as e:
            raise_custom_exception(CustomException, message=f"Error in mean_squared_error: {e}")

    @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def mean_absolute_error(self, y_true: np.ndarray, y_pred: np.ndarray) -> np.float64:
        """
        Calculate the mean absolute error.

        Args:
            y_true (np.ndarray): The true values.
            y_pred (np.ndarray): The predicted values.

        Returns:
            np.ndarray: The mean absolute error.
        """
        try:
            return np.mean(np.abs(y_true - y_pred))
        except Exception as e:
            raise_custom_exception(CustomException, message=f"Error in mean_absolute_error: {e}")

    @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def cross_entropy(self, y_true: np.ndarray, y_pred: np.ndarray) -> np.float64:
        """
        Calculate the cross entropy.

        Args:
            y_true (np.ndarray): The true values.
            y_pred (np.ndarray): The predicted values.

        Returns:
            np.ndarray: The cross entropy.
        """
        try:
            return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))
        except Exception as e:
            raise_custom_exception(CustomException, message=f"Error in cross_entropy: {e}")

    @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def mean_squared_logarithmic_error(self, y_true: np.ndarray, y_pred: np.ndarray) -> np.float64:
        """
        Calculate the mean squared logarithmic error.

        Args:
            y_true (np.ndarray): The true values.
            y_pred (np.ndarray): The predicted values.

        Returns:
            np.ndarray: The mean squared logarithmic error.
        """
        try:
            return np.mean((np.log1p(y_true) - np.log1p(y_pred)) ** 2)
        except Exception as e:
            raise_custom_exception(CustomException, message=f"Error in mean_squared_logarithmic_error: {e}")