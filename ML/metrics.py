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
    def train_test_split(X, y, test_size=0.2, random_state=None):
        """
        Split the data into training and testing sets with optional reproducibility.
        
        :param X: Feature matrix
        :param y: Target variable
        :param test_size: Size of the testing set
        :param random_state: Seed for random number generation
        :return: X_train, X_test, y_train, y_test
        """
        if random_state is not None:
            np.random.seed(random_state)
        
        n = X.shape[0]
        test_indices = np.random.choice(n, int(n * test_size), replace=False)
        train_indices = [i for i in range(n) if i not in test_indices]
        
        return X[train_indices], X[test_indices], y[train_indices], y[test_indices]

    @staticmethod
    def kfold_split(X, y, k=5, random_state=None):
        """
        Perform K-Fold cross-validation split.
        
        :param X: Feature matrix
        :param y: Target variable
        :param k: Number of folds
        :param random_state: Seed for random number generation
        :return: List of (train_indices, test_indices) tuples for each fold
        """
        if random_state is not None:
            np.random.seed(random_state)
        
        n = X.shape[0]
        indices = np.arange(n)
        np.random.shuffle(indices)  # Shuffle the indices for random folds

        folds = np.array_split(indices, k)  # Split indices into k roughly equal folds
        splits = []

        for i in range(k):
            test_indices = folds[i]
            train_indices = np.concatenate([folds[j] for j in range(k) if j != i])
            splits.append((train_indices, test_indices))
        
        return splits

