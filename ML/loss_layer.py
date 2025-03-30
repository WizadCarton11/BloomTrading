import numpy as np
from custom_exceptions import ValidationError, ValueError, CustomException, raise_custom_exception
from typing import Union
import math
# from typeguard import typechecked, CollectionCheckStrategy
from custom_logger import CustomLogger
class LossLayer:
    def __init__(self, loss_type: str):
        """
        Initializes the LossLayer.

        Attributes:
            _output (np.float64): Output of the layer.
            _type_of_loss (str): Type of loss function to use.
            _logger (CustomLogger): Logger for the layer.
        """
        self._output: np.float64 =None
        self._type_of_loss: str= loss_type
        self._logger = CustomLogger(name="LossLayerLogger", log_file="./Logs/loss_layer.log").get_logger()
    
    def forward(self, y_true: np.float64, y_pred: np.float64):
        """
        Perform a forward pass through the loss layer.

        Args:
            y_true (np.float64): The true values.
            y_pred (np.float64): The predicted values.

        Returns:
            np.float64: The loss of the model.
        """
        try:
            if self._type_of_loss=="mse":
                self._output=self.mean_squared_error(y_true=y_true, y_pred=y_pred)
            elif self._type_of_loss=="mae":
                self._output=self.mean_absolute_error(y_true=y_true, y_pred=y_pred)
            elif self._type_of_loss=="msle":
                self._output=self.mean_squared_logarithmic_error(y_true=y_true, y_pred=y_pred)
            else: 
                raise_custom_exception(ValidationError, message="Invalid loss type")
            return self._output
        except CustomException as cs:
            self._logger.error(f"There was an error in the forward functio of loss layer: {cs}")
            return cs
        except Exception as e:
            self._logger.critical(f"There was a critical error in the forward functio of loss layer: {e}")
            return e
    
    def derivative_loss(self, y_true: np.float64, y_pred: np.float64):
        try:
            if self._type_of_loss=="mse":
                return 2*(y_pred-y_true)/y_true.size
            elif self._type_of_loss=="mae":
                return np.sign(y_pred-y_true)/y_true.size
            elif self._type_of_loss=="msle":
                return np.tanh(y_pred-y_true)/y_true.size
            else:
                raise_custom_exception(ValidationError, message="Invalid loss type")
        except CustomException as cs:
            self._logger.error(f"There was an error in the derivative_loss functio of loss layer: {cs}")
            return cs
        except Exception as e:
            self._logger.critical(f"There was a critical error in the derivative_loss functio of loss layer: {e}")
            return e
        
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