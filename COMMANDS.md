
# Project Commands (Development)

## 1. Activate Python Environment

Activate the virtual environment to use project-specific dependencies:

```powershell
.\mlenv\Scripts\Activate.ps1
```

---

## 2. Freeze Installed Packages

Generate or update the `requirements.txt` file with the current environment's packages:

```bash
pip freeze > requirements.txt
```

---

## 3. Run Tests

Execute the test suite with detailed output:

```bash
pytest test_math_ops.py -v
```

---

## 4. Run FastAPI Server

Navigate to the appropriate directory, then start the FastAPI server:

```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

* Access the interactive API documentation at:
  [http://127.0.0.1:8000/docs#/](http://127.0.0.1:8000/docs#/)

---

## 5. Run Streamlit Application

Launch the Streamlit UI with development mode disabled:

```bash
streamlit run run_gradio_ui.py --global.developmentMode false
```

---

If you want, I can also suggest improvements such as adding commands for environment setup, or Docker usage if relevant. Would you like that?
