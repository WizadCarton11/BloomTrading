import math
import numpy as np
import random
from typeguard import typechecked, CollectionCheckStrategy
class ActivationClass:
    """
    Parent class for all activation functions.
    """

    def __init__(self):
        """
        Initializes the activation function.
        """
        pass

    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def relu_activation_function(self, x: np.float64) -> np.float64:
        try:
            return np.maximum(0, x)
        except Exception as e:
            print(f"Error in ReLU activation function: {e}")
            return e
        
    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def soft_max_activation_function(self, x: np.float64) -> np.float64:
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
        try:
            return 1 / (1 + np.exp(-x))
        except Exception as e:
            print(f"Error in Sigmoid activation function: {e}")
            return e
    
    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def tanh_activation_function(self, x: np.float64) -> np.float64:
        try:
            return np.tanh(x)
        except Exception as e:
            print(f"Error in Tanh activation function: {e}")
            return e
        
    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def leaky_relu_activation_function(self, x: np.float64, alpha: float = 0.01) -> np.float64:
        try:
            return np.maximum(alpha * x, x)
        except Exception as e:
            print(f"Error in Leaky ReLU activation function: {e}")
            return e
    
    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def elu_activation_function(self, x: np.float64, alpha: float = 1.0) -> np.float64:
        try:
            return np.where(x > 0, x, alpha * (np.exp(x) - 1))
        except Exception as e:
            print(f"Error in ELU activation function: {e}")
            return e
        