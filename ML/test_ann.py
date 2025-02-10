import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler

class LossLayer:
    def __init__(self, loss_type="mse"):
        self.loss_type = loss_type

    def compute_loss(self, y_true, y_pred):
        try:
            if self.loss_type == "mse":
                return np.mean((y_true - y_pred) ** 2)
            elif self.loss_type == "mae":
                return np.mean(np.abs(y_true - y_pred))
            elif self.loss_type == "huber":
                delta = 1.0
                error = y_true - y_pred
                return np.mean(np.where(np.abs(error) < delta, 0.5 * error ** 2, delta * (np.abs(error) - 0.5 * delta)))
            elif self.loss_type == "logcosh":
                return np.mean(np.log(np.cosh(y_pred - y_true)))
            elif self.loss_type == "binary_crossentropy":
                epsilon = 1e-12
                y_pred = np.clip(y_pred, epsilon, 1 - epsilon)
                return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))
            else:
                raise ValueError(f"Unsupported loss function: {self.loss_type}")
        except Exception as e:
            print(f"Error in computing loss: {e}")
            return None

    def compute_derivative(self, y_true, y_pred):
        try:
            if self.loss_type == "mse":
                return 2 * (y_pred - y_true) / y_true.size
            elif self.loss_type == "mae":
                return np.sign(y_pred - y_true) / y_true.size
            elif self.loss_type == "huber":
                delta = 1.0
                error = y_pred - y_true
                return np.where(np.abs(error) < delta, error, delta * np.sign(error)) / y_true.size
            elif self.loss_type == "logcosh":
                return np.tanh(y_pred - y_true) / y_true.size
            elif self.loss_type == "binary_crossentropy":
                epsilon = 1e-12
                y_pred = np.clip(y_pred, epsilon, 1 - epsilon)
                return (y_pred - y_true) / (y_pred * (1 - y_pred) * y_true.size)
            else:
                raise ValueError(f"Unsupported loss function: {self.loss_type}")
        except Exception as e:
            print(f"Error in computing loss derivative: {e}")
            return None

class DenseLayer:
    def __init__(self, input_size, output_size, activation, weight_init="he"):
        self.activation_func = activation
        self.weight_init = weight_init
        self.weights = self.initialize_weights(input_size, output_size)
        self.biases = np.zeros((1, output_size))
    
    def initialize_weights(self, input_size, output_size):
        if self.weight_init == "xavier":
            return np.random.randn(input_size, output_size) * np.sqrt(2.0 / input_size)  # Xavier init
        elif self.weight_init == "he":
            return np.random.randn(input_size, output_size) * np.sqrt(2.0 / input_size)  # He init
        else:
            raise ValueError(f"Unsupported weight initialization: {self.weight_init}")
    
    def forward(self, inputs):
        self.inputs = inputs
        self.z = np.dot(inputs, self.weights) + self.biases
        self.a = self.activation_func(self.z)
        return self.a
    
    def backward(self, d_output, learning_rate):
        d_activation = self.activation_func(self.z) * (1 - self.activation_func(self.z)) * d_output
        d_weights = np.dot(self.inputs.T, d_activation)
        d_biases = np.sum(d_activation, axis=0, keepdims=True)
        d_inputs = np.dot(d_activation, self.weights.T)

        # Update weights and biases using gradient descent
        self.weights -= learning_rate * d_weights
        self.biases -= learning_rate * d_biases
        
        return d_inputs
