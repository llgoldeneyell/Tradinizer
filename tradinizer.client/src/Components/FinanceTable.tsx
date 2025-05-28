import React from "react";
import { Button } from "react-bootstrap";
import { FaTrash } from "react-icons/fa"; // usa react-icons per l’icona

interface Column<T> {
    key: keyof T;
    label: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface FinanceTableProps<T extends object> {
    title: string;
    data: T[];
    columns: Column<T>[];
    loading: boolean;
    error: boolean;
    onAdd: () => void;
    onDelete?: (item: T) => void; // nuova prop per cancellare
}

export default function FinanceTable<T extends object>({
    title,
    data,
    columns,
    loading,
    error,
    onAdd,
    onDelete,
}: FinanceTableProps<T>) {
    return (
        <div style={{ flex: 1 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>{title}</h5>
                <Button variant="outline-primary" size="sm" onClick={onAdd}>
                    Aggiungi
                </Button>
            </div>

            {loading ? (
                <div className="d-flex align-items-center">
                    <div className="spinner-border me-2" role="status" />
                    <span>Caricamento...</span>
                </div>
            ) : error ? (
                <p className="text-danger">Errore nel caricamento dei dati.</p>
            ) : (
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            {columns.map((col) => (<th key={col.key.toString()}>{col.label}</th>))}
                            {onDelete && <th style={{ width: "40px" }}></th>}
                        </tr>
                    </thead>
                        <tbody>
                        {data.map((item, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((col) => (
                                    <td key={col.key.toString()}>
                                        {col.render
                                        ? col.render(item[col.key], item)
                                        : String(item[col.key] ?? '')}
                                    </td>
                                ))}
                                {onDelete && (
                                    <td className="text-center">
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => onDelete(item)}
                                            title="Elimina"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
