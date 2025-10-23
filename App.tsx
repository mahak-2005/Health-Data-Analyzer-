
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Upload, TrendingUp, Activity, AlertCircle, FileText, BrainCircuit } from './components/icons';
import { sampleCSVData } from './data/sampleData';
import type { AnalysisResult, EnrichedHealthData } from './types';
import { generateHealthInsights } from './services/geminiService';

export default function App() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [error, setError] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('hypertension');

  const processData = useCallback((csvText: string) => {
    setLoading(true);
    setError('');
    setAnalysis(null);
    setAiInsights(null);

    try {
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const parsedData: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(',');
        const row: { [key: string]: string } = {};
        headers.forEach((header, index) => {
          row[header] = values[index] ? values[index].trim() : '';
        });
        parsedData.push(row);
      }
      
      performAnalysis(parsedData);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError('Error parsing CSV: ' + errorMessage);
      setLoading(false);
    }
  }, []);

  const performAnalysis = (dataset: any[]) => {
    if (!dataset || dataset.length === 0) return;

    try {
      const stressMetrics = dataset.map(row => {
        const getVal = (key: string) => {
          const val = parseFloat(row[key]);
          return isNaN(val) ? 0 : val;
        };

        return {
          state: row['states/uts'] || row['states_uts'] || 'Unknown',
          hypertension_women: getVal('women_age_15_years_and_above_wih_elevated_blood_pressure_(systolic_≥140_mm_of_hg_and/or_diastolic_≥90_mm_of_hg)_or_taking_medicine_to_control_blood_pressure_(%)'),
          hypertension_men: getVal('men_age_15_years_and_above_wih_elevated_blood_pressure_(systolic_≥140_mm_of_hg_and/or_diastolic_≥90_mm_of_hg)_or_taking_medicine_to_control_blood_pressure_(%)'),
          diabetes_women: getVal('women_age_15_years_and_above_wih_high_or_very_high_(>140_mg/dl)_blood_sugar_level_or_taking_medicine_to_control_blood_sugar_level23_(%)'),
          diabetes_men: getVal('men_age_15_years_and_above_wih_high_or_very_high_(>140_mg/dl)_blood_sugar_level__or_taking_medicine_to_control_blood_sugar_level23_(%)'),
          anemia_women: getVal('all_women_age_15-49_years_who_are_anaemic22_(%)'),
          anemia_men: getVal('men_age_15-49_years_who_are_anaemic_(<13.0_g/dl)22_(%)'),
          obesity_women: getVal('women_(age_15-49_years)_who_are_overweight_or_obese_(bmi_≥25.0_kg/m2)21_(%)'),
          obesity_men: getVal('men_(age_15-49_years)_who_are_overweight_or_obese_(bmi_≥25.0_kg/m2)_(%)'),
          tobacco_women: getVal('women_age_15_years_and_above_who_use_any_kind_of_tobacco_(%)'),
          tobacco_men: getVal('men_age_15_years_and_above_who_use_any_kind_of_tobacco_(%)'),
          alcohol_women: getVal('women_age_15_years_and_above_who_consume_alcohol_(%)'),
          alcohol_men: getVal('men_age_15_years_and_above_who_consume_alcohol_(%)'),
        };
      }).filter(d => d.state !== 'Unknown' && d.state !== '');

      const enrichedData: EnrichedHealthData[] = stressMetrics.map(d => ({
        ...d,
        avg_hypertension: (d.hypertension_women + d.hypertension_men) / 2,
        avg_diabetes: (d.diabetes_women + d.diabetes_men) / 2,
        avg_anemia: (d.anemia_women + d.anemia_men) / 2,
        avg_tobacco: (d.tobacco_women + d.tobacco_men) / 2,
        avg_obesity: (d.obesity_women + d.obesity_men) / 2,
        avg_alcohol: (d.alcohol_women + d.alcohol_men) / 2,
        totalBurden: ((d.hypertension_women + d.hypertension_men + d.diabetes_women + d.diabetes_men + d.anemia_women + d.anemia_men) / 6),
        lifestyle_risk: ((d.tobacco_men + d.tobacco_women + d.alcohol_men + d.alcohol_women + d.obesity_men + d.obesity_women) / 6),
        health_impact: ((d.hypertension_men + d.hypertension_women + d.diabetes_men + d.diabetes_women) / 4)
      }));

      const avgHypertension = enrichedData.reduce((acc, d) => acc + d.avg_hypertension, 0) / enrichedData.length;
      const avgDiabetes = enrichedData.reduce((acc, d) => acc + d.avg_diabetes, 0) / enrichedData.length;
      const avgAnemia = enrichedData.reduce((acc, d) => acc + d.avg_anemia, 0) / enrichedData.length;

      const healthBurden = [...enrichedData].sort((a, b) => b.totalBurden - a.totalBurden);

      setAnalysis({
        stressMetrics: enrichedData,
        healthBurden: healthBurden.slice(0, 10),
        averages: { avgHypertension, avgDiabetes, avgAnemia },
        topRiskStates: healthBurden.slice(0, 5)
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError('Error analyzing data: ' + errorMessage);
    }
  };
  
  useEffect(() => {
    processData(sampleCSVData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (analysis) {
      setIsGeneratingInsights(true);
      generateHealthInsights(analysis)
        .then(insights => {
          setAiInsights(insights);
        })
        .catch(err => {
          setAiInsights("Could not generate AI insights. Ensure your Gemini API key is configured correctly.");
        })
        .finally(() => {
          setIsGeneratingInsights(false);
        });
    }
  }, [analysis]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processData(text);
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsText(file);
  };

  const getMetricData = () => {
    if (!analysis) return [];
    
    const metricKey = `avg_${selectedMetric}` as keyof EnrichedHealthData;
    return analysis.stressMetrics
      .map(d => ({ 
        state: d.state.length > 15 ? d.state.substring(0, 15) + '...' : d.state, 
        value: (d[metricKey] as number) || 0 
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  };

  const downloadReport = () => {
    if (!analysis) return;
    let report = "NFHS HEALTH ANALYSIS REPORT\n" + "=".repeat(60) + "\n\n";
    report += "NATIONAL AVERAGES:\n" + "-".repeat(60) + "\n";
    report += `Hypertension: ${analysis.averages.avgHypertension.toFixed(2)}%\n`;
    report += `Diabetes: ${analysis.averages.avgDiabetes.toFixed(2)}%\n`;
    report += `Anemia: ${analysis.averages.avgAnemia.toFixed(2)}%\n\n`;
    
    report += "TOP 5 HIGH-RISK STATES (by overall health burden):\n" + "-".repeat(60) + "\n";
    analysis.topRiskStates.forEach((state, i) => {
      report += `${i + 1}. ${state.state}\n`;
      report += `   Overall Health Burden: ${state.totalBurden.toFixed(2)}%\n`;
      report += `   Hypertension: ${state.avg_hypertension.toFixed(2)}%\n`;
      report += `   Diabetes: ${state.avg_diabetes.toFixed(2)}%\n\n`;
    });

    if (aiInsights) {
        report += "\nAI-POWERED INSIGHTS & RECOMMENDATIONS (from Gemini)\n" + "=".repeat(60) + "\n\n";
        report += aiInsights.replace(/(\*\*|### |## |# )/g, '');
    }
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nfhs_health_analysis_report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">NFHS Health Data Analyzer</h1>
              <p className="text-gray-600">AI-powered insights into stress-related health indicators across India</p>
            </div>
            <Activity className="w-10 h-10 md:w-12 md:h-12 text-indigo-600 mt-4 sm:mt-0" />
          </div>
          <div className="mt-6">
            <label className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer hover:border-indigo-500 transition-all bg-indigo-50 hover:bg-indigo-100">
              <Upload className="w-6 h-6 mr-3 text-indigo-600" />
              <span className="text-indigo-700 font-medium">Upload New NFHS CSV File</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
             <p className="text-xs text-center text-gray-500 mt-2">Using sample data by default. Upload a file to analyze your own data.</p>
          </div>
        </header>

        {loading && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Analyzing health data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {analysis && !loading && (
          <main className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm"><div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold text-red-800">Avg Hypertension</h3><TrendingUp className="w-5 h-5 text-red-600" /></div><p className="text-3xl font-bold text-red-700">{analysis.averages.avgHypertension.toFixed(1)}%</p><p className="text-xs text-red-600 mt-1">National average</p></div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm"><div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold text-orange-800">Avg Diabetes</h3><AlertCircle className="w-5 h-5 text-orange-600" /></div><p className="text-3xl font-bold text-orange-700">{analysis.averages.avgDiabetes.toFixed(1)}%</p><p className="text-xs text-orange-600 mt-1">National average</p></div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 shadow-sm"><div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold text-yellow-800">Avg Anemia</h3><Activity className="w-5 h-5 text-yellow-600" /></div><p className="text-3xl font-bold text-yellow-700">{analysis.averages.avgAnemia.toFixed(1)}%</p><p className="text-xs text-yellow-600 mt-1">National average</p></div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4"><h2 className="text-2xl font-bold text-gray-800">State-wise Comparison</h2><select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"><option value="hypertension">Hypertension</option><option value="diabetes">Diabetes</option><option value="anemia">Anemia</option><option value="tobacco">Tobacco Use</option><option value="obesity">Obesity</option><option value="alcohol">Alcohol Consumption</option></select></div>
              <ResponsiveContainer width="100%" height={400}><BarChart data={getMetricData()} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="state" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} /><YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} /><Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} formatter={(value: number) => [`${value.toFixed(2)}%`, 'Percentage']} /><Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg"><h2 className="text-2xl font-bold text-gray-800 mb-4">Top 10 High-Risk States</h2><ResponsiveContainer width="100%" height={400}><BarChart data={analysis.healthBurden} layout="vertical" margin={{ left: 80 }}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis type="number" tick={{ fontSize: 12 }} /><YAxis dataKey="state" type="category" width={120} tick={{ fontSize: 11 }} /><Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} formatter={(value: number) => [`${value.toFixed(2)}%`, 'Health Burden']} /><Bar dataKey="totalBurden" fill="#ef4444" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg"><h2 className="text-2xl font-bold text-gray-800 mb-4">Lifestyle vs Health Impact</h2><ResponsiveContainer width="100%" height={400}><ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis type="number" dataKey="lifestyle_risk" name="Lifestyle Risk" unit="%" domain={['dataMin', 'dataMax']} label={{ value: 'Lifestyle Risk Score (%)', position: 'bottom', offset: 0 }} tick={{ fontSize: 12 }} /><YAxis type="number" dataKey="health_impact" name="Health Impact" unit="%" domain={['dataMin', 'dataMax']} label={{ value: 'Health Impact Score (%)', angle: -90, position: 'left', offset: 10 }} tick={{ fontSize: 12 }} /><Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} formatter={(value: number) => value.toFixed(2) + '%'} /><Scatter data={analysis.stressMetrics} fill="#8b5cf6" /></ScatterChart></ResponsiveContainer></div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><BrainCircuit className="w-7 h-7 mr-3 text-indigo-600" />AI-Powered Insights & Recommendations</h2>
              {isGeneratingInsights && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                    <p className="text-gray-600">Gemini is generating insights...</p>
                  </div>
              )}
              {aiInsights && !isGeneratingInsights && (
                  <div className="prose prose-indigo max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: aiInsights.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/### (.*?)<br \/>/g, '<h3>$1</h3>').replace(/## (.*?)<br \/>/g, '<h2>$1</h2>') }}></div>
              )}
            </div>
            
            <div className="text-center pt-4">
              <button onClick={downloadReport} className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center mx-auto shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"><FileText className="w-5 h-5 mr-2" />Download Full Analysis Report</button>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
