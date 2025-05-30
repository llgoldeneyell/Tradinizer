import InvestmentEntry from './Components/InvestmentEntry'; // Importa la HomePage
import { Button, Modal, Form } from "react-bootstrap";
import { Navbar, Container } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import './App.css';

function App() {
    const [showAddYearModal, setShowAddYearModal] = useState(false);
    const [newYear, setNewYear] = useState(new Date().getFullYear());

    const [year, setYear] = useState<number>(new Date().getFullYear());

    const [years, setYears] = useState([]);
    const [error, setError] = useState(false);

    const loadYears = useCallback(async (retryCount = 0) => {
        try {
            setError(false);
            const response = await fetch(`/years`);
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

    const handleAddYear = async () => {
        try {
            await fetch(`/years`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year: newYear })
            });

            setShowAddYearModal(false);
            loadYears();
            setYear(newYear); // imposta subito lfanno nuovo
        } catch (error) {
            console.error("Errore aggiunta anno:", error);
        }
    };

    useEffect(() => {
        loadYears();
    }, [loadYears]);

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

            <InvestmentEntry></InvestmentEntry>
        </div>
    );
}

export default App;