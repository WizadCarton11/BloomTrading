import time
import numpy as np
from custom_exceptions import ValidationError, CustomException, ValueError, raise_custom_exception
from typing import Union
from custom_logger import CustomLogger
from type_enforce import *
from typeguard import typechecked, CollectionCheckStrategy
from math_ops import MathOps
from activation_functions import ActivationClass

class Layer:
    def __init__(self, input_size: int, number_of_neurons: int, activation_function_type: str, weights_init: str= "gaussian", alpha: float=0.01):
        
        self._input_size: int = input_size
        self._number_of_neurons: int = number_of_neurons
        self._activation_function_type: str = activation_function_type
        self._weights_init: str = weights_init
        self._alpha: float = alpha
        self._weights: np.ndarray = None
        self._biases: np.ndarray = None
        self._output: np.ndarray = None
        self._activation_output: np.ndarray = None
        self._input: np.ndarray = None
        self._derivative: np.ndarray = None
        self._activation_function = ActivationClass(type_of_activation_function=activation_function_type)
        self._logger = CustomLogger(name="LayerLogger", log_file="./Logs/layer.log").get_logger()
        self._math_ops = MathOps()  
        self._logger.info("Layer initialized successfully")
        self.initialize_weights()
    
    def initialize_weights(self):
        try: 
            if self._weights_init=="gaussian":
                self._weights = np.random.randn(self._input_size, self._number_of_neurons) * np.sqrt(2.0 / self._input_size)
            elif self._weights_init=="xavier":
                self._weights = np.random.randn(self._input_size, self._number_of_neurons) * np.sqrt(1.0 / self._input_size)
            elif self._weights_init=="he":
                self._weights = np.random.randn(self._input_size, self._number_of_neurons) * np.sqrt(2.0 / self._input_size)
            else:
                raise_custom_exception(ValidationError, message="Invalid weight initialization method")
            self._biases = np.zeros((1, self._number_of_neurons))
        except CustomException as cs:
            self._logger.error(f"Error in initializing weights: {cs}")
            return cs
        except Exception as e:
            self._logger.critical(f"Critical error in initializing weights: {e}")
            return e
        
    def forward(self, input_data: np.ndarray):
        try:
            self._input = input_data
            self._output = np.dot(input_data, self._weights) + self._biases
            self._activation_output = self._activation_function.forward(self._output)
            return self._activation_output
        except Exception as e:
            self._logger.error(f"Error in forward pass: {e}")
            return e

    def backward(self, d_output: np.ndarray, learning_rate: float):
        try:
            d_activation= self._activation_function.derivative_of_activation(x=self._output) * d_output
            d_weights= np.dot(self._input.T, d_activation)
            d_biases = np.sum(d_activation, axis=0, keepdims=True)
            d_inputs = np.dot(d_activation, self._weights.T)

            self._weights-= learning_rate* d_weights
            self._biases-=learning_rate*d_biases

            return d_inputs
        except CustomException as cs:
            self._logger.error(f"Error in backward pass: {cs}")
            return cs
        except Exception as e:
            self._logger.critical(f"Critical error in backward pass: {e}")
            return e
        
    def get_number_of_neurons(self):
        return self._number_of_neurons
    
    def get_weights_and_biases(self):
        return self._weights, self._biases
    
    def set_weights_and_biases(self, weights: np.ndarray, biases: np.ndarray):
        self._weights = weights
        self._biases = biases
    

        