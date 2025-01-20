
class BaseModel:
    """
    A base model class for all the models
    """
    def __init__(self, name):
        self._name=name
    
    def get_name(self):
        return self._name
    
    