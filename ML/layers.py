import numpy as np
import logging
from custom_exceptions import ValidationError, CustomException, ValueError
from typing import Union
from custom_logger import CustomLogger
from type_enforce import *
from typeguard import typechecked, CollectionCheckStrategy
from math_ops import MathOps
from activation_functions import ActivationClass

"""
Format of weights and biases:
Weights: 
    [
        [w11, w12, w13, w14],
        [w21, w22, w23, w24],
    ]
Biases:
    [
        [b1, b2, b3, b4]
    ]
"""


class Layer:
    def __init__(self, input_shape: int, number_of_neurons: int,
                  activation_function: str = "relu", alpha: float = 0.01
                  ) -> None:
        """
        Initializes the layer.

        Initializes the logger, and sets the weights, bias, output, and input to None.

        Args:
            input_shape (int): The shape of the layer's input.
            number_of_neurons (int): The number of neurons in the layer.
            activation_function (str, optional): The activation function to use. Defaults to "relu".
            alpha (float, optional): The alpha value to use for leaky ReLU. Defaults to 0.01.
        """
        if input_shape is None or number_of_neurons is None:
            raise ValueError("input_shape and number_of_neurons must not be None.")
        
        self.logger = CustomLogger(name="LayerLogger", 
                                   log_file="./Logs/layers.log").get_logger()
        if activation_function not in ["relu"]:
            raise CustomException(f"Activation function {activation_function} is not supported.")
        self._activation_function_type: str = activation_function
        self._activation_class: ActivationClass = ActivationClass()
        self._alpha: float = alpha
        self._weights: np.ndarray = None
        self._bias: np.ndarray = None
        self._output: np.ndarray = None
        self._input: np.ndarray = None
        self._del_w: np.ndarray = None
        self._math_ops: MathOps = MathOps()
        self.assign_weights(input_shape, number_of_neurons=number_of_neurons)

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
            self._bias = np.random.randn(1,number_of_neurons)
            
        
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
            elif self._activation_function_type == "softmax":
                self._output = self._activation_class.soft_max_activation_function(dt_product)
            elif self._activation_function_type == "sigmoid":
                self._output = self._activation_class.sigmoid_activation_function(dt_product)
            elif self._activation_function_type == "tanh":
                self._output = self._activation_class.tanh_activation_function(dt_product)
            elif self._activation_function_type == "leaky_relu":
                self._output = self._activation_class.leaky_relu_activation_function(dt_product, alpha=(self._alpha if self._alpha is not None else 0.01))
            elif self._activation_function_type == "elu":
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

    @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def update_weights_and_biases(self, learning_rate: float, del_values: np.ndarray):
        """
        Updates the weights and biases of the layer given the error gradient and learning rate.

        Args:
            learning_rate (float): The learning rate to use for gradient descent.
            del_values (np.ndarray): The error gradient to use for gradient descent.

        Returns:
            np.ndarray: The updated weights.

        Raises:
            CustomException: If the shape of the error gradient does not match the shape of the weights.
            Exception: If any unexpected error occurs.
        """

        try:
            rated_del = learning_rate * del_values  # Scale the gradient
            
            # Corrected weight update formula
            del_w = self._math_ops.dot_product(self._input.T, rated_del)  # (input_dim, num_neurons)

            # Correct shape check
            if del_w.shape != self._weights.shape:
                raise ValueError(f"Shape mismatch: del_w {del_w.shape} and weights {self._weights.shape}")

            # Update weights
            self._del_w = del_w
            self._weights += del_w  # Gradient Descent update

            return self._del_w

        except CustomException as ce:
            self.logger.error(f"A custom error occurred at Layer->update_weights_and_biases: {ce}")
            raise ce
        except Exception as e:
            self.logger.error(f"An error occurred at Layer->update_weights_and_biases: {e}")
            raise e


    def get_output(self)->np.ndarray:
        """
        Retrieve the output of the layer.

        Returns:
            np.ndarray: The output of the layer.
        """
        return self._output

    def get_del_w(self)->np.ndarray:
        
        """
        Retrieve the gradient of the loss with respect to the weights of the layer.

        Returns:
            np.ndarray: The gradient of the loss with respect to the weights of the layer as a NumPy array.
        """
        return self._del_w
    
    def getWeights(self)->np.ndarray:
        """
        Retrieve the weights of the layer.

        Returns:
            np.ndarray: The weights of the layer as a NumPy array.
        """
        return self._weights
if __name__ == "__main__":
    try:
        layer = Layer(input_shape=2, number_of_neurons=3, activation_function="relu")
        # Initialize weights
        

        # Forward pass test
        input_data = np.array([[1., 2.]])  # Example input
        output = layer.forward(input_data)
        print("Forward Output:", output)

        # Backward pass test (weight update)
        dummy_gradient = np.array([[0.1, 0.2, -0.1]])  # Example gradient from next layer
        learning_rate = 0.01
        updated_weights = layer.update_weights_and_biases(learning_rate, dummy_gradient)

        print("Updated Weights After Backward Pass:", layer.getWeights())

    except CustomException as ce:
        print(f"Caught exception: {ce}")
