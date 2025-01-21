import numpy as np
from sklearn.datasets import make_classification
from sklearn.tree import DecisionTreeClassifier as SklearnDecisionTree
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.metrics import confusion_matrix
from sklearn.metrics import classification_report
from metrics import SelfMetrics
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from base_model import BaseModel
import seaborn as sns

from metrics import SelfMetrics
import warnings

# Custom Decision Tree Implementation
class CustomDecisionTree(BaseModel):
    def __init__(self, max_depth=None, min_samples_split=2, min_samples_leaf=1):
        """
        Constructor for Custom Decision Tree class
        :param max_depth: Maximum depth of the tree
        :param min_samples_split: Minimum number of samples required to split an internal node
        :param min_samples_leaf: Minimum number of samples required to be at a leaf node
        """
        super().__init__("Decision Tree")
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.min_samples_leaf = min_samples_leaf
        self.tree = None

    def set_params(self, max_depth=None, min_samples_split=2, min_samples_leaf=1):
        """
        Set parameters for the Decision Tree model
        :param max_depth: Maximum depth of the tree
        :param min_samples_split: Minimum number of samples required to split an internal node
        :param min_samples_leaf: Minimum number of samples required to be at a leaf node
        """
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.min_samples_leaf = min_samples_leaf

    def fit(self, X, y, test_size=0.2, random_state=42):
        """
        Fit the Decision Tree model to the data
        :param X: Input features
        :param y: Target values
        """
        try:
            X_train, X_test, y_train, y_test = SelfMetrics.train_test_split(X, y, test_size, random_state)
            self._x_test=X_test
            self._y_test=y_test
            self._x_train=X_train
            self._y_train=y_train
            self.tree = self._build_tree(X_train, y_train, depth=0)
        except Exception as e:
            print(f"Error in fit method: {e}")

    def predict(self, X):
        """
        Make predictions using the Decision Tree model
        :param X: Input features
        :return: Predicted target values
        """
        try:
            return np.array([self._traverse_tree(x, self.tree) for x in X])
        except Exception as e:
            print(f"Error in predict method: {e}")
            return np.zeros(X.shape[0])  # Default to all zeros if error occurs

    def _build_tree(self, X, y, depth):
        """
        Recursively build the Decision Tree
        :param X: Input features
        :param y: Target values
        :param depth: Current depth of the tree
        :return: Decision tree
        """
        try:
            #  Base cases
            # 1. If maximum depth is reached or number of samples is less than minimum samples for split
            if depth == self.max_depth or len(y) < self.min_samples_split or len(np.unique(y)) == 1:
                return self._create_leaf(y)

            best_split = self._find_best_split(X, y)
            if not best_split:
                return self._create_leaf(y)

            left_indices, right_indices = best_split['indices']
            return {
                'feature': best_split['feature'],
                'threshold': best_split['threshold'],
                'left': self._build_tree(X[left_indices], y[left_indices], depth + 1),
                'right': self._build_tree(X[right_indices], y[right_indices], depth + 1)
            }
        except Exception as e:
            print(f"Error in _build_tree method: {e}")
            return self._create_leaf(y)

    def _find_best_split(self, X, y):
        """
        Find the best split for the Decision Tree
        :param X: Input features
        :param y: Target values
        :return: Best split
        """
        try:
            best_split = None
            best_gini = float('inf')
            n_samples, n_features = X.shape

            for feature in range(n_features):
                thresholds = np.unique(X[:, feature])
                for threshold in thresholds:
                    left_indices = np.where(X[:, feature] <= threshold)[0]
                    right_indices = np.where(X[:, feature] > threshold)[0]

                    if len(left_indices) < self.min_samples_leaf or len(right_indices) < self.min_samples_leaf:
                        continue

                    gini = self._gini_index(y[left_indices], y[right_indices])
                    if gini < best_gini:
                        best_gini = gini
                        best_split = {
                            'feature': feature,
                            'threshold': threshold,
                            'indices': (left_indices, right_indices)
                        }
            return best_split
        except Exception as e:
            print(f"Error in _find_best_split method: {e}")
            return None

    def _gini_index(self, left, right):
        """
        Calculate the Gini index for a split
        :param left: Left node samples
        :param right: Right node samples
        :return: Gini index
        """
        try:
            def gini(group):
                if len(group) == 0:
                    return 0
                proportions = np.bincount(group) / len(group)
                return 1 - np.sum(proportions ** 2)

            total_samples = len(left) + len(right)
            return (len(left) / total_samples) * gini(left) + (len(right) / total_samples) * gini(right)
        except Exception as e:
            print(f"Error in _gini_index method: {e}")
            return float('inf')

    def _create_leaf(self, y):
        """
        Create a leaf node
        :param y: Target values
        :return: Leaf node
        """
        try:
            return np.bincount(y).argmax()
        except Exception as e:
            print(f"Error in _create_leaf method: {e}")
            return 0

    def _traverse_tree(self, x, node):
        """
        Recursively traverse the Decision Tree
        :param x: Input features
        :param node: Current node
        :return: Predicted target value
        """
        try:
            if isinstance(node, dict):
                if x[node['feature']] <= node['threshold']:
                    return self._traverse_tree(x, node['left'])
                else:
                    return self._traverse_tree(x, node['right'])
            return node
        except Exception as e:
            print(f"Error in _traverse_tree method: {e}")
            return 0

    def get_scores(self, compare_with_standard=False):
        """
        Get the scores of the Decision Tree model
        :param compare_with_standard: Compare with Scikit-learn model
        """
        try:
            y_pred = self.predict(self._x_test)
            print("Custom Decision Tree scores:")
            print(f"  - Accuracy: {accuracy_score(self._y_test, y_pred)}")
            print(f"  - Confusion Matrix: \n{confusion_matrix(self._y_test, y_pred)}")
            print(f"  - Classification Report: \n{classification_report(self._y_test, y_pred)}")
            if compare_with_standard:
                skldt=SklearnDecisionTree(max_depth=self.max_depth, min_samples_split=self.min_samples_split, min_samples_leaf=self.min_samples_leaf)
                skldt.fit(self._x_train, self._y_train)
                skldt_pred=skldt.predict(self._x_test)
                print("Scikit-learn Decision Tree scores:")
                print(f"  - Accuracy: {accuracy_score(self._y_test, skldt_pred)}")
                print(f"  - Confusion Matrix: \n{confusion_matrix(self._y_test, skldt_pred)}")
                print(f"  - Classification Report: \n{classification_report(self._y_test, skldt_pred)}")
                
        except Exception as e:
            print(f"Error in get_scores method: {e}")

# Train and Test Custom Decision Tree
try:
    X, y = make_classification(n_samples=5000, n_features=5, n_classes=2, random_state=20)
    custom_tree = CustomDecisionTree(max_depth=5, min_samples_split=2, min_samples_leaf=1)
    custom_tree.fit(X, y, test_size=0.2, random_state=42)
    custom_tree.get_scores(compare_with_standard=True)

except Exception as e:
    print(f"Error in training/testing Custom Decision Tree: {e}")
