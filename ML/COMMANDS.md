#To activate env  
    .\mlenv\Scripts\Activate.ps1   
#To freeze packages
    pip freeze > requirements.txt
#To run test
    pytest test_math_ops.py -v