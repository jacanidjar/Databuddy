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
import { Download, Trash2, Table as TableIcon } from "lucide-react";
import { exportTableData, truncateTable } from "./actions";
import { formatNumber } from "@/components/website-event-metrics";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface SystemTable {
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

interface SystemTablesProps {
    tables: SystemTable[];
}

export function SystemTables({ tables }: SystemTablesProps) {
    const [isExporting, setIsExporting] = useState<string | null>(null);
    const [isTruncating, setIsTruncating] = useState<string | null>(null);

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

    const handleTruncate = async (tableName: string) => {
        setIsTruncating(tableName);
        try {
            const { success, error } = await truncateTable(tableName);
            if (!success) {
                console.error('Truncate error:', error);
                return;
            }
            window.location.reload();
        } catch (error) {
            console.error('Truncate failed:', error);
        } finally {
            setIsTruncating(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Tables</CardTitle>
                <CardDescription>
                    Only tables with data are shown. You can export or truncate them.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {filteredTables.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No system tables with data found.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Table</TableHead>
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
                                            <TableIcon className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{table.table}</span>
                                        </div>
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
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={isTruncating === table.table}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Truncate Table</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to truncate the table "{table.table}"?
                                                                        This will permanently delete all data in the table.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleTruncate(table.table)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Truncate
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Truncate Table</p>
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