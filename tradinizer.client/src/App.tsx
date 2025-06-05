import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import { Button, Modal, Form } from "react-bootstrap";
import { Navbar, Container } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import './App.css';

let tokenMissingLogged = false;  // variabile esterna al componente/funzione

const getToken = (): string | null => {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
};

function App() {
    const [token, setToken] = useState<string | null>(null);

    const [showAddYearModal, setShowAddYearModal] = useState(false);
    const [newYear, setNewYear] = useState(new Date().getFullYear());

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [years, setYears] = useState([]);
    const [error, setError] = useState(false);

    const loadYears = useCallback(async (retryCount = 0) => {
        try {
            setError(false);
            const token = getToken();  // Recupera il token salvato

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
            const token = getToken();  
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

    const handleDeleteYear = async () => {
        try {
            const token = getToken();  
            const response = await fetch(`/year/${year}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            setShowDeleteConfirm(false);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Errore durante l'eliminazione:", response.status, errorText);
                return;
            }

            // Ricarica gli anni e aggiorna l'anno attivo (ad esempio al più recente)
            await loadYears();
            if (years.length > 1) {
                const remainingYears = years.filter(y => y !== year);
                const mostRecent = Math.max(...remainingYears);
                setYear(mostRecent);
            } else {
                setYear(new Date().getFullYear());
            }

        } catch (error) {
            console.error("Errore eliminazione anno:", error);
        }
    };

    useEffect(() => {
        loadYears();
    }, [loadYears, token]);

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
                                <Button variant="outline-danger" onClick={() => setShowDeleteConfirm(true)}>-</Button>
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

            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Conferma Eliminazione</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Sei sicuro di voler eliminare l’anno <strong>{year}</strong>? Questa azione non è reversibile.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                        Annulla
                    </Button>
                    <Button variant="danger" onClick={handleDeleteYear}>
                        Elimina
                    </Button>
                </Modal.Footer>
            </Modal>


            {error && (
                <div style={{ color: "red", margin: "1em 0" }}>
                    Errore nel caricamento degli anni. Riprova più tardi.
                </div>
            )}

            {token ? (
                /*<InvestmentEntry />*/
                <Dashboard year={year} token={token} />
            ) : (
                <HomePage onLogin={(newToken) => setToken(newToken)} />
            )}
        </div>
    );
}

export default App;