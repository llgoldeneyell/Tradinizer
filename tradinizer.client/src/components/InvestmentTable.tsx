import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import FinanceTable from "./FinanceTable";

interface Investment {
    id?: number;
    date: string;
    amount: number;
    type: string;
    name: string;
}

interface Props {
    year: number;
    loading: boolean;
    error: boolean;
    investments: { date: string; amount: number, type: string, name: string }[];
    reloadInvestment: () => void;
    token: string;
}

export default function InvestmentTable({ year, loading, error, investments, reloadInvestment, token }: Props) {
    const todayStr = new Date().toISOString().split("T")[0];
    const [isNew, setIsNew] = useState(true); // true = "Nuovo", false = "Esistente"
    const [investmentOpen, setInvestmentOpen] = useState(false);
    const [investment, setInvestment] = useState<Investment>({
        date: todayStr,
        amount: 0,
        type: "ETF",
        name: "",
    });

    const handleInvestmentSubmit = async () => {
        try {
            const response = await fetch(`/investment`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(investment),
            });
            if (!response.ok) {
                setInvestmentOpen(false);
                // Leggi il testo o JSON di errore dalla risposta
                const errorText = await response.text();
                console.error("Errore server:", response.status, errorText);
                throw new Error(errorText);
            }

            setInvestmentOpen(false);
            reloadInvestment();
        } catch (error) {
            console.error("Errore salvataggio investimento:", error);
        }
    };

    const handleDeleteInvestment = async (item: Investment) => {
        try {
            await fetch(`/investment/${year}/${item.id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            reloadInvestment(); // ricarica dopo la cancellazione
        } catch (error) {
            console.error("Errore eliminazione investimento:", error);
        }
    };

    const uniqueNamesByType = (type: string) => {
        return Array.from(
            new Set(
                investments
                    .filter(inv => inv.type === type)
                    .map(inv => inv.name)
            )
        );
    };

    useEffect(() => {
        reloadInvestment();
    }, [year]);

    

    return (
        <>
            {/* MODAL INVESTIMENTI */}
            <Modal show={investmentOpen} onHide={() => setInvestmentOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Aggiungi Investimento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Tipologia</Form.Label>
                            <div>
                                <Form.Check
                                    inline
                                    label="Nuovo"
                                    type="radio"
                                    name="entryType"
                                    id="new"
                                    checked={isNew}
                                    onChange={() => setIsNew(true)}
                                />
                                <Form.Check
                                    inline
                                    label="Esistente"
                                    type="radio"
                                    name="entryType"
                                    id="existing"
                                    checked={!isNew}
                                    onChange={() => setIsNew(false)}
                                />
                            </div>
                        </Form.Group>
                        <Form.Group controlId="date">
                            <Form.Label>Data</Form.Label>
                            <Form.Control
                                type="date"
                                value={investment.date}
                                onChange={(e) => setInvestment({ ...investment, date: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group controlId="amount">
                            <Form.Label>Importo</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Importo"
                                value={investment.amount}
                                onChange={(e) =>
                                    setInvestment({ ...investment, amount: parseFloat(e.target.value) })
                                }
                            />
                        </Form.Group>

                        <Form.Group controlId="type">
                            <Form.Label>Tipo di investimento</Form.Label>
                            <Form.Select
                                value={investment.type}
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    setInvestment({ ...investment, type: newType });
                                }}
                            >
                                <option value="ETF">ETF</option>
                                <option value="Azioni">Azioni</option>
                            </Form.Select>
                        </Form.Group>

                        {isNew ? (
                            <Form.Group controlId="name">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Inserisci il nome dell'investimento"
                                    value={investment.name}
                                    onChange={(e) =>
                                        setInvestment({ ...investment, name: e.target.value })
                                    }
                                />
                            </Form.Group>
                        ) : (
                            <Form.Group controlId="existing-name">
                                <Form.Label>Nome esistente</Form.Label>
                                <Form.Select
                                        value={investment.name}
                                    onChange={(e) =>
                                        setInvestment({ ...investment, name: e.target.value })
                                    }
                                >
                                    <option value="">-- Seleziona --</option>
                                        {uniqueNamesByType(investment.type).map((name, idx) => (
                                        <option key={idx} value={name}>{name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setInvestmentOpen(false)}>Annulla</Button>
                    <Button variant="primary" onClick={handleInvestmentSubmit}>Salva</Button>
                </Modal.Footer>
            </Modal>



            {/* TABELLA */}
            <FinanceTable
                title="Investimenti"
                data={investments}
                loading={loading}
                error={error}
                onAdd={() => setInvestmentOpen(true)}
                onDelete={handleDeleteInvestment}
                columns={[
                    { key: "date", label: "Data" },
                    { key: "type", label: "Tipo" },
                    { key: "name", label: "Nome" },
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
