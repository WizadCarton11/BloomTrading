import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from base_model import BaseModel
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import seaborn as sns

from metrics import SelfMetrics
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore", category=UserWarning, module='sklearn')

class SelfLinearRegression(BaseModel):
    def __init__(self, X, y, sample_weight=None, weighted=False,
                  splitting="train-test", random_state=None, k=5):
        """
        Constructor for Linear Regression class
        :param name: Name of the model
        :param X: Feature matrix
        :param y: Target vector
        """
        super().__init__("Linear Regression")
        try:
            if X.shape[0] != y.shape[0]:
                raise ValueError("Number of samples in X and y must be equal")
            if y.shape[1] != 1:
                raise ValueError("Only single-dimensional target vectors are supported")
            # if splitting == "train-test":
            #     X_train, X_test, y_train, y_test = SelfMetrics.train_test_split(X, y, test_size=0.2)
            #     self._X_train = X_train
            #     self._X_test = X_test
            #     self._y_train = y_train
            #     self._y_test = y_test
            #     self._coefficients = None
            #     self._intercept = None
            #     self._sample_weight = sample_weight
            if splitting == "train-test":
                X_train, X_test, y_train, y_test = SelfMetrics.train_test_split(X, y, test_size=0.2, random_state=random_state)
                self._X_train = X_train
                self._X_test = X_test
                self._y_train = y_train
                self._y_test = y_test
                self._coefficients = None
                self._intercept = None
                self._sample_weight = sample_weight
                self._fit()
            elif splitting == "kfold":
                self.kfold_results = []
                self._coefficients = None
                self._intercept = None
                self._sample_weight = sample_weight
                splits = SelfMetrics.kfold_split(X, y, k=k, random_state=random_state)
                for fold_idx, (train_indices, test_indices) in enumerate(splits):
                    X_train, X_test = X[train_indices], X[test_indices]
                    y_train, y_test = y[train_indices], y[test_indices]
                    self._X_train, self._X_test = X_train, X_test
                    self._y_train, self._y_test = y_train, y_test
                    self._fit()
                    y_pred = self.predict(X_test)
                    mse = SelfMetrics.mean_squared_error(y_test, y_pred)
                    r2 = SelfMetrics.r2_score(y_test, y_pred)
                    self.kfold_results.append({
                        "fold": fold_idx + 1,
                        "mse": mse,
                        "r2": r2
                    })
            else:
                raise ValueError("Invalid splitting method. Choose 'train-test' or 'kfold'.")
        except Exception as e:
            print(f"Error in initializing model: {e}")

    def _fit(self):
        """
        Fit the model to the data
        """
        try:
            adjusted_X = np.hstack([np.ones((self._X_train.shape[0], 1)), self._X_train])
            if self._sample_weight is not None:
                weights = np.diag(self._sample_weight)
                self._coefficients = np.linalg.lstsq(
                    adjusted_X.T @ weights @ adjusted_X,
                    adjusted_X.T @ weights @ self._y_train,
                    rcond=None
                )[0]
            else:
                self._coefficients = np.linalg.lstsq(
                    adjusted_X.T @ adjusted_X,
                    adjusted_X.T @ self._y_train,
                    rcond=None
                )[0]
            self._intercept = self._coefficients[0]
            self._coefficients = self._coefficients[1:]
        except Exception as e:
            print(f"Error in fitting the model: {e}")

    def predict(self, X):
        """
        Predict the target variable
        :param X: Feature matrix
        :return: Predictions
        """
        try:
            if self._coefficients is None:
                raise ValueError("Model has not been trained yet")
            X_with_intercept = np.hstack([np.ones((X.shape[0], 1)), X])
            return X_with_intercept @ np.append(self._intercept, self._coefficients)
        except Exception as e:
            print(f"Error in prediction: {e}")
            return None

    def get_coefficients(self):
        """
        Get the coefficients and intercept of the model
        """
        try:
            if self._coefficients is None:
                raise ValueError("Model has not been trained yet")
            return self._coefficients, self._intercept
        except Exception as e:
            print(f"Error in retrieving coefficients: {e}")
            return None, None

    def getScores(self, compare_with_standard=False):
        """
        Get the scores (MSE, R²) of the model using sklearn's metrics
        """
        try:
            y_pred = self.predict(self._X_test)
            if y_pred is None:
                raise ValueError("Prediction failed, cannot compute scores.")
            y_pred=y_pred.reshape(-1,1)
            
            mse_custom = SelfMetrics.mean_squared_error(self._y_test, y_pred)
            r2_custom = SelfMetrics.r2_score(self._y_test, y_pred)
            
            print("Custom Linear Regression Metrics:")
            print("   Custom model coefficients and intercept: ")
            print("   ",self.get_coefficients())
            print(f"  Mean Squared Error: {mse_custom:.4f}")
            print(f"  R² Score: {r2_custom:.4f}")
            

            if compare_with_standard:
                # Compare with scikit-learn's Linear Regression
                sklearn_model = LinearRegression()
                sklearn_model.fit(self._X_train, self._y_train) 
                compare_y_pred = sklearn_model.predict(self._X_test)
                mse_sklearn = SelfMetrics.mean_squared_error(self._y_test, compare_y_pred)
                r2_sklearn = SelfMetrics.r2_score(self._y_test, compare_y_pred)
                print("\nScikit-Learn Linear Regression Metrics:")
                print("  Scikit-Learn Linear Regression Coefficients and Intercept: ")
                print(sklearn_model.coef_, sklearn_model.intercept_)
                print(f"  Mean Squared Error: {mse_sklearn:.4f}")
                print(f"  R² Score: {r2_sklearn:.4f}")
        except Exception as e:
            print(f"Error in calculating scores: {e}")

    def visualize(self, compare_with_standard=False):
        """
        Visualize the model
        """
        try:
            y_pred = self.predict(self._X_test)
            if y_pred is None:
                raise ValueError("Prediction failed, cannot visualize.")



            if self._X_train.shape[1] != 1:
                raise ValueError("Visualization is only supported for 1D features")

            # Plot the visualization
            sns.set(style="whitegrid")
            plt.figure(figsize=(10, 6))
            
            if compare_with_standard:
                sklearn_model = LinearRegression()
                sklearn_model.fit(self._X_train, self._y_train) 
                compare_y_pred = sklearn_model.predict(self._X_test)
                
                plt.plot(self._X_test, compare_y_pred, color='green', linestyle='--', label='Sklearn Model Predictions')
            
            # Scatter plot of actual data
            plt.scatter(self._X_train[:, 0], self._y_train, color='blue', label='Actual Data')

            augmented_X = np.hstack([np.ones((self._X_train.shape[0], 1)), self._X_train])

            # Plot the predictions based on the trained model
            model_predictions = augmented_X @ np.append(self._intercept, self._coefficients)
            plt.plot(self._X_train[:, 0], model_predictions, color='red', label='Model Predictions')

            plt.title("Linear Regression: Actual vs Predicted")
            plt.xlabel("Feature")
            plt.ylabel("Target")
            plt.legend()
            plt.grid(True)
            plt.show()
        except Exception as e:
            print(f"Error in visualization: {e}")

if __name__ == "__main__":
    np.random.seed(0)
    X1 = 2 * np.random.rand(100, 1)
    X2 = 3 * np.random.rand(100, 1)
    y = 4 + 3 * X1 + np.random.randn(100, 1) + 2 * X2
    X = np.hstack([X1, X2])

    # Train the model with K-Fold cross-validation
    model = SelfLinearRegression(X, y, splitting="kfold", k=5, random_state=42)

    # Print K-Fold results
    for result in model.kfold_results:
        print(f"Fold {result['fold']}: MSE = {result['mse']:.4f}, R² = {result['r2']:.4f}")
    print(model.get_coefficients())