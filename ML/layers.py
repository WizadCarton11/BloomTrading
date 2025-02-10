import time
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
                  activation_function: str = "relu", alpha: float = 0.01, n: int=1, mean:float=0.0, std:float=1.0
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
        self._activation_function_type: str = activation_function
        self._activation_class: ActivationClass = ActivationClass()
        self._alpha: float = alpha
        self._number_of_neurons=number_of_neurons
        self._weights: np.float64 = None
        self._bias: np.float64 = None
        self._output: np.float64 = None
        self._input: np.float64 = None
        self._del_w: np.float64 = None
        self._del_activation_function: np.float64 = None
        self._math_ops: MathOps = MathOps()
        self.assign_weights(input_shape, number_of_neurons=number_of_neurons, n=n, mean=mean, std=std)

    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def assign_weights(self, input_shape: int, number_of_neurons: int, random_seed: Union[int, None] = 42, 
                       n :int=1, mean:float=0.0, std:float=1.0) -> None:
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
            
            np.random.seed(int(time.time()))
    #         if n==1:
    #             self._weights=np.array([[ 0.49671415, -0.1382643 ,  0.64768854,  1.52302986],
    #    [-0.23415337, -0.23413696,  1.57921282,  0.76743473]])
    #             self._bias=np.array([-1.42474819, -0.54438272,  0.11092259, -1.15099358])
    #         elif n==2:
    #             self._weights=np.array([[-0.46947439,  0.54256004, -0.46341769],
    #    [-0.46572975,  0.24196227, -1.91328024],
    #    [-1.72491783, -0.56228753, -1.01283112],
    #    [ 0.31424733, -0.90802408, -1.4123037 ]])
    #             self._bias=np.array([ 0.37569802, -0.60063869, -0.29169375])
    #         elif n==3:
    #             self._weights= np.array([[ 1.46564877],
    #    [-0.2257763 ],
    #    [ 0.0675282 ]])
    #             self._bias=np.array([-0.60170661])
            
            self._weights = np.random.randn(input_shape, number_of_neurons)
            # self._weights=np.array([0.5])
            self._bias = np.random.randn(1,number_of_neurons) 
            # self._bias=0
        
        except CustomException as cs:
            self.logger.error(f"A custom error occurred at Layer->assign_weights: {cs}")
            raise cs

        except Exception as e:  
            self.logger.error(f"An error occurred at Layer->assign_weights: {e}")
            raise e

    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def forward(self, inputs: np.float64) -> np.float64:
        """
        Computes the output of the layer given the inputs.

        Args:
            inputs (np.float64): The input to the layer.

        Returns:
            np.float64: The output of the layer.

        Raises:
            CustomException: If the activation function is not supported.
            Exception: If any unexpected error occurs.
        """
        try:
            self._input = inputs
            dt_product = np.dot(self._input, self._weights) + (self._bias)
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
            elif self._activation_function_type == "linear":
                self._output=dt_product
            else:
                raise CustomException(f"Activation function {self._activation_function_type} is not supported.")
            return self._output
        except CustomException as ce:
            self.logger.error(f"A custom error occurred at Layer->forward: {ce}")
            raise ce
        except Exception as e:
            self.logger.error(f"An error occurred at Layer->forward: {e}")
            raise e

    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def update_weights_and_biases(self, learning_rate: float, del_values: np.float64) -> np.float64:
        """
        Updates the weights and biases of the layer given the error gradient and learning rate.

        Args:
            learning_rate (float): The learning rate to use for gradient descent.
            del_values (np.float64): The error gradient to use for gradient descent.

        Returns:
            np.float64: The updated weights.

        Raises:
            CustomException: If the shape of the error gradient does not match the shape of the weights.
            Exception: If any unexpected error occurs.
        """

        try:
            rated_del = learning_rate * del_values  # Scale the gradient
            
            rated_del=rated_del.reshape(1,-1) if rated_del.ndim==1 else rated_del
            self._input=self._input.reshape(1,-1) if self._input.ndim==1 else self._input
            self._weights=self._weights.reshape(-1,1) if self._weights.ndim==1 else self._weights
            rows, cols= self._weights.shape
            del_w=np.zeros((rows,cols))
            averaged_del_w=np.average(del_values, axis=0)
            # Corrected weight update formula
            # del_w = self._math_ops.dot_product(self._input.T, rated_del)  # (input_dim, num_neurons)
            for row in range(0, rows):
                for col in range(0, cols):
                    del_w[row][col]= np.mean(
                        self._input[:, row] * rated_del[:, col] 
                    )

            # Update weights
            self._del_w = averaged_del_w
            self._weights += del_w  # Gradient Descent update
            del_update_for_bias=np.mean(del_values, axis=0)
            self._bias += del_update_for_bias
            return self._del_w

        except CustomException as ce:
            self.logger.error(f"A custom error occurred at Layer->update_weights_and_biases: {ce}")
            raise ce
        except Exception as e:
            self.logger.error(f"An error occurred at Layer->update_weights_and_biases: {e}")
            raise e

    def get_del_activation_function(self)->np.float64:
        try:
            if self._activation_function_type=="sigmoid":
                self._del_activation_function=np.vectorize(
                    lambda x: x*(1-x)
                )(self._output)
            elif self._activation_function_type=="tanh":
                self._del_activation_function=np.vectorize(
                    lambda x: 1-x**2
                )(self._output)
            elif self._activation_function_type=="relu":
                self._del_activation_function=np.vectorize(
                    lambda x: 0 if x<=0 else 1
                )(self._output)
            elif self._activation_function_type=="leaky_relu":
                self._del_activation_function=np.vectorize(
                    lambda x: self._alpha if x<=0 else 1
                )(self._output)
            elif self._activation_function_type=="elu":
                self._del_activation_function=np.vectorize(
                    lambda x: self._alpha*np.exp(x) if x<=0 else 1
                )(self._output)
            elif self._activation_function_type=="linear":
                self._del_activation_function=np.vectorize(
                    lambda x: 1
                )(self._output)
            else:
                raise CustomException(f"Activation function {self._activation_function_type} is not supported.")
            return self._del_activation_function
        except CustomException as ce:
            self.logger.error(f"A custom error occurred at Layer->get_del_activation_function: {ce}")
            raise ce

    def get_del_w_times_weight(self):
        try:
            # print("weights: ",self._weights)
            # print("del w: ",self._del_w)
            # print("multiply: ",self._weights * self._del_w)
            result=self._weights * self._del_w
            # print("shape: ",result.shape)11
            # print(np.sum(result, axis=0))
            return np.sum(
                result, axis=1
            )
        except Exception as e:
            self.logger.error(f"Excpetion at get_del_w_times_weights: {e}")
    def get_activation_function(self)-> np.float64:
        return self._activation_function_type

    def get_output(self)->np.float64:
        """
        Retrieve the output of the layer.

        Returns:
            np.float64: The output of the layer.
        """
        return self._output

    def get_del_w(self)->np.float64:
        
        """
        Retrieve the gradient of the loss with respect to the weights of the layer.

        Returns:
            np.float64: The gradient of the loss with respect to the weights of the layer as a NumPy array.
        """
        return self._del_w
    
    def get_number_of_neurons(self) -> int:
        """
        Retrieve the number of neurons in the layer.

        Returns:
            int: The number of neurons in the layer.
        """
        return self._number_of_neurons
    
    def getWeights(self)->np.float64:
        """
        Retrieve the weights of the layer.

        Returns:
            np.float64: The weights of the layer as a NumPy array.
        """
        return self._weights
    
    def get_weights_shape(self):
        return self._weights.shape
    
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
