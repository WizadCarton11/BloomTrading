import numpy as np
import logging
from custom_exceptions import ValidationError, CustomException, ValueError
from typing import Union
from custom_logger import CustomLogger
from type_enforce import *
from typeguard import typechecked, CollectionCheckStrategy
class Layer:
    def __init__(self):
        """
        Initializes the layer.

        Initializes the logger, and sets the weights, bias, output, and input to None.

        """
        self.logger = CustomLogger(name="LayerLogger", 
                                   log_file="./Logs/layers.log").get_logger()
        self._weights = None
        self._bias = None
        self._output = None
        self._input = None

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
            self._weights = np.random.rand(input_shape, number_of_neurons)
        
        except CustomException as cs:
            self.logger.error(f"A custom error occurred at Layer->assign_weights: {cs}")
            raise cs
    
    def getWeights(self)->np.ndarray:
        """
        Retrieve the weights of the layer.

        Returns:
            np.ndarray: The weights of the layer as a NumPy array.
        """
        return self._weights.shape
if __name__ == "__main__":
    layer = Layer()
    try:
        # This will raise a ParameterError since input_shape is a tuple, not an integer
        layer.assign_weights(input_shape=4)
    except CustomException as ce:
        print(f"Caught exception: {ce}")