import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons"; // occhietti

function PasswordInput({
    label,
    value,
    onChange,
    id,
    autoComplete,
}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    id: string;
    autoComplete?: string;
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Form.Group controlId={id} style={{ position: "relative" }}>
            <Form.Label>{label}</Form.Label>
            <div style={{ position: "relative" }}>
                <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    style={{ paddingRight: "2.5rem" }} // spazio per occhietto
                />
                <Button
                    variant="link"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                        position: "absolute",
                        right: "0.5rem",
                        top: 0,
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                        color: "#555",
                        width: "2rem",
                        border: "none",
                    }}
                    tabIndex={-1}
                    type="button"
                    aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </Button>
            </div>
        </Form.Group>

    );
}

export default PasswordInput;
