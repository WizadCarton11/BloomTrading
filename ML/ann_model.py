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

class ANNModel(BaseModel):
    def __init__(self):
        super().__init__("Artificial Neural  Network")
        self._logger= CustomLogger(name="AnnClassLogger", 
                                   log_file="./Logs/layers.log").get_logger()
        self._math_ops=MathOps()
        self._loss_layer: LossLayer = None
        self._learning_rate: float=None
        self._batch_size: int=None
        self._layers: List[Layer] = []
        self._metric_layer: LossLayer =[]
    
    def add_layer(self, number_of_neurons: int, input_shape: int=1,
                  activation_function: str = "sigmoid", alpha: float =0.01, **kwargs) -> None:
        try:
            if len(self._layers)!=0:
                input_shape: int=self._layers[-1].get_number_of_neurons()
                
            new_layer: Layer= Layer(input_size=input_shape, number_of_neurons=number_of_neurons, activation_function_type=activation_function, alpha=alpha)
            self._layers.append(new_layer)
        except CustomException as e:
            self._logger.error(f"Error in add_layer: {e}")
            raise_custom_exception(CustomException, message=f"Error in add_layer: {e}")
        except Exception as e:
            self._logger.critical(f"Crititcal Error in add_layer: {e}")
            raise_custom_exception(CustomException, message=f"Error in add_layer: {e}")

    def _forward_propagation(self, X: np.ndarray, alpha: float= 0.1) -> np.ndarray:
        try:
            for layer in self._layers:
                X = layer.forward(X, alpha=alpha)
            return X
        except CustomException as e:
            self._logger.error(f"Error in forward propagation: {e}")
            raise_custom_exception(CustomException, message=f"Error in forward propagation: {e}")
        except Exception as e:
            self._logger.critical(f"Critical error in forward propagation: {e}")
            raise_custom_exception(CustomException, message=f"Error in forward propagation: {e}")

    def _back_propagation(self, d_output: np.ndarray, learning_rate: float, alpha: float=0.1) -> None:    
        try:
            for layer in reversed(self._layers):
                d_output = layer.backward(d_output=d_output, learning_rate=learning_rate, alpha=alpha)
        except CustomException as e:
            self._logger.error(f"Error in back propagation: {e}")
            raise_custom_exception(CustomException, message=f"Error in back propagation: {e}")
        except Exception as e:
            self._logger.critical(f"Critical error in back propagation: {e}")
            raise_custom_exception(CustomException, message=f"Error in back propagation: {e}")

    def _single_iteration(self, X: np.float64, Y: np.float64, learning_rate: float=0.001, alpha: float=0.1) -> float:
        try:
            output = self._forward_propagation(X, alpha=alpha)
            loss = self._loss_layer.forward(y_true=Y, y_pred=output)
            d_output = self._loss_layer.derivative_loss(y_true=Y, y_pred=output)
            self._back_propagation(d_output=d_output, learning_rate=learning_rate, alpha=alpha)
            return loss
        except CustomException as e:
            self._logger.error(f"Error in single iteration: {e}")
            raise_custom_exception(CustomException, message=f"Error in single iteration: {e}")
        except Exception as e:
            self._logger.critical(f"Critical error in single iteration: {e}")
            raise_custom_exception(CustomException, message=f"Error in single iteration: {e}")
    def train(self, X: np.float64, Y: np.float64, epochs: int=1000, learning_rate: float=0.001):
        losses = []
        for epoch in range(epochs):
            # output = self._forward_propagation(X)
            
            # loss = self._loss_layer.forward(y_true=Y, y_pred=output)
            # losses.append(loss)
            # d_output = self._loss_layer.derivative_loss(y_true=Y, y_pred=output)

            # self._back_propagation(d_output=d_output, learning_rate=learning_rate)
            for idx in range(0, X.shape[0], self._batch_size):
                X_batch = X[idx:idx+self._batch_size]
                Y_batch = Y[idx:idx+self._batch_size]
                loss = self._single_iteration(X=X_batch, Y=Y_batch, learning_rate=learning_rate, alpha=self._alpha)
                losses.append(loss)
            if epoch % 500 == 0:
                output = self._forward_propagation(X)
                metric_loss=self._metric_layer.forward(y_true=Y, y_pred=output)
                print(f"Epoch {epoch}, Loss: {loss:.6f}, metric: {metric_loss:.6f}")

        return losses
    
    def compile(self, loss: str="mse", metric: str="mse", learning_rate: float=0.001, alpha: float=0.1, batch_size: int=1):
        try:
            self._loss_layer = LossLayer(loss_type=loss)
            self._metric_layer = LossLayer(loss_type=metric)
            self._learning_rate = learning_rate
            self._batch_size = batch_size
            self._alpha = alpha
        except CustomException as e:
            self._logger.error(f"Error in compile: {e}")
            raise_custom_exception(CustomException, message=f"Error in compile: {e}")
        except Exception as e:
            self._logger.critical(f"Critical Error in compile: {e}")
            raise_custom_exception(CustomException, message=f"Error in compile: {e}")
    
    def predict(self, X):
        output = X
        for layer in self._layers:
            output = layer.forward(output)
        return output
    
    def evaluate(self, X, Y):

        output = self.predict(X)
        loss = self._loss_layer.forward(y_true=Y, y_pred=output)
        metric = self._metric_layer.forward(y_true=Y, y_pred=output)
        return loss, metric
    
    def get_weights_biases(self):
        weights = []
        biases = []
        for layer in self._layers:
            wts, b= layer.get_weights_and_biases()
            weights.append(wts)
            biases.append(b)
        return weights, biases
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_regression
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

