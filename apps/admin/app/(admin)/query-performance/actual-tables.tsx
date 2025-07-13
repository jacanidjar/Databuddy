"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Table as TableIcon, Database } from "lucide-react";
import { exportTableData } from "./actions";
import { formatNumber } from "@/components/website-event-metrics";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / (k ** i)).toFixed(2))} ${sizes[i]}`;
};

const downloadCSV = (csvData: string, filename: string) => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};

interface ActualTable {
    database: string;
    table: string;
    engine: string;
    total_rows: number | null;
    total_bytes: number | null;
    readable_size: string;
    partition_key: string;
    sorting_key: string;
    primary_key: string;
    comment: string;
}

interface ActualTablesProps {
    tables: ActualTable[];
}

export function ActualTables({ tables }: ActualTablesProps) {
    const [isExporting, setIsExporting] = useState<string | null>(null);

    // Only show tables with data
    const filteredTables = tables.filter(
        (t) => (t.total_rows ?? 0) > 0 || (t.total_bytes ?? 0) > 0
    );

    const handleExport = async (tableName: string) => {
        setIsExporting(tableName);
        try {
            const { csvData, error } = await exportTableData(tableName);
            if (error) {
                console.error('Export error:', error);
                return;
            }
            downloadCSV(csvData, `${tableName}_export.csv`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Actual Database Tables</CardTitle>
                <CardDescription>
                    Your application's database tables with size and row counts. Only tables with data are shown.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {filteredTables.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No database tables with data found.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Database</TableHead>
                                <TableHead>Table</TableHead>
                                <TableHead className="text-center">Engine</TableHead>
                                <TableHead className="text-center">Size</TableHead>
                                <TableHead className="text-center">Rows</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTables.map((table) => (
                                <TableRow key={`${table.database}-${table.table}`}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Database className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="outline" className="text-xs">
                                                {table.database}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <TableIcon className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{table.table}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="text-xs">
                                            {table.engine}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="font-semibold">
                                            {formatBytes(table.total_bytes ?? 0)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="font-semibold">
                                            {formatNumber(table.total_rows ?? 0)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleExport(table.table)}
                                                            disabled={isExporting === table.table}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Export Table Data</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
} 