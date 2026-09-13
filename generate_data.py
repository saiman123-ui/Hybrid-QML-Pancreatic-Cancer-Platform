import random
import math
import csv

random.seed(42)

n_control = 120
n_pdac = 100
records = []

# Fieldnames
fields = ['patient_id', 'age', 'sex', 'creatinine', 'lyve1', 'reg1b', 'tff1', 'plasma_ca19_9', 'diagnosis']

for i in range(n_control):
    pat_id = f"PAT-CTRL-{1001+i}"
    age = int(min(85, max(34, random.gauss(56, 10))))
    sex = random.choice([0, 1])
    # Log-normal distributions for healthy controls
    creat = round(min(2.8, max(0.2, math.exp(random.gauss(0.1, 0.45)))), 3)
    lyve1 = round(min(4.5, max(0.08, math.exp(random.gauss(0.3, 0.6)))), 3)
    reg1b = round(min(140.0, max(4.0, math.exp(random.gauss(3.5, 0.8)))), 2)
    tff1 = round(min(290.0, max(8.0, math.exp(random.gauss(4.2, 0.8)))), 2)
    ca199 = round(min(42.0, max(2.0, math.exp(random.gauss(2.4, 0.5)))), 1)
    records.append({
        'patient_id': pat_id, 'age': age, 'sex': sex,
        'creatinine': creat, 'lyve1': lyve1, 'reg1b': reg1b,
        'tff1': tff1, 'plasma_ca19_9': ca199, 'diagnosis': 0
    })

for i in range(n_pdac):
    pat_id = f"PAT-PDAC-{2001+i}"
    age = int(min(88, max(42, random.gauss(66, 8.5))))
    sex = random.choice([0, 1])
    # Elevated urinary biomarkers in PDAC
    creat = round(min(3.0, max(0.2, math.exp(random.gauss(0.05, 0.48)))), 3)
    lyve1 = round(min(18.0, max(1.2, math.exp(random.gauss(1.75, 0.65)))), 3)
    reg1b = round(min(1250.0, max(65.0, math.exp(random.gauss(5.85, 0.85)))), 2)
    tff1 = round(min(2100.0, max(130.0, math.exp(random.gauss(6.45, 0.85)))), 2)
    if random.random() < 0.12: # 12% Lewis negative
        ca199 = round(random.uniform(5.0, 26.0), 1)
    else:
        ca199 = round(min(2200.0, max(15.0, math.exp(random.gauss(4.8, 1.1)))), 1)
    records.append({
        'patient_id': pat_id, 'age': age, 'sex': sex,
        'creatinine': creat, 'lyve1': lyve1, 'reg1b': reg1b,
        'tff1': tff1, 'plasma_ca19_9': ca199, 'diagnosis': 1
    })

random.shuffle(records)

with open('debernardi_dataset.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader()
    writer.writerows(records)

print(f"Successfully generated {len(records)} records in debernardi_dataset.csv")
