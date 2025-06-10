import React from "react";
import { Button } from "react-bootstrap";
//import { FaTrash } from "react-icons/fa"; // usa react-icons per lficona

interface Column<T> {
    key: keyof T;
    label: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface Action<T> {
    icon: React.ReactNode;
    title: string;
    onClick: (item: T) => void;
    variant?: string; // es. "outline-primary", "danger", ecc.
}

interface FinanceTableProps<T extends object> {
    title: string;
    data: T[];
    columns: Column<T>[];
    loading: boolean;
    error: boolean;
    onAdd: () => void;
    //onDelete?: (item: T) => void; // nuova prop per cancellare
    rowKey?: keyof T;
    actions?: Action<T>[]
}

export default function FinanceTable<T extends object>({
    title,
    data,
    columns,
    loading,
    error,
    onAdd,
    //onDelete,
    rowKey,
    actions
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
            ) : data.length === 0 ? (
                <p className="text-muted">Nessun dato disponibile.</p>
                    ) : (
                        <table className="table table-bordered table-sm align-middle" aria-label={title}>
                    <thead>
                        <tr>
                                        {columns.map((col) => (<th key={col.key.toString()}>{col.label}</th>))}
                                        {(actions?.length ?? 0) > 0 && <th style={{ width: "1%" }}></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, rowIndex) => (
                            <tr key={rowKey && item[rowKey] !== undefined ? String(item[rowKey]) : rowIndex}>
                                {columns.map((col) => (
                                    <td key={col.key.toString()}>
                                        {col.render
                                            ? col.render(item[col.key], item)
                                            : String(item[col.key] ?? '')}
                                    </td>
                                ))}

                                {actions && actions.length > 0 && (
                                    <td className="text-center">
                                        {actions.map((action, i) => (
                                            <Button
                                                key={i}
                                                variant={action.variant || 'outline-secondary'}
                                                size="sm"
                                                onClick={() => action.onClick(item)}
                                                title={action.title}
                                                aria-label={action.title}
                                                className="me-1"
                                            >
                                                {action.icon}
                                            </Button>
                                        ))}
                                    </td>
                                )}

                                {/*{onDelete && (*/}
                                {/*    <td className="text-center">*/}
                                {/*        <Button*/}
                                {/*            variant="outline-danger"*/}
                                {/*            size="sm"*/}
                                {/*            onClick={() => onDelete(item)}*/}
                                {/*            title="Elimina"*/}
                                {/*            aria-label="Elimina riga"*/}
                                {/*        >*/}
                                {/*            <FaTrash />*/}
                                {/*        </Button>*/}
                                {/*    </td>*/}
                                {/*)}*/}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
