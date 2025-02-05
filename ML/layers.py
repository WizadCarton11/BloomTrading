import numpy as np
import logging
from custom_exceptions import ValidationError, CustomException, ValueError
from typing import Union
from custom_logger import CustomLogger
from type_enforce import *
from typeguard import typechecked, CollectionCheckStrategy
from math_ops import MathOps
from activation_functions import ActivationClass
class Layer:
    def __init__(self, activation_function: str = "relu", alpha: float = 0.01):
        """
        Initializes the layer.

        Initializes the logger, and sets the weights, bias, output, and input to None.

        """
        self.logger = CustomLogger(name="LayerLogger", 
                                   log_file="./Logs/layers.log").get_logger()
        if activation_function not in ["relu"]:
            raise CustomException(f"Activation function {activation_function} is not supported.")
        self._activation_function_type=activation_function
        self._activation_class= ActivationClass()
        self._alpha=alpha
        self._weights = None
        self._bias = None
        self._output = None
        self._input = None
        self._math_ops = MathOps()

    @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def assign_weights(self, input_shape: int, number_of_neurons: int, random_seed: Union[int, None] = 42) -> None:
        """
        Assign weights to the layer.

        Assigns a random weight matrix of shape (input_shape, number_of_neurons)
        to the layer. If input_shape is None, raises a ValueError.

        Args:
            input_shape (int): The input shape of the layer.
            number_of_neurons (int): The number of neurons in the layer.
            random_seed (Union[int, None], optional): The random seed to use. Defaults to 42.

        Raises:
            ValueError: If input_shape is None.
        """

        try:
            if input_shape is None:
                raise ValueError("Input shape is None. Please provide a valid input shape.")
            
            np.random.seed(random_seed)
            self._weights = np.random.randn(input_shape, number_of_neurons)
            self._bias = np.zeros(number_of_neurons)
        
        except CustomException as cs:
            self.logger.error(f"A custom error occurred at Layer->assign_weights: {cs}")
            raise cs

        except Exception as e:  
            self.logger.error(f"An error occurred at Layer->assign_weights: {e}")
            raise e

    @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def forward(self, inputs: np.ndarray) -> np.ndarray:
        """
        Computes the output of the layer given the inputs.

        Args:
            inputs (np.ndarray): The input to the layer.

        Returns:
            np.ndarray: The output of the layer.

        Raises:
            CustomException: If the activation function is not supported.
            Exception: If any unexpected error occurs.
        """
        try:
            self._input = inputs
            dt_product = self._math_ops.dot_product(self._input, self._weights) + (self._bias)
            if self._activation_function_type == "relu":
                self._output = self._activation_class.relu_activation_function(dt_product)
            if self._activation_function_type == "softmax":
                self._output = self._activation_class.soft_max_activation_function(dt_product)
            if self._activation_function_type == "sigmoid":
                self._output = self._activation_class.sigmoid_activation_function(dt_product)
            if self._activation_function_type == "tanh":
                self._output = self._activation_class.tanh_activation_function(dt_product)
            if self._activation_function_type == "leaky_relu":
                self._output = self._activation_class.leaky_relu_activation_function(dt_product, alpha=(self._alpha if self._alpha is not None else 0.01))
            if self._activation_function_type == "elu":
                self._output = self._activation_class.elu_activation_function(dt_product, alpha=(self._alpha if self._alpha is not None else 1.0))
            else:
                raise CustomException(f"Activation function {self._activation_function_type} is not supported.")
            return self._output
        except CustomException as ce:
            self.logger.error(f"A custom error occurred at Layer->forward: {ce}")
            raise ce
        except Exception as e:
            self.logger.error(f"An error occurred at Layer->forward: {e}")
            raise e

    def getWeights(self)->np.ndarray:
        """
        Retrieve the weights of the layer.

        Returns:
            np.ndarray: The weights of the layer as a NumPy array.
        """
        return self._weights
if __name__ == "__main__":
    layer = Layer()
    try:
        # This will raise a ParameterError since input_shape is a tuple, not an integer
        layer.assign_weights(input_shape=4, number_of_neurons=12)
        input=np.array([[1,2,3,4]])
        print(layer.getWeights())
        output=layer.forward(input)
        print(output)
    except CustomException as ce:
        print(f"Caught exception: {ce}")