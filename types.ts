
export interface HealthMetrics {
  state: string;
  hypertension_women: number;
  hypertension_men: number;
  diabetes_women: number;
  diabetes_men: number;
  anemia_women: number;
  anemia_men: number;
  obesity_women: number;
  obesity_men: number;
  tobacco_women: number;
  tobacco_men: number;
  alcohol_women: number;
  alcohol_men: number;
}

export interface EnrichedHealthData extends HealthMetrics {
  avg_hypertension: number;
  avg_diabetes: number;
  avg_anemia: number;
  avg_tobacco: number;
  avg_obesity: number;
  avg_alcohol: number;
  totalBurden: number;
  lifestyle_risk: number;
  health_impact: number;
}

export interface AnalysisResult {
  stressMetrics: EnrichedHealthData[];
  healthBurden: EnrichedHealthData[];
  averages: {
    avgHypertension: number;
    avgDiabetes: number;
    avgAnemia: number;
  };
  topRiskStates: EnrichedHealthData[];
}
