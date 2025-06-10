import React from "react";
import { Accordion } from "react-bootstrap";
import { Button } from "react-bootstrap";
import FinanceTable from "./FinanceTable"; // assicurati che il path sia corretto

interface Column<T> {
    key: keyof T;
    label: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface Action<T> {
    icon: React.ReactNode;
    title: string;
    onClick: (item: T) => void;
    variant?: string;
}

interface FinanceAccordionTableProps<T extends { date: string }> {
    data: T[];
    columns: Column<T>[];
    loading: boolean;
    error: boolean;
    actions?: Action<T>[];
    rowKey?: keyof T;

    // Nuove:
    title?: string;
    onAdd?: () => void;
}

export default function FinanceAccordionTable<T extends { date: string }>({
    title,
    data,
    columns,
    loading,
    error,
    onAdd,
    actions,
    rowKey,
}: FinanceAccordionTableProps<T>) {
    // Raggruppa i dati per anno-mese (es: 2024-06)
    const groupedData = data.reduce<Record<string, T[]>>((acc, item) => {
        const date = new Date(item.date);
        if (isNaN(date.getTime())) return acc;

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    // Ordina le chiavi in ordine decrescente
    const sortedKeys = Object.keys(groupedData).sort((a, b) => (a < b ? 1 : -1));

    const formatMonthKey = (key: string) => {
        const [year, month] = key.split("-");
        const date = new Date(Number(year), Number(month) - 1);
        const monthName = date.toLocaleString("it-IT", { month: "long" });
        return monthName.charAt(0).toUpperCase() + monthName.slice(1);
    };

    return (
        <div style={{ flex: 1 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                  {title && <h5 className="mb-0">{title}</h5>}
                  {onAdd && (
                        <Button variant="outline-primary" size="sm" onClick={onAdd}>
                            Aggiungi
                        </Button>
                  )}
            </div>
            <Accordion alwaysOpen>
                {sortedKeys.map((monthKey, index) => (
                    <Accordion.Item eventKey={index.toString()} key={monthKey}>
                        <Accordion.Header>{formatMonthKey(monthKey)}</Accordion.Header>
                        <Accordion.Body>
                            <FinanceTable<T>
                                data={groupedData[monthKey]}
                                columns={columns}
                                loading={loading}
                                error={error}
                                actions={actions}
                                rowKey={rowKey}
                            />
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>

        </div>
    );
}
