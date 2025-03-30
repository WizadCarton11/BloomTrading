import math
import numpy as np
import random
# from typeguard import typechecked, CollectionCheckStrategy
class ActivationClass:
    """
    Parent class for all activation functions.
    """

    def __init__(self, type_of_activation_function: str):
        """
        Initializes the activation function.
        """
        self._type_of_activation_function: str=type_of_activation_function
        self._output: np.float64 = None
    
    def forward(self, x:np.float64, alpha: float=0.1):
        """
        Performs the forward pass using the specified activation function.

        Args:
            x (np.float64): Input data for the activation function.
            alpha (float): Slope coefficient for some activation functions like leaky ReLU and ELU.

        Returns:
            np.float64: The result of applying the specified activation function to the input data.
        """

        try:
            if self._type_of_activation_function=="relu":
                self._output= self.relu_activation_function(x)
            elif self._type_of_activation_function=="soft_max":
                self._output= self.soft_max_activation_function(x)
            elif self._type_of_activation_function=="sigmoid":
                self._output= self.sigmoid_activation_function(x)
            elif self._type_of_activation_function=="tanh":
                self._output= self.tanh_activation_function(x)
            elif self._type_of_activation_function=="leaky_relu":
                self._output= self.leaky_relu_activation_function(x, alpha=alpha)
            elif self._type_of_activation_function=="elu":
                self._output= self.elu_activation_function(x, alpha)
            else:
                self._output= x
            return self._output
        except Exception as e:
            return e

    def derivative_of_activation(self, x:np.float64, alpha: float=0.1):
        """
        Computes the derivative of the specified activation function.

        Args:
            alpha (float): Slope coefficient for some activation functions like leaky ReLU and ELU.

        Returns:
            np.float64: The derivative of the specified activation function.
        """
        try:
            if self._type_of_activation_function=="sigmoid":
                return x * (1 - x)
            elif self._type_of_activation_function=="tanh":
                return 1 - x ** 2
            elif self._type_of_activation_function=="relu": 
                return np.where(x <= 0, 0, 1)
            elif self._type_of_activation_function=="leaky_relu":
                return np.where(x <= 0, alpha, 1)
            elif self._type_of_activation_function=="elu":
                return np.where(x <= 0, x + alpha, 1)
            else:
                return 1
        except Exception as e:
            return e

    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def relu_activation_function(self, x: np.float64) -> np.float64:
        """
        Computes the ReLU activation function.

        The ReLU activation function is a widely used activation function in deep learning.
        The function maps all negative values to 0 and all positive values to the same value.

        Args:
            x (np.float64): The input to the activation function.

        Returns:
            np.float64: The output of the activation function.
        """

        try:
            return np.maximum(0, x)
        except Exception as e:
            print(f"Error in ReLU activation function: {e}")
            return e
        
    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def soft_max_activation_function(self, x: np.float64) -> np.float64:
        """
        Computes the Softmax activation function.

        The Softmax function is used in machine learning to convert raw scores from a model 
        (often called logits) into probabilities. It is often used in the output layer of a 
        neural network to represent a probability distribution over multiple classes.

        Args:
            x (np.float64): The input array to the activation function, where each row 
                            represents a sample and each column represents a class score.

        Returns:
            np.float64: An array of the same shape as `x`, where each row is transformed 
                        to represent a probability distribution across classes.
        """

        try:
            exp_values = np.exp(x - np.max(x, axis=1, keepdims=True)) 
            # Normalize them for each sample 
            probabilities = exp_values / np.sum(exp_values, axis=1, keepdims=True) 
    
            return probabilities
        except Exception as e:
            print(f"Error in Softmax activation function: {e}")
            return e

    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def sigmoid_activation_function(self, x: np.float64) -> np.float64:
        """
        Computes the Sigmoid activation function.

        The Sigmoid activation function is a widely used activation function in deep learning.
        The function maps the input to a value between 0 and 1.

        Args:
            x (np.float64): The input to the activation function.

        Returns:
            np.float64: The output of the activation function.
        """
        try:
            return 1 / (1 + np.exp(-x))
        except Exception as e:
            print(f"Error in Sigmoid activation function: {e}")
            return e
    
    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def tanh_activation_function(self, x: np.float64) -> np.float64:
        """
        Computes the Tanh activation function.

        The Tanh activation function is a widely used activation function in deep learning.
        The function maps the input to a value between -1 and 1.

        Args:
            x (np.float64): The input to the activation function.

        Returns:
            np.float64: The output of the activation function.
        """

        try:
            return np.tanh(x)
        except Exception as e:
            print(f"Error in Tanh activation function: {e}")
            return e
        
    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def leaky_relu_activation_function(self, x: np.float64, alpha: float = 0.01) -> np.float64:
        """
        Computes the Leaky ReLU activation function.

        The Leaky ReLU activation function is an alternative to the ReLU activation function.
        While the ReLU activation function maps all negative values to 0, the Leaky ReLU activation function
        maps all negative values to a fraction of the input value, specified by the alpha parameter.
        This allows the model to retain some of the information from the negative values.

        Args:
            x (np.float64): The input to the activation function.
            alpha (float): The fraction of the input value to be used for negative values.

        Returns:
            np.float64: The output of the activation function.
        """
        try:
            return np.maximum(alpha * x, x)
        except Exception as e:
            print(f"Error in Leaky ReLU activation function: {e}")
            return e
    
    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def elu_activation_function(self, x: np.float64, alpha: float = 1.0) -> np.float64:
        """
        Computes the ELU activation function.

        The ELU activation function is an alternative to the ReLU activation function.
        While the ReLU activation function maps all negative values to 0, the ELU activation function
        maps all negative values to a fraction of the input value, specified by the alpha parameter.
        This allows the model to retain some of the information from the negative values.

        Args:
            x (np.float64): The input to the activation function.
            alpha (float): The fraction of the input value to be used for negative values.

        Returns:
            np.float64: The output of the activation function.
        """
        try:
            return np.where(x > 0, x, alpha * (np.exp(x) - 1))
        except Exception as e:
            print(f"Error in ELU activation function: {e}")
            return e
        