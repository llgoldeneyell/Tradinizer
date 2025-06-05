import { useState, useEffect } from "react";
import { Tab, Nav, Form, Button, Alert } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import HidePasswordInput from '../components/HidePasswordInput';

type HomePageProps = {
    onLogin: (token: string) => void;
};

function HomePage({ onLogin }: HomePageProps) {
    const [activeKey, setActiveKey] = useState("login");

    // Stati login
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);

    // Stati registrazione
    const [registerUsername, setRegisterUsername] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

    const location = useLocation();
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        if (showConfirmation) {
            const url = new URL(window.location.href);
            url.searchParams.delete("emailConfirmed");
            window.history.replaceState({}, document.title, url.toString());
        }
    }, [showConfirmation]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const confirmed = searchParams.get("emailConfirmed");
        if (confirmed === "true") {
            setShowConfirmation(true);
        }
    }, [location.search]);


    // Handle login
    const handleLogin = async () => {
        setLoginError(null);
        try {
            const response = await fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: loginUsername, password: loginPassword }),
            });
            if (!response.ok) {
                console.log(response)
                setLoginError("Login fallito");
                return;
            }
            const data = await response.json();
            if (rememberMe) {
                localStorage.setItem('token', data.token);
            } else {
                sessionStorage.setItem('token', data.token);
            }

            if (data.token) {
                simulateChromeLogin();

                // continua normalmente
                onLogin(data.token);
            } else {
                setLoginError("Token non ricevuto");
            }
        } catch {
            setLoginError("Errore di connessione");
        }
    };

    const simulateChromeLogin = () => {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/fake-login";
        form.style.display = "none";
        form.target = "login-iframe";

        const usernameInput = document.createElement("input");
        usernameInput.name = "username";
        usernameInput.value = loginUsername;
        form.appendChild(usernameInput);

        const passwordInput = document.createElement("input");
        passwordInput.name = "password";
        passwordInput.type = "password";
        passwordInput.value = loginPassword;
        form.appendChild(passwordInput);

        document.body.appendChild(form);

        let iframe = document.getElementById("login-iframe") as HTMLIFrameElement | null;
        if (!iframe) {
            iframe = document.createElement("iframe");
            iframe.name = "login-iframe";
            iframe.style.display = "none";
            iframe.id = "login-iframe";
            document.body.appendChild(iframe);
        }

        form.submit();
        document.body.removeChild(form); // pulizia
    };

    // Handle register
    const handleRegister = async () => {
        setRegisterError(null);
        setRegisterSuccess(null);

        if (registerPassword !== registerConfirmPassword) {
            setRegisterError("Le password non coincidono!");
            return;
        }

        try {
            const response = await fetch("/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: registerUsername,
                    password: registerPassword,
                    email: registerEmail
                }),

            });

            if (!response.ok) {
                const errorData = await response.json();
                setRegisterError(errorData.message || "Registrazione fallita");
                return;
            }

            setRegisterSuccess("Registrazione avvenuta con successo! Controlla la tua email per attivare lÅfaccount.");
            setRegisterUsername("");
            setRegisterEmail("");
            setRegisterPassword("");
            setRegisterConfirmPassword("");
            setActiveKey("login");
        } catch {
            setRegisterError("Errore di connessione o server");
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: "30px auto", padding: "0 30px", height: "100vh" }}>
            {showConfirmation && (
                <Alert variant="success" className="mt-3">
                    Email confermata con successo!
                </Alert>
            )}
            <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k || "login")}>
                <Nav variant="tabs" className="mb-3">
                    <Nav.Item className="w-50 text-center">
                        <Nav.Link eventKey="login" style={{ color: activeKey === "login" ? "blue" : "gray" }}>
                            Login
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className="w-50 text-center">
                        <Nav.Link
                            eventKey="register"
                            style={{ color: activeKey === "register" ? "green" : "gray" }}
                        >
                            Registrati
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    <Tab.Pane eventKey="login">
                        <Form>
                            <Form.Group controlId="loginUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    autoComplete="username"
                                    value={loginUsername}
                                    onChange={(e) => setLoginUsername(e.target.value)}
                                />
                            </Form.Group>

                            <HidePasswordInput
                                id="loginPassword"
                                label="Password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                autoComplete="current-password"
                            />

                            <Form.Group controlId="loginRememberMe" className="mt-3">
                                <Form.Check
                                    type="checkbox"
                                    label="Ricordami"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                            </Form.Group>

                            {loginError && (
                                <Alert variant="danger" className="mt-3">
                                    {loginError}
                                </Alert>
                            )}

                            <Button className="mt-3 w-100" onClick={handleLogin} variant="primary" type="button">
                                Login
                            </Button>
                        </Form>
                    </Tab.Pane>

                    <Tab.Pane eventKey="register">
                        <Form autoComplete="off">
                            <Form.Group controlId="registerUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={registerUsername}
                                    onChange={(e) => setRegisterUsername(e.target.value)}
                                    autoComplete="new-username"
                                />
                            </Form.Group>

                            <Form.Group controlId="registerEmail" className="mt-2">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={registerEmail}
                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                    autoComplete="email"
                                />
                            </Form.Group>


                            <HidePasswordInput
                                id="registerPassword"
                                label="Password"
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                autoComplete="new-password"
                            />

                            <HidePasswordInput
                                id="registerConfirmPassword"
                                label="Password"
                                value={registerConfirmPassword}
                                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                            />

                            {registerError && (
                                <Alert variant="danger" className="mt-3">
                                    {registerError}
                                </Alert>
                            )}

                            {registerSuccess && (
                                <Alert variant="success" className="mt-3">
                                    {registerSuccess}
                                </Alert>
                            )}

                            <Button className="mt-3 w-100" onClick={handleRegister} variant="success" type="button">
                                Registrati
                            </Button>
                        </Form>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </div>
    );
}

export default HomePage;
