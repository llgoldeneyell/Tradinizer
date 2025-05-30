import InvestmentEntry from './Components/InvestmentEntry'; // Importa la HomePage
import HomePage from './Components/HomePage';

import { Button, Modal, Form } from "react-bootstrap";
import { Navbar, Container } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import './App.css';

function App() {
    const [token, setToken] = useState<string | null>(null);
    //// Stato token (inizializzato da sessionStorage)
    //const [token, setToken] = useState(sessionStorage.getItem('token'));

    const [showAddYearModal, setShowAddYearModal] = useState(false);
    const [newYear, setNewYear] = useState(new Date().getFullYear());

    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [years, setYears] = useState([]);
    const [error, setError] = useState(false);

    //// Stati per Login e Register Modal
    //const [showLoginModal, setShowLoginModal] = useState(false);
    //const [showRegisterModal, setShowRegisterModal] = useState(false);

    //// Login form states
    //const [loginUsername, setLoginUsername] = useState('');
    //const [loginPassword, setLoginPassword] = useState('');
    //const [loginError, setLoginError] = useState<string | null>(null);

    //// Register form states
    //const [registerUsername, setRegisterUsername] = useState('');
    //const [registerPassword, setRegisterPassword] = useState('');
    //const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
    //const [registerError, setRegisterError] = useState<string | null>(null);
    //const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

    const loadYears = useCallback(async (retryCount = 0) => {
        try {
            setError(false);
            const token = sessionStorage.getItem('token');  // Recupera il token salvato

            const response = await fetch(`/years`, {
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
            await fetch(`/years`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ year: newYear })
            });

            setShowAddYearModal(false);
            loadYears();
            setYear(newYear); // imposta subito l’anno nuovo
        } catch (error) {
            console.error("Errore aggiunta anno:", error);
        }
    };

    //// Login handler
    //const handleLogin = async () => {
    //    setLoginError(null);
    //    // qui fai la chiamata POST al backend per login
    //    // esempio semplificato:
    //    try {
    //        const response = await fetch('/auth/login', {
    //            method: 'POST',
    //            headers: { "Content-Type": "application/json" },
    //            body: JSON.stringify({ username: loginUsername, password: loginPassword }),
    //        });
    //        if (!response.ok) throw new Error('Login fallito');
    //        const data = await response.json();
    //        sessionStorage.setItem('token', data.token);
    //        setToken(data.token); // <-- aggiorna lo stato token qui
    //        setLoginError(null);
    //        // salva token e aggiorna stato utente qui
    //    } catch (error) {
    //        setLoginError('Credenziali non corrette');
    //    }
    //};

    //// Se vuoi, aggiungi anche logout:
    //const handleLogout = () => {
    //    sessionStorage.removeItem('token');
    //    setToken(null);
    //};

    //// Register handler
    //const handleRegister = async (username: string, password: string, confirmPassword: string) => {
    //    setRegisterError(null);
    //    setRegisterSuccess(null);
    //    if (password !== confirmPassword) {
    //        setRegisterError('Le password non coincidono!');
    //        return;
    //    }
    //    try {
    //        const response = await fetch('/auth/register', {
    //            method: 'POST',
    //            headers: { 'Content-Type': 'application/json' },
    //            body: JSON.stringify({ username, password }),
    //        });
    //        if (!response.ok) {
    //            const errorData = await response.json();
    //            setRegisterError(errorData.message || 'Registrazione fallita');
    //            return;
    //        }
    //        setRegisterSuccess('Registrazione avvenuta con successo, puoi fare login.');
    //    } catch {
    //        setRegisterError('Errore di connessione o server');
    //    }
    //};

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

            {/* Modal Login */}
            {/*<Modal show={showLoginModal} onHide={() => setShowLoginModal(false)}>*/}
            {/*    <Modal.Header closeButton>*/}
            {/*        <Modal.Title>Login</Modal.Title>*/}
            {/*    </Modal.Header>*/}
            {/*    <Modal.Body>*/}
            {/*        <Form>*/}
            {/*            <Form.Group controlId="loginUsername">*/}
            {/*                <Form.Label>Username</Form.Label>*/}
            {/*                <Form.Control*/}
            {/*                    type="text"*/}
            {/*                    value={loginUsername}*/}
            {/*                    onChange={(e) => setLoginUsername(e.target.value)}*/}
            {/*                />*/}
            {/*            </Form.Group>*/}
            {/*            <Form.Group controlId="loginPassword" className="mt-2">*/}
            {/*                <Form.Label>Password</Form.Label>*/}
            {/*                <Form.Control*/}
            {/*                    type="password"*/}
            {/*                    value={loginPassword}*/}
            {/*                    onChange={(e) => setLoginPassword(e.target.value)}*/}
            {/*                />*/}
            {/*            </Form.Group>*/}
            {/*        </Form>*/}
            {/*    </Modal.Body>*/}
            {/*    <Modal.Footer>*/}
            {/*        <Button variant="secondary" onClick={() => setShowLoginModal(false)}>*/}
            {/*            Annulla*/}
            {/*        </Button>*/}
            {/*        <Button variant="primary" onClick={handleLogin}>*/}
            {/*            Login*/}
            {/*        </Button>*/}
            {/*    </Modal.Footer>*/}
            {/*</Modal>*/}

            {/* Modal Register */}
            {/*<Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)}>*/}
            {/*    <Modal.Header closeButton>*/}
            {/*        <Modal.Title>Register</Modal.Title>*/}
            {/*    </Modal.Header>*/}
            {/*    <Modal.Body>*/}
            {/*        <Form>*/}
            {/*            <Form.Group controlId="registerUsername">*/}
            {/*                <Form.Label>Username</Form.Label>*/}
            {/*                <Form.Control*/}
            {/*                    type="text"*/}
            {/*                    value={registerUsername}*/}
            {/*                    onChange={(e) => setRegisterUsername(e.target.value)}*/}
            {/*                />*/}
            {/*            </Form.Group>*/}
            {/*            <Form.Group controlId="registerPassword" className="mt-2">*/}
            {/*                <Form.Label>Password</Form.Label>*/}
            {/*                <Form.Control*/}
            {/*                    type="password"*/}
            {/*                    value={registerPassword}*/}
            {/*                    onChange={(e) => setRegisterPassword(e.target.value)}*/}
            {/*                />*/}
            {/*            </Form.Group>*/}
            {/*            <Form.Group controlId="registerConfirmPassword" className="mt-2">*/}
            {/*                <Form.Label>Conferma Password</Form.Label>*/}
            {/*                <Form.Control*/}
            {/*                    type="password"*/}
            {/*                    value={registerConfirmPassword}*/}
            {/*                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}*/}
            {/*                />*/}
            {/*            </Form.Group>*/}
            {/*        </Form>*/}

            {/*        */}{/* Qui i messaggi di errore / successo */}
            {/*        {registerError && (*/}
            {/*            <div className="alert alert-danger mt-3" role="alert">*/}
            {/*                {registerError}*/}
            {/*            </div>*/}
            {/*        )}*/}
            {/*        {registerSuccess && (*/}
            {/*            <div className="alert alert-success mt-3" role="alert">*/}
            {/*                {registerSuccess}*/}
            {/*            </div>*/}
            {/*        )}*/}
            {/*    </Modal.Body>*/}
            {/*    <Modal.Footer>*/}
            {/*        <Button variant="secondary" onClick={() => setShowRegisterModal(false)}>*/}
            {/*            Annulla*/}
            {/*        </Button>*/}
            {/*        <Button variant="primary" onClick={handleRegister}>*/}
            {/*            Register*/}
            {/*        </Button>*/}
            {/*    </Modal.Footer>*/}
            {/*</Modal>*/}

            {token ? (
                <InvestmentEntry />
            ) : (
                <HomePage onLogin={(newToken) => setToken(newToken)} />
            )}
        </div>
    );
}

export default App;