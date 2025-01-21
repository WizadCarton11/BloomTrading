import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from base_model import BaseModel
from sklearn.linear_model import Ridge
import seaborn as sns
from metrics import SelfMetrics
class SelfRidgeRegression(BaseModel):
    def __init__(self, X, y, lambda_param=1.0, **kwargs):
        super().__init__("Ridge regression")
        try:
            if X.shape[0]!=y.shape[0]:
                raise ValueError("Number of samples in X and y must be equal")
            if y.shape[1]!=1:
                raise ValueError("Only single-dimensional target vectors are supported")
            self.lambda_param = lambda_param
            X_train, X_test, y_train, y_test =SelfMetrics.train_test_split(X=X, y=y, test_size=0.2)
            self._X_train = X_train.reshape(-1, 1)
            self._X_test = X_test.reshape(-1, 1)
            self._y_train = y_train
            self._y_test = y_test
            self._coefficients = None
            self._intercept = None
            self._sample_weight = None
            self._fit()
        except Exception as e:
            print(f"Error in initializing Ridge model: {e}")

    def _fit(self):
        """
        Fit the Ridge regression model to the data (with L2 regularization).
        """
        try:
            adjusted_X = np.hstack([np.ones((self._X_train.shape[0], 1)), self._X_train])  # Adding bias term
            if self._sample_weight is not None:
                weights = np.diag(self._sample_weight)
                # Add the lambda term to the normal equation (L2 regularization)
                lambda_identity = self.lambda_param * np.identity(adjusted_X.shape[1])
                self._coefficients = np.linalg.inv(adjusted_X.T @ weights @ adjusted_X + lambda_identity) @ adjusted_X.T @ weights @ self._y_train
            else:
                lambda_identity = self.lambda_param * np.identity(adjusted_X.shape[1])
                self._coefficients = np.linalg.inv(adjusted_X.T @ adjusted_X + lambda_identity) @ adjusted_X.T @ self._y_train
            self._intercept = self._coefficients[0]
            self._coefficients = self._coefficients[1:]
        except Exception as e:
            print(f"Error in fitting Ridge model: {e}")

    def predict(self, X):
        """
        Make predictions using the Ridge regression model.
        """
        try:
            if self._coefficients is None:
                raise ValueError("Model has not been fit yet")
            adjusted_X = np.hstack([np.ones((X.shape[0], 1)), X])
            return adjusted_X @ np.append(self._intercept, self._coefficients)
        except Exception as e:
            print(f"Error in predicting with Ridge model: {e}")

    def get_coefficients(self):
        """
        Get the coefficients of the Ridge regression model.
        """
        try:
            if self._coefficients is None or self._intercept is None:
                raise ValueError("Model has not been fit yet")
            return self._coefficients, self._intercept
        except Exception as e:
            print(f"Error in getting coefficients for Ridge model: {e}")
            return None
    
    def get_scores(self, compare_with_standard=False):
        """
        Get the scores (MSE, R²) of the model using sklearn's metrics.
        """
        try:
            y_pred = self.predict(self._X_test)
            print("Custom Ridge model scores:")
            print(f"  -Coeficients: {self._coefficients} \n  -Intercept: {self._intercept}")
            print(f"  - MSE: {SelfMetrics.mean_squared_error(self._y_test, y_pred)}")
            print(f"  - R²: {SelfMetrics.r2_score(self._y_test, y_pred)}")

            if compare_with_standard:
                standard_model = Ridge(alpha=self.lambda_param)
                standard_model.fit(self._X_train, self._y_train)
                standard_y_pred = standard_model.predict(self._X_test)
                print("Standard Ridge model scores:")
                print(f"  -Coeficients: {standard_model.coef_} \n  -Intercept: {standard_model.intercept_}")
                print(f"  - MSE: {SelfMetrics.mean_squared_error(self._y_test, standard_y_pred)}")
                print(f"  - R²: {SelfMetrics.r2_score(self._y_test, standard_y_pred)}")

        except Exception as e:
            print(f"Error in getting scores for Ridge model: {e}")
            return None
    
    def visualize(self, comapre_with_standard=False):
        """
        Visualize the true and predicted values of the target variable.
        """
        try:
            y_pred = self.predict(self._X_test)
            if y_pred is None:
                raise ValueError("Prediction failed, cannot visualize")
            if self._X_train.shape[1] > 1:
                raise ValueError("Visualization is only supported for single-dimensional feature vectors")
            sns.set_style("whitegrid")
            if comapre_with_standard:
                standard_model = Ridge(alpha=self.lambda_param)
                standard_model.fit(self._X_train, self._y_train)
                standard_y_pred = standard_model.predict(self._X_test)
                sns.regplot(x=self._y_test, y=standard_y_pred, line_kws={"color": "green"}, label="Standard Ridge")
            sns.regplot(x=self._y_test, y=y_pred, line_kws={"color": "red"}, label="Custom Ridge")
            plt.legend()
            plt.xlabel("True values")
            plt.ylabel("Predicted values")
            plt.title("Comparison of true and predicted values")
            plt.show()
        except Exception as e:
            print(f"Error in visualizing Ridge model: {e}")
            return None
if __name__ == "__main__":
    # Load the data
    
    X = 2*np.random.rand(100, 1)
    y = 4 + 3*X + np.random.randn(100, 1)
    # Train the custom Ridge regression model
    custom_ridge = SelfRidgeRegression(X, y, lambda_param=1)
    custom_ridge.get_scores(compare_with_standard=True)
    custom_ridge.visualize(comapre_with_standard=True)