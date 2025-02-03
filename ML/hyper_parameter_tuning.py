from base_model import BaseModel
from metrics import SelfMetrics
class GridSearchCV:
    def __init__(self, estimator, param_grid, random_state=None,
                  cv=5, scoring='accuracy', error_score=-1):
        try:
            if estimator==None:
                raise Exception("There is no model")
            if not isinstance(estimator, BaseModel):
                raise Exception("Estimator is not a model")
            if param_grid==None:
                raise Exception("There is no parameter grid")
            self._estimator=estimator
            self._param_grid=param_grid
            self._cv=cv
            self._scoring=scoring
            self._error_score=error_score
            self._random_state=random_state
        except Exception as e:
            print(f"Error in initialising GridSearchCV: {e}")
    
    def fit(self, X, y):
        
    