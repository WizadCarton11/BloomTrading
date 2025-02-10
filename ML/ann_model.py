from layers import Layer
from activation_functions import ActivationClass
from loss_layer import LossLayer
from base_model import BaseModel
from custom_exceptions import ValidationError, CustomException, ValueError, raise_custom_exception
from typing import Union, List
from custom_logger import CustomLogger
from typeguard import typechecked, CollectionCheckStrategy
import numpy as np
import math
import random
from math_ops import MathOps
from metrics import SelfMetrics
import matplotlib.pyplot as plt

# To be erased ONLY FOR DEV TESTING
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

class AnnClass(BaseModel):

    def __init__(self, mean: float=0.0, std: float=1.0):
        super().__init__("Artificial Neural Network")
        self._logger= CustomLogger(name="AnnClassLogger", 
                                   log_file="./Logs/layers.log").get_logger()
        self._layers: List[Layer] = []
        self._loss_layer=None
        self._metric_layer: List[Layer] =[]
        self._math_ops=MathOps()
        self._learning_rate=None
        self._mean=mean
        self._std=std

    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def add_layer(self, number_of_neurons: int, input_shape: int=1,
                  activation_function: str = "relu", alpha: float =0.01, n:int=1) -> None:
        try:
            if len(self._layers)!=0:
                input_shape: int=self._layers[-1].get_number_of_neurons()
                
            new_layer: Layer= Layer(number_of_neurons=number_of_neurons,
                                    input_shape=input_shape,
                                    activation_function=activation_function,
                                    alpha=alpha, n=n, mean=self._mean, std=self._std)
            self._layers.append(new_layer)
        except CustomException as e:
            self._logger.error(f"Error in add_layer: {e}")
            raise_custom_exception(CustomException, message=f"Error in add_layer: {e}")
        except Exception as e:
            self._logger.critical(f"Crititcal Error in add_layer: {e}")
            raise_custom_exception(CustomException, message=f"Error in add_layer: {e}")

    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def compile_model(self, optimizer: str = "RMSprop", loss: str="mse", metrics: List[str]=["mae"]):
        try:
            loss_layer=LossLayer(type_of_loss=loss)
            self._loss_layer=loss_layer
            if len(metrics)==0:
                metric_layer=LossLayer(type_of_loss="mae")
                self._metric_layer.append(metric_layer)
            else:
                for metric_type in metrics:
                    if metric_type not in ["mse", "mae", "msle"]:
                        raise_custom_exception(CustomException, message=f"Metric type of {metric_type} does not exist")
                    metric_layer=LossLayer(type_of_loss=metric_type)
                    self._metric_layer.append(metric_layer)
        except CustomException as cs:
            self._logger.error(f"Error in compiling model: {cs}")
            return cs
        except Exception as e:
            self._logger.critical(f"Critical error in compiling mode: {e}")
            return e
    
    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def forward(self, input: np.float64):
        try:
            layer_input=input
            for single_layer in self._layers:
                layer_output=single_layer.forward(inputs=layer_input)
                layer_input=layer_output
            
            return layer_output
        except CustomException as cs:
            self._logger.error(f"Error in forward: {cs}")
            raise_custom_exception(CustomException, message=f"Error in forward: {cs}")
        except Exception as e:
            self._logger.critical(f"Critical error in forward: {e}")
            raise_custom_exception(CustomException, message=f"Error in forward: {e}")
    
    # @typechecked(collection_check_strategy=CollectionCheckStrategy.ALL_ITEMS)
    def fit(self, X_train: np.float64, y_train: np.float64, learning_rate: float, epochs: int = 100):
        try:
            self._learning_rate=learning_rate
            for epoch in range(epochs):
                # Forward pass
                # for i in range(0, len(X_train)):
                #     x_input=X_train[i]
                #     y_input=y_train[i]
                y_pred = self.forward(X_train)

                loss= self._loss_layer.forward(y_true=y_train, y_pred=y_pred)
                loss, loss_derivative= self._loss_layer.get_output()
                print(f"Epoch: {epoch} / {epochs}; loss: {loss}")
                if epoch%10==0:
                    pass
                
                for idx, single_layer in enumerate(reversed(self._layers)):
                    if idx==0:
                        del_activation_function=single_layer.get_del_activation_function()
                        loss_derivative_times_del_activation_function= loss_derivative * del_activation_function
                        _= single_layer.update_weights_and_biases(learning_rate=learning_rate,
                        del_values=loss_derivative_times_del_activation_function)
                    else:
                        del_activation_function=single_layer.get_del_activation_function()
                        previous_layer=self._layers[len(self._layers)-idx]
                        previous_layer_del_values=previous_layer.get_del_w_times_weight()
                        del_activation_function_times_previous_layer_del= del_activation_function * previous_layer_del_values
                        _= single_layer.update_weights_and_biases(learning_rate=learning_rate,
                        del_values=del_activation_function_times_previous_layer_del)

                        

                
                
        except CustomException as cs:
            self._logger.error(f"Error in fit: {cs}")
            raise_custom_exception(CustomException, message=f"Error in fit: {cs}")
        except Exception as e:
            self._logger.critical(f"Critical error in fit: {e}")
            raise_custom_exception(CustomException, message=f"Error in fit: {e}")

    
    # @typechecked
    def predict(self, X_test: np.float64) -> np.float64:
        try:
            return self.forward(X_test)  # Just perform a forward pass
        except CustomException as cs:
            self._logger.error(f"Error in predict: {cs}")
            raise_custom_exception(CustomException, message=f"Error in predict: {cs}")
        except Exception as e:
            self._logger.critical(f"Critical error in predict: {e}")
            raise_custom_exception(CustomException, message=f"Error in predict: {e}")

import matplotlib.pyplot as plt

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
def main1():
    # Create an instance of AnnClass
    model = AnnClass()
    

    # model.add_layer(number_of_neurons=4, input_shape=2, activation_function="relu")
    # model.add_layer(number_of_neurons=2, activation_function="relu")
    X, y = make_regression(n_samples=100, n_features=2, noise=0.1)
    y = np.expand_dims(y, axis=1)  # Reshape y to match expected input (100,1)

    # Split into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model.add_layer(number_of_neurons=16, input_shape=2, activation_function="relu", alpha=0.01)
    model.add_layer(number_of_neurons=32, activation_function="sigmoid", alpha=0.01)
    model.add_layer(number_of_neurons=1, activation_function="sigmoid", n=2)
    # Compile the model
    model.compile_model(loss="mse", metrics=["mae"])

   

    # Train the model
    model.fit(X_train=np.float64([[0.35, 0.9], [0.2, 0.6]]), y_train=np.float64([[0.5], [0.8]]), epochs=100,
               learning_rate=100)

    # # Make predictions
    # predictions = model.predict(X_test)

    # # Plot actual vs predicted values
    # plt.figure(figsize=(8, 6))
    # plt.scatter(y_test, predictions, color='blue', label="Predicted vs Actual")
    # plt.plot([min(y_test), max(y_test)], [min(y_test), max(y_test)], color='red', linestyle='dashed', label="Perfect Prediction")
    # plt.xlabel("Actual Values")
    # plt.ylabel("Predicted Values")
    # plt.title("Actual vs Predicted Values")
    # plt.legend()
    # plt.show()
def main():
    # Generate synthetic regression data
    # Generate dataset
    # X, y = make_regression(n_samples=1000,n_features=1, noise=0.1)
    # y = np.expand_dims(y, axis=1)  # Reshape y to match expected input (100,1)

    # # Split into training and testing sets
    # X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    # mean_of_X_train=np.mean(X_train)
    # std_of_X_train=np.std(X_train)
    # # Assuming AnnClass is defined elsewhere
    # plt.figure(figsize=(8, 6))
    # plt.scatter(X_train, y_train, color='blue', label="Training Data")
    model = AnnClass(mean=0, std=1)

    # Add layers
    # model.add_layer(number_of_neurons=64, input_shape=4, activation_function="sigmoid")
    # model.add_layer(number_of_neurons=32, activation_function="sigmoid")
    # model.add_layer(number_of_neurons=1, activation_function="linear", alpha=0.01)
    model.add_layer(number_of_neurons=64
                    , input_shape=2, activation_function="sigmoid", alpha=0.01, n=1)
    model.add_layer(number_of_neurons=32,
                     activation_function="sigmoid", alpha=0.01, n=2)
    model.add_layer(number_of_neurons=1, activation_function="sigmoid",
                     alpha=0.1, n=3)
    # Compile the model
    model.compile_model(loss="mse", metrics=["mae"])

    # Train the model
    # model.fit(X_train, y_train, epochs=100, learning_rate=0.01)
    model.fit(X_train=np.float64([[0, 0], [0, 1], [1, 0], [1, 1]
    ]), y_train=np.float64([[0], [1], [1], [0]
    ]), epochs=9000,
               learning_rate=0.02)
    # Make predictions
    print(model.predict(np.array([[0, 0], [0, 1], [1, 0], [1, 1]])))
    # predictions = model.predict(X_test)

    # # Plot actual vs predicted values
    # plt.scatter(X_test, y_test, color='blue', label="Actual Values")
    # plt.scatter(X_test, predictions, color='red', label="Predicted Values")
    # plt.xlabel("X Test")
    # plt.ylabel("Y Values")
    # plt.title("Actual vs Predicted Values")
    # plt.legend()
    # plt.show()


if __name__ == "__main__":
    main()

