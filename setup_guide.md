# Hybrid Quantum-Classical Platform for Early Pancreatic Cancer Detection
### Senior QML Engineer & Biomedical Software Architecture Specification

---

## 1. Project Overview & Clinical Significance

**Pancreatic Ductal Adenocarcinoma (PDAC)** is one of the deadliest malignancies globally, with a 5-year survival rate under 11%. Over 80% of patients are diagnosed at advanced unresectable stages (Stage III/IV) because the retroperitoneal location of the pancreas masks early tumor growth.

Recent clinical discoveries (notably the landmark **Debernardi et al., PLoS Medicine 2020** study) proved that early-stage pancreatic cancer leaves a detectable molecular footprint in **urine**:
- **LYVE1** (Lymphatic Vessel Endothelial Hyaluronan Receptor-1): Marker of tumor-induced lymphangiogenesis.
- **REG1B** (Regenerating Islet-Derived 1 Beta): Secreted glycoprotein elevated during acinar-to-ductal metaplasia.
- **TFF1** (Trefoil Factor 1): Stable mucin-associated peptide up-regulated in early pancreatic intraepithelial neoplasias (PanINs).
- **Creatinine**: Used to normalize urinary dilution variation across hydration states.
- **Plasma CA 19-9**: Current gold standard serum biomarker, but misses 10–15% of patients who are **Lewis-antigen negative** ($Le^{a-b-}$), failing to synthesize the sialyl Lewis-A epitope!

### Why Quantum Machine Learning (QML)?
Classical models (Linear Discriminant Analysis, standard RBF-SVM) often struggle with multi-body, non-linear biomarker correlations when sample sizes in clinical cohorts are noisy or limited. 
In our **Hybrid QML pipeline**:
1. Classical 7-dimensional biomarker data is dimensionally reduced via Principal Component Analysis (PCA) to 4 components.
2. The 4 components are mapped directly onto the rotation angles of a **4-qubit Hilbert state space** ($2^4 = 16$ dimensions) using **AngleEmbedding** ($\bigotimes R_y(x_i)|0\rangle$).
3. Multi-qubit **CNOT circular entanglement** creates quantum correlations between principal components that correspond to complex non-linear combinations of biological markers.
4. Measurements of Pauli expectation values $\langle \sigma_z \rangle$ produce calibrated probability outputs.

---

## 2. Quickstart: Running on Google Colab (Zero-Install)

You can run this entire Streamlit web application on a free Google Colab GPU/CPU instance without modifying local files:

### Colab Step 1: Open a new Colab Notebook and run:
```python
# 1. Install dependencies
!pip install -q streamlit pennylane scikit-learn pandas numpy plotly google-genai pyngrok

# 2. Upload or write app.py and debernardi_dataset.csv
# You can paste the contents of app.py into a cell using %%writefile app.py:
```

### Colab Step 2: Launch Streamlit with LocalTunnel or ngrok
```python
import os
# Optional: Enter your Gemini API Key
os.environ["GEMINI_API_KEY"] = "YOUR_GEMINI_API_KEY"

# Start Streamlit in the background
!streamlit run app.py & npx localtunnel --port 8501
```
*Click the public LocalTunnel URL printed in the output to access the live dashboard.*

---

## 3. Quickstart: Running Locally

### Step 1: Clone or extract the project directory
```bash
cd quantum-pancreatic-cancer
```

### Step 2: Create a virtual environment
```bash
# On Linux / macOS:
python3 -m venv qml_env
source qml_env/bin/activate

# On Windows:
python -m venv qml_env
qml_env\Scripts\activate
```

### Step 3: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 4: (Optional) Set your Gemini API key
```bash
# On Linux / macOS:
export GEMINI_API_KEY="AIzaSy..."

# On Windows PowerShell:
$env:GEMINI_API_KEY="AIzaSy..."
```

### Step 5: Launch the Streamlit web dashboard
```bash
streamlit run app.py
```
Open `http://localhost:8501` in your browser.

---

## 4. Architecture & Mathematical Formulation

### 1. Quantum State Preparation (Angle Embedding)
Given normalized principal component input $\vec{x} = [x_0, x_1, x_2, x_3]^T \in [0, \pi]^4$:
$$|\psi(\vec{x})\rangle = \bigotimes_{i=0}^3 R_y(x_i)|0\rangle = \bigotimes_{i=0}^3 \left( \cos\left(\frac{x_i}{2}\right)|0\rangle + \sin\left(\frac{x_i}{2}\right)|1\rangle \right)$$

### 2. Parameterized Variational Ansatz
Each variational layer $l \in \{1, \dots, L\}$ applies parameterized single-qubit rotations followed by circular entangling gates:
$$U(\vec{\theta}_l) = \left( \prod_{i=0}^{3} \text{CNOT}_{i, (i+1)\%4} \right) \left( \bigotimes_{i=0}^3 R_z(\phi_{l,i}) R_y(\theta_{l,i}) \right)$$
The full state before measurement is:
$$|\Psi(\vec{x}, \vec{\Theta})\rangle = \left( \prod_{l=1}^L U(\vec{\theta}_l) \right) |\psi(\vec{x})\rangle$$

### 3. Hamiltonian Expectation Measurement
We measure the expectation value of the Pauli-Z operator on qubit 0:
$$\hat{y}(\vec{x}; \vec{\Theta}, b) = \langle \Psi(\vec{x}, \vec{\Theta}) | \sigma_z^{(0)} | \Psi(\vec{x}, \vec{\Theta}) \rangle + b$$
The cancer probability is obtained through calibrated Platt/Sigmoid scaling:
$$P(\text{Malignancy} | \vec{x}) = \frac{1}{1 + \exp(-\gamma \cdot \hat{y})}$$

---

## 5. File Structure
- `app.py`: Complete, single-file runnable Streamlit dashboard with PennyLane, Scikit-learn, and Gemini API.
- `debernardi_dataset.csv`: 220-sample realistic benchmark dataset based on Debernardi et al. distributions.
- `generate_data.py`: Generator script for urinary biomarker cohort data.
- `requirements.txt`: Python package specifications.
- `setup_guide.md`: This comprehensive architecture and reproduction documentation.

---

## 6. Hackathon Pitch Points
1. **Clinical Need**: Non-invasive early detection transforms 5-year pancreatic cancer survival from ~10% to over 50%.
2. **Lewis-Negative Rescue**: Urinary LYVE1/REG1B/TFF1 catches the ~12% of patients whose blood tests show false-negative CA19-9.
3. **Quantum Synergies**: Shows how parameterized quantum circuits on NISQ simulators efficiently explore multi-body non-linear state spaces with minimal parameters.
4. **Physician-in-the-loop**: Adjustable threshold slider allows clinicians to prioritize screening sensitivity (minimizing false negatives) while Gemini AI provides transparent, understandable biomarker reasoning.