# Generate synthetic regression data
X, Y = make_regression(n_samples=1000, n_features=1, noise=15, random_state=420)
Y = Y.reshape(-1, 1)  # Reshape to match neural network output shape

# Normalize data
scaler_X = MinMaxScaler()
scaler_Y = MinMaxScaler()
X_scaled = scaler_X.fit_transform(X)
Y_scaled = scaler_Y.fit_transform(Y)

# Train-test split
X_train, X_test, Y_train, Y_test = train_test_split(X_scaled, Y_scaled, test_size=0.2, random_state=42)

# ANN model with a simple architecture
model = ANNModel()
model.add_layer(number_of_neurons=64, input_shape=X_train.shape[1], activation_function="relu")
model.add_layer(number_of_neurons=32, activation_function="relu")
model.add_layer(number_of_neurons=1, activation_function="linear")
model.compile(loss="mse", metric="mae", learning_rate=0.001, alpha=0.01, batch_size=100)

# Train the model
losses = model.train(X_train, Y_train)

# Predictions on train and test sets
Y_pred_train = model.predict(X_train)
Y_pred_test = model.predict(X_test)

# Rescale predictions back to the original scale
Y_pred_train_rescaled = scaler_Y.inverse_transform(Y_pred_train)
Y_pred_test_rescaled = scaler_Y.inverse_transform(Y_pred_test)
Y_train_rescaled = scaler_Y.inverse_transform(Y_train)
Y_test_rescaled = scaler_Y.inverse_transform(Y_test)

# Plot Loss Curve
plt.figure(figsize=(10, 4))
plt.plot(losses, label="Training Loss")
plt.xlabel("Epochs")
plt.ylabel("MSE Loss")
plt.title("Training Loss Curve")
plt.legend()
plt.show()

# Plot Predictions vs Ground Truth
plt.figure(figsize=(10, 6))
plt.scatter(scaler_X.inverse_transform(X_train), Y_train_rescaled, label="Train Data", color="blue")
plt.scatter(scaler_X.inverse_transform(X_test), Y_test_rescaled, label="Test Data", color="red")
plt.scatter(scaler_X.inverse_transform(X_train), Y_pred_train_rescaled, label="Model Predictions", color="green")
plt.xlabel("X Feature")
plt.ylabel("Y Target")
plt.title("Regression Predictions vs Ground Truth")
plt.legend()
plt.show()