import numpy as np
from custom_exceptions import ValidationError, CustomException, ValueError, raise_custom_exception
from typing import Union
from custom_logger import CustomLogger
from typeguard import typechecked, CollectionCheckStrategy
import math
class LossLayer:
    def __init__(self,type_of_loss: str="mse"):
        """
        Initialize the loss layer.

        Args:
            type_of_loss (str, optional): The type of loss function to use. Defaults to "mse".
        """
        self._output=None
        self._derivative_output=None
        self._type_of_loss=type_of_loss

    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def forward(self, y_true: np.float64, y_pred: np.float64):
        """
        Compute the loss between the true and predicted values based on the specified loss function.

        Args:
            y_true (np.float64): The true target values.
            y_pred (np.float64): The predicted target values.

        Returns:
            np.float64: The computed loss.

        Raises:
            ValidationError: If an invalid loss function type is specified.
            CustomException: If an error occurs during loss computation.
        """

        try:
            if self._type_of_loss=="mse":
                self._output=self.mean_squared_error(y_true,y_pred)
                output_differnece=2*(y_true-y_pred)/len(y_true)
                self._derivative_output=output_differnece
            elif self._type_of_loss=="mae":
                self._output=self.mean_absolute_error(y_true,y_pred)
                output_difference = np.sign(y_pred - y_true) 
                self._derivative_output=output_difference
            elif self._type_of_loss=="cross_entropy":
                self._output=self.cross_entropy(y_true,y_pred)
            elif self._type_of_loss=="msle":
                self._output=self.mean_squared_logarithmic_error(y_true,y_pred)
                n=len(y_true)
                log_value= (1/n) * np.log(y_true+1)-np.log(y_pred+1)
                self._derivative_output=log_value
            else:
                raise_custom_exception(ValidationError, message="Invalid loss function")
            return self._output, self._derivative_output
        except Exception as e:
            raise_custom_exception(CustomException, message=f"Error in forward: {e}")

    def get_output(self):
        """
        Retrieve the computed loss output.

        Returns:
            np.float64: The computed loss output of the loss layer.
        """

        return self._output, self._derivative_output

    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def mean_squared_error(self, y_true: np.float64, y_pred: np.float64) -> float:
        """
        Calculate the mean squared error.

        Args:
            y_true (np.float64): The true values.
            y_pred (np.float64): The predicted values.

        Returns:
            np.float64: The mean squared error.
        """
        try:
            y_true = np.clip(y_true, -1e10, 1e10)  # Clip true values
            y_pred = np.clip(y_pred, -1e10, 1e10)  # Clip predicted values
            loss = np.mean((y_true - y_pred) ** 2)

            return loss
        except Exception as e:
            raise_custom_exception(CustomException, message=f"Error in mean_squared_error: {e}")

    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def mean_absolute_error(self, y_true: np.float64, y_pred: np.float64) -> np.float64:
        """
        Calculate the mean absolute error.

        Args:
            y_true (np.float64): The true values.
            y_pred (np.float64): The predicted values.

        Returns:
            np.float64: The mean absolute error.
        """
        try:
            return np.mean(np.abs(y_true - y_pred))
        except Exception as e:
            raise_custom_exception(CustomException, message=f"Error in mean_absolute_error: {e}")

    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def cross_entropy(self, y_true: np.float64, y_pred: np.float64) -> np.float64:
        """
        Calculate the cross entropy.

        Args:
            y_true (np.float64): The true values.
            y_pred (np.float64): The predicted values.

        Returns:
            np.float64: The cross entropy.
        """
        try:
            return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))
        except Exception as e:
            raise_custom_exception(CustomException, message=f"Error in cross_entropy: {e}")

    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def mean_squared_logarithmic_error(self, y_true: np.float64, y_pred: np.float64) -> np.float64:
        """
        Calculate the mean squared logarithmic error.

        Args:
            y_true (np.float64): The true values.
            y_pred (np.float64): The predicted values.

        Returns:
            np.float64: The mean squared logarithmic error.
        """
        try:
            return np.mean((np.log1p(y_true) - np.log1p(y_pred)) ** 2)
        except Exception as e:
            raise_custom_exception(CustomException, message=f"Error in mean_squared_logarithmic_error: {e}")