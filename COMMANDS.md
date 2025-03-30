#To activate env  
    .\mlenv\Scripts\Activate.ps1   
#To freeze packages
    pip freeze > requirements.txt
#To run test
    pytest test_math_ops.py -v

#To run the fastapi server (first go to the directory)
    uvicorn server:app --host 0.0.0.0 --port 8000 --reload

    Then go to http://127.0.0.1:8000/docs#/
