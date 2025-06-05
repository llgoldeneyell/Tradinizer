import { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import FinanceTable from "./FinanceTable";

interface Liquidity {
    id?: number;
    date: string;
    amount: number;
}

interface Props {
    year: number;
    loading: boolean;
    error: boolean;
    liquidities: { date: string; amount: number }[];
    reloadLiquidity: () => void;
    token: string;
}

export default function LiquidityTable({ year, loading, error, liquidities, reloadLiquidity, token }: Props) {
    const todayStr = new Date().toISOString().split("T")[0];
    const [liquidityOpen, setLiquidityOpen] = useState(false);
    const [liquidityFormData, setLiquidityFormData] = useState<Liquidity>({
        date: todayStr,
        amount: 0
    });

    const handleLiquiditySubmit = async () => {
        try {
            const response = await fetch(`/liquidity`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(liquidityFormData),
            });
            if (!response.ok) {
                setLiquidityOpen(false);
                // Leggi il testo o JSON di errore dalla risposta
                const errorText = await response.text();
                console.error("Errore server:", response.status, errorText);
                throw new Error(errorText);
            }
            setLiquidityOpen(false);
            reloadLiquidity();
        } catch (err) {
            console.error("Errore salvataggio liquidità:", err);
        }
    };

    const handleDeleteLiquidity = async (item: Liquidity) => {
        try {
            await fetch(`/investments/liquidity/${year}/${item.id}`, {
                method: "DELETE",
            });
            reloadLiquidity();
        } catch (err) {
            console.error("Errore eliminazione liquidità:", err);
        }
    };

    return (
        <>
            {/* MODAL LIQUIDITÀ */}
            <Modal show={liquidityOpen} onHide={() => setLiquidityOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Aggiungi Liquidità Giornaliera</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="liquidity-date">
                            <Form.Label>Data</Form.Label>
                            <Form.Control
                                type="date"
                                value={liquidityFormData.date}
                                onChange={(e) =>
                                    setLiquidityFormData({ ...liquidityFormData, date: e.target.value })
                                }
                            />
                        </Form.Group>

                        <Form.Group controlId="liquidity-amount">
                            <Form.Label>Importo Liquidità</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Importo Liquidità"
                                value={liquidityFormData.amount}
                                onChange={(e) =>
                                    setLiquidityFormData({ ...liquidityFormData, amount: parseFloat(e.target.value) })
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setLiquidityOpen(false)}>Annulla</Button>
                    <Button variant="primary" onClick={handleLiquiditySubmit}>Salva</Button>
                </Modal.Footer>
            </Modal>



            {/* TABELLA */}
            <FinanceTable
                title="Liquidità Giornaliera"
                data={liquidities}
                loading={loading}
                error={error}
                onAdd={() => setLiquidityOpen(true)}
                onDelete={handleDeleteLiquidity}
                columns={[
                    { key: "date", label: "Data" },
                    {
                        key: "amount",
                        label: "Importo (€)",
                        render: (value) => (value as number).toFixed(2),
                    },
                ]}
            />
        </>
    );
}
