import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface FinancialChartProps {
    investments: { date: string; amount: number; type: string; name: string }[];
    liquidities: { date: string; amount: number }[];
    year: number;
}

interface ChartDataDto {
    labels: string[];              // Giorni del mese
    differences: number[];         // Liquidità - investimenti cumulati
    percentage: number[];          // Percentuale giornaliera
    dailyGrowthRate: number;       // Percentuale media di crescita giornaliera
    projectedWeek: number;         // Proiezione liquidità a 7 giorni
    projectedMonth: number;        // Proiezione a 30 giorni
    projectedYear: number;         // Proiezione a 365 giorni
}

const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

function formatMonthYear(monthStr: string): string {
    const [, month] = monthStr.split("-");
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex]}`;
}

function extractYearAndMonth(monthStr: string): { month: number } {
    if (!monthStr) {
        return { month: 0 };
    }
    const [, month] = monthStr.split("-").map(Number);
    return { month };
}

const FinancialChart: React.FC<FinancialChartProps> = ({ investments, liquidities, year }) => {
    const [chartData, setChartData] = useState<ChartDataDto>();
    const [selectedMonth, setSelectedMonth] = useState<string>(''); // '' = tutti i dati

    const loadChartData = useCallback(async (retryCount = 0) => {
        const { month } = extractYearAndMonth(selectedMonth);
        try {
            const response = await fetch(`/chartData/${year}/${month}`);
            if (!response.ok) throw new Error("Server error");

            const data = await response.json();
            setChartData(data);
        } catch (err) {
            if (retryCount < 5) {
                setTimeout(() => loadChartData(retryCount + 1), 1000);
            } else {
                console.log("Errore nel caricamento:", err);
            }
        }
    }, [selectedMonth, liquidities]);

    useEffect(() => {
        loadChartData();
    }, [selectedMonth, liquidities, investments]);

    // Mappa gli investimenti per data
    const investmentMap = new Map<string, number>();
    investments.forEach(inv => {
        investmentMap.set(inv.date, (investmentMap.get(inv.date) || 0) + inv.amount);
    });

    // Mappa le liquidità per data
    const liquidityMap = new Map<string, number>();
    liquidities.forEach(liq => {
        liquidityMap.set(liq.date, liq.amount);
    });


    return (
        <div className="mt-5">
            {/* COMBOBOX MESE */}
            <div className="d-flex align-items-center mb-3">
                <label className="me-2">Seleziona mese:</label>
                <select
                    className="form-select w-auto"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    <option value="">Tutti</option>
                    {[...new Set(liquidities.map(l => l.date.slice(0, 7)))].sort().map(month => (
                        <option key={month} value={month}>
                            {formatMonthYear(month)} {/* Mostra nome mese + anno */}
                        </option>
                    ))}
                </select>
            </div>

            {chartData && (
                <>
                    {chartData && (
                        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "10px", width: '100%', height: '400px'}}>
                            <Line
                                data={{
                                    labels: chartData.labels,
                                    datasets: [
                                        {
                                            label: "Differenza (Liquidità - Investimenti cumulativi)",
                                            data: chartData.differences,
                                            borderColor: "orange",
                                            backgroundColor: "rgba(255, 165, 0, 0.2)",
                                            tension: 0.2,
                                        },
                                        {
                                            label: "Percentuale giornaliera",
                                            data: chartData.percentage,
                                            borderColor: "blue",
                                            backgroundColor: "rgba(0, 0, 255, 0.2)",
                                            tension: 0.2,
                                            yAxisID: "y1",
                                        }
                                    ]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        x: { stacked: true },
                                        y: { stacked: true },
                                    },
                                    plugins: {
                                        legend: { position: "top" },
                                        title: { display: true, text: "Titolo grafico" },
                                    },
                                }}
                            />
                        </div>
                    )}

                    <div className="card mt-4">
                        <div className="card-body">
                            <h5 className="card-title">Analisi Finanziaria</h5>
                            <p className="card-text">
                                Percentuale media giornaliera: {chartData.dailyGrowthRate.toFixed(2)}%
                            </p>
                            <p className="card-text">
                                Proiezione liquidità dopo 7 giorni: €{chartData.projectedWeek.toFixed(2)}
                            </p>
                            <p className="card-text">
                                Proiezione liquidità dopo 30 giorni: €{chartData.projectedMonth.toFixed(2)}
                            </p>
                            <p className="card-text">
                                Proiezione liquidità dopo 365 giorni: €{chartData.projectedYear.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
};

export default FinancialChart;
