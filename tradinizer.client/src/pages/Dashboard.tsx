// src/pages/Dashboard.tsx

import { useState, useEffect, useCallback } from "react";
import FinancialChart from "../components/FinancialChart";
import LiquidityTable from "../components/LiquidityTable";
import InvestmentTable from "../components/InvestmentTable";
interface Investment {
    id?: number;
    date: string;
    amount: number;
    type: string;
    name: string;
}

interface Liquidity {
    id?: number;
    date: string;
    amount: number;
}

interface DashboardProps {
    year: number;
    token: string;
}

export default function Dashboard({ year, token }: DashboardProps) {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [liquidities, setLiquidities] = useState<Liquidity[]>([]);
    const [liquidityLoading, setLiquidityLoading] = useState(true);
    const [liquidityError, setLiquidityError] = useState(false);
    const [investmentLoading, setInvestmentLoading] = useState(true);
    const [investmentError,   setInvestmentError] = useState(false);

    const loadInvestments = useCallback(async (retryCount = 0) => {
        try {
            setInvestmentLoading(true);
            setInvestmentError(false);
            const response = await fetch(`/investment/${year}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                setInvestmentLoading(false);
                // Leggi il testo o JSON di errore dalla risposta
                const errorText = await response.text();
                console.error("Errore server:", response.status, errorText);
                throw new Error(errorText);
            }

            const data = await response.json();
            setInvestments(data);
            setInvestmentLoading(false);
        } catch (err) {
            if (retryCount < 5) {
                setTimeout(() => loadInvestments(retryCount + 1), 1000);
            } else {
                setInvestmentError(true);
                setInvestmentLoading(false);
                console.log("Errore nel caricamento:", err);
            }
        }
    }, []);

    const loadLiquidity = useCallback(async (retryCount = 0) => {
        try {
            setLiquidityLoading(true);
            setLiquidityError(false);
            const response = await fetch(`/liquidity/${year}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                // Leggi il testo o JSON di errore dalla risposta
                const errorText = await response.text();
                console.error("Errore server:", response.status, errorText);
                throw new Error(errorText);
            }

            const data = await response.json();
            setLiquidities(data);
            setLiquidityLoading(false);
        } catch (err) {
            if (retryCount < 5) {
                setTimeout(() => loadLiquidity(retryCount + 1), 1000);
            } else {
                setLiquidityError(true);
                setLiquidityLoading(false);
                console.error("Errore definitivo nel caricamento della liquidità:", err);
            }
        }
    }, []);

    useEffect(() => {
        loadInvestments();
        loadLiquidity();
    }, [loadInvestments, loadLiquidity, year]);

    return (
        <div className="container-fluid mt-4">
            {/* Riquadro con i riepiloghi */}
            <div className="row mb-4">
                <div className="col-lg-4 col-md-6 col-sm-12 mb-3">
                    <div className="border rounded p-4 bg-light shadow-sm text-center h-100">
                        <h6 className="text-muted">Investimento attuale</h6>
                        <h5>€ 12.345</h5>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-12 mb-3">
                    <div className="border rounded p-4 bg-light shadow-sm text-center h-100">
                        <h6 className="text-muted">Liquidità attuale</h6>
                        <h5>€ 4.321</h5>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-12 mb-3">
                    <div className="border rounded p-4 bg-light shadow-sm text-center h-100">
                        <h6 className="text-muted">Percentuale totale</h6>
                        <h5>74%</h5>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-6 mb-3">
                    <div className="border rounded p-3 bg-white shadow-sm h-100">
                        <FinancialChart investments={investments} liquidities={liquidities} year={year} token={token} />
                    </div>
                </div>
                <div className="col-lg-3 mb-3">
                    <LiquidityTable year={year} loading={liquidityLoading} error={liquidityError} liquidities={liquidities} reloadLiquidity={loadLiquidity} token={token} />
                </div>
                <div className="col-lg-3 mb-3">
                    <InvestmentTable year={year} loading={investmentLoading} error={investmentError} investments={investments} reloadInvestment={loadInvestments} token={token} />
                </div>
            </div>
        </div>
    );
}
