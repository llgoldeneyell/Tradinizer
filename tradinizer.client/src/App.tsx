import HomePage from './pages/HomePage';
import { Button, Modal, Form } from "react-bootstrap";
import { Navbar, Container } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import './App.css';

let tokenMissingLogged = false;  // variabile esterna al componente/funzione

function App() {
    const [token, setToken] = useState<string | null>(null);

    const [showAddYearModal, setShowAddYearModal] = useState(false);
    const [newYear, setNewYear] = useState(new Date().getFullYear());

    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [years, setYears] = useState([]);
    const [error, setError] = useState(false);

    const loadYears = useCallback(async (retryCount = 0) => {
        try {
            setError(false);
            const token = sessionStorage.getItem('token');  // Recupera il token salvato

            if (!token) {
                if (!tokenMissingLogged) {
                    console.log("Token non presente");
                    tokenMissingLogged = true;
                }
                return; // esce senza fare la chiamata
            }

            // Reset della variabile nel caso successivo il token venga settato
            tokenMissingLogged = false;

            const response = await fetch(`/year`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
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
            const token = sessionStorage.getItem('token');
            const response = await fetch(`/year`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ year: newYear })
            });

            setShowAddYearModal(false);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Errore risposta server:", response.status, errorText);
                return;
            }
            loadYears();
            setYear(newYear); // imposta subito l’anno nuovo
        } catch (error) {
            console.error("Errore aggiunta anno:", error);
        }
    };

    useEffect(() => {
        loadYears();
    }, [loadYears]);

    useEffect(() => {
        const storedToken = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (storedToken) setToken(storedToken);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        setToken(null);
    };

    return (
        <div>
            <Navbar bg="light" expand="lg">
                <Container className="d-flex justify-content-between">
                    <Navbar.Brand>Gestione Finanziaria {year}</Navbar.Brand>
                    <div className="d-flex align-items-center gap-2">
                        {/* MOSTRA solo se c’è il token */}
                        {token && (
                            <>
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
                                <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
                            </>
                        )}
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

            <HomePage onLogin={(newToken) => setToken(newToken)} />

            {/*{token ? (*/}
            {/*    /* <InvestmentEntry />*/}
            {/*    /*<Dashboard year={year} />*/}
            {/*) : (*/}
            {/*    <HomePage onLogin={(newToken) => setToken(newToken)} />*/}
            {/*)}*/}
        </div>
    );
}

export default App;