export interface PatientRecord {
  patient_id: string;
  age: number;
  sex: number; // 0 = Female, 1 = Male
  creatinine: number;
  lyve1: number;
  reg1b: number;
  tff1: number;
  plasma_ca19_9: number;
  diagnosis: number; // 0 = Control/Benign, 1 = Early PDAC
}

export interface PCAProjection {
  pc1: number;
  pc2: number;
  pc3: number;
  pc4: number;
  diagnosis: number;
  patient_id: string;
}

export interface ModelBenchmark {
  name: string;
  accuracy: number;
  sensitivity: number;
  specificity: number;
  roc_auc: number;
  tp: number;
  fn: number;
  tn: number;
  fp: number;
  confusionMatrix: [[number, number], [number, number]];
  color: string;
  description: string;
}

export interface QuantumSimulationState {
  qubits: number[];
  inputFeatures: number[]; // 4 principal components scaled to [0, pi]
  rotationAnglesY: number[];
  rotationAnglesZ: number[];
  entangledWires: [number, number][];
  expectationValZ0: number;
  rawMalignancyProbability: number;
}
