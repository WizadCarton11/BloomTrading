import numpy as np

class SelfMetrics:
    @staticmethod
    def mean_absolute_error(y_true, y_pred):
        """
        Calculate the mean absolute error
        :param y_true: True target values
        :param y_pred: Predicted target values
        :return: Mean absolute error
        """
        return np.mean(np.abs(y_true - y_pred))

    @staticmethod
    def mean_squared_error(y_true, y_pred):
        """
        Calculate the mean squared error
        :param y_true: True target values
        :param y_pred: Predicted target values
        :return: Mean squared error
        """
        return np.mean((y_true - y_pred) ** 2)

    @staticmethod
    def r2_score(y_true, y_pred):
        """
        Calculate the R^2 score
        :param y_true: True target values
        :param y_pred: Predicted target values
        :return: R^2 score
        """
        numerator = np.sum((y_true - y_pred) ** 2)
        denominator = np.sum((y_true - np.mean(y_true)) ** 2)
        return 1 - (numerator / denominator)

    @staticmethod 
    def KFold()