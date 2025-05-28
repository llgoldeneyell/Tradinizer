import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, useCallback } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { Navbar, Container } from "react-bootstrap";

// Nel tuo componente principale (ad esempio, InvestmentEntry.tsx)
import FinancialChart from './FinancialChart';
import FinanceTable from "./FinanceTable";


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

export default function InvestmentEntry() {
    const [showAddYearModal, setShowAddYearModal] = useState(false);
    const [newYear, setNewYear] = useState(new Date().getFullYear());
    const todayStr = new Date().toISOString().split("T")[0];
    const [isNew, setIsNew] = useState(true); // true = "Nuovo", false = "Esistente"

    const [formData, setFormData] = useState<Investment>({
        date: todayStr,
        amount: 0,
        type: "ETF",
        name: "",
    });

    const [liquidityFormData, setLiquidityFormData] = useState<Liquidity>({
        date: todayStr,
        amount: 0,
    });

    const [open, setOpen] = useState(false);
    const [liquidityOpen, setLiquidityOpen] = useState(false);

    const [investments, setInvestments] = useState<Investment[]>([]);
    const [liquidities, setLiquidities] = useState<Liquidity[]>([]);

    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [years, setYears] = useState([]);

    const loadYears = useCallback(async (retryCount = 0) => {
        try {
            setError(false);
            const response = await fetch(`/investments/years`);
            if (!response.ok) throw new Error("Server error");

            const data = await response.json();
            setYears(data);
        } catch (err) {
            if (retryCount < 5) {
                setTimeout(() => loadYears(retryCount + 1), 1000);
            } else {
                setError(true);
                console.log("Errore nel caricamento:", err);
            }
        }
    }, [year]);


    const [liquidityLoading, setLiquidityLoading] = useState(true);
    const [liquidityError, setLiquidityError] = useState(false);

    const loadInvestments = useCallback(async (retryCount = 0) => {
        try {
            setLoading(true);
            setError(false);
            const response = await fetch(`/investments/${year}`);
            if (!response.ok) throw new Error("Server error");

            const data = await response.json();
            setInvestments(data);
            setLoading(false);
        } catch (err) {
            if (retryCount < 5) {
                setTimeout(() => loadInvestments(retryCount + 1), 1000);
            } else {
                setError(true);
                setLoading(false);
                console.log("Errore nel caricamento:", err);
            }
        }
    }, [year]);

    const loadLiquidity = useCallback(async (retryCount = 0) => {
        try {
            setLiquidityLoading(true);
            setLiquidityError(false);

            const response = await fetch(`/investments/liquidity/${year}`);
            if (!response.ok) throw new Error("Errore nel caricamento della liquidità");

            const data = await response.json();
            setLiquidities(data);
            setLiquidityLoading(false);
        } catch (err) {
            if (retryCount < 5) {
                setTimeout(() => loadLiquidity(retryCount + 1), 1000);
            } else {
                console.error("Errore definitivo nel caricamento della liquidità:", err);
                setLiquidityError(true);
                setLiquidityLoading(false);
            }
        }
    }, [year]);

    useEffect(() => {
        loadInvestments();
        loadLiquidity();
        loadYears();
    }, [loadInvestments, loadLiquidity, loadYears]);

    const handleSubmit = async () => {
        try {
            await fetch("/investments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            setOpen(false);
            loadInvestments();
        } catch (error) {
            console.error("Errore salvataggio investimento:", error);
        }
    };

    const handleLiquiditySubmit = async () => {
        try {
            console.log(liquidityFormData)
            await fetch(`/investments/liquidity`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(liquidityFormData),
            });
            setLiquidityOpen(false);
            loadLiquidity();
        } catch (error) {
            console.error("Errore salvataggio liquidità:", error);
        }
    };

    const handleAddYear = async () => {
        try {
            await fetch(`/investments/setYears/${newYear}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year: newYear })
            });

            setShowAddYearModal(false);
            loadYears();
            setYear(newYear); // imposta subito l’anno nuovo
        } catch (error) {
            console.error("Errore aggiunta anno:", error);
        }
    };

    const handleDeleteInvestment = async (item: Investment) => {
        try {
            await fetch(`/investments/${year}/${item.id}`, {
                method: "DELETE"
            });
            loadInvestments(); // ricarica dopo la cancellazione
        } catch (error) {
            console.error("Errore eliminazione investimento:", error);
        }
    };

    const handleDeleteLiquidity = async (item: Liquidity) => {
        try {
            await fetch(`/investments/liquidity/${year}/${item.id}`, {
                method: "DELETE"
            });
            loadLiquidity(); // ricarica dopo la cancellazione
        } catch (error) {
            console.error("Errore eliminazione liquiditá:", error);
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

    return (
        <div>

            <Navbar bg="light" expand="lg">
                <Container className="d-flex justify-content-between">
                    <Navbar.Brand>Gestione Finanziaria {year}</Navbar.Brand>
                    <div className="d-flex align-items-center gap-2">
                        <Form.Select
                            style={{ width: "auto" }}
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </Form.Select>
                        <Button variant="outline-primary" onClick={() => setShowAddYearModal(true)}>+</Button>
                    </div>
                </Container>
            </Navbar>

            <Modal show={showAddYearModal} onHide={() => setShowAddYearModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Aggiungi Anno</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formNewYear">
                            <Form.Label>Anno</Form.Label>
                            <Form.Control
                                type="number"
                                value={newYear}
                                onChange={(e) => setNewYear(parseInt(e.target.value))}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddYearModal(false)}>
                        Annulla
                    </Button>
                    <Button variant="primary" onClick={handleAddYear}>
                        Aggiungi
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL INVESTIMENTI */}
            <Modal show={open} onHide={() => setOpen(false)}>
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
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group controlId="amount">
                            <Form.Label>Importo</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Importo"
                                value={formData.amount}
                                onChange={(e) =>
                                    setFormData({ ...formData, amount: parseFloat(e.target.value) })
                                }
                            />
                        </Form.Group>

                        <Form.Group controlId="type">
                            <Form.Label>Tipo di investimento</Form.Label>
                            <Form.Select
                                value={formData.type}
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    setFormData({ ...formData, type: newType });
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
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                            </Form.Group>
                        ) : (
                            <Form.Group controlId="existing-name">
                                <Form.Label>Nome esistente</Form.Label>
                                <Form.Select
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                >
                                    <option value="">-- Seleziona --</option>
                                    {uniqueNamesByType(formData.type).map((name, idx) => (
                                        <option key={idx} value={name}>{name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setOpen(false)}>Annulla</Button>
                    <Button variant="primary" onClick={handleSubmit}>Salva</Button>
                </Modal.Footer>
            </Modal>

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

            <div className="container-fluid mt-4">
                <div className="row">
                    {/* GRAFICO A SINISTRA */}
                    <div className="col-lg-6 mb-3">
                        <div className="border rounded p-3 bg-white shadow-sm h-100">
                            <FinancialChart investments={investments} liquidities={liquidities} year={year} />
                        </div>
                    </div>

                    {/* LIQUIDITÀ AL CENTRO */}
                    <div className="col-lg-3 mb-3">
                        <FinanceTable
                            title="Liquidità Giornaliera"
                            data={liquidities}
                            loading={liquidityLoading}
                            error={liquidityError}
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
                    </div>

                    {/* INVESTIMENTI A DESTRA */}
                    <div className="col-lg-3 mb-3">
                        <FinanceTable
                            title="Investimenti"
                            data={investments}
                            loading={loading}
                            error={error}
                            onAdd={() => setOpen(true)}
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
                    </div>
                </div>
            </div>

        </div>
    );
}
