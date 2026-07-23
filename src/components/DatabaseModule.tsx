import React, { useState, useEffect } from 'react';
import { Database, Terminal, Play, AlertCircle, CheckCircle, RefreshCw, Layers, Table, FileSpreadsheet } from 'lucide-react';
import { DBTable } from '../types';

export default function DatabaseModule() {
  const [tables, setTables] = useState<DBTable[]>([]);
  const [activeTable, setActiveTable] = useState<string>('users');
  const [query, setQuery] = useState<string>('SELECT * FROM users');
  const [queryOutput, setQueryOutput] = useState<{
    success: boolean;
    message: string;
    data?: any[];
    columns?: any[];
    error?: string;
  } | null>(null);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Fetch Database Metadata
  const fetchDatabaseInfo = async () => {
    setIsLoadingTables(true);
    try {
      const response = await fetch('/api/db/tables');
      const data = await response.json();
      if (response.ok && data.tables) {
        setTables(data.tables);
        // Default to first table if active deleted
        if (data.tables.length > 0 && !data.tables.find((t: any) => t.name === activeTable)) {
          setActiveTable(data.tables[0].name);
        }
      }
    } catch (err) {
      console.error('Error fetching database info:', err);
    } finally {
      setIsLoadingTables(false);
    }
  };

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  // Execute SQL Query
  const executeQuery = async (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = directQuery || query;
    if (!finalQuery.trim()) return;

    setIsExecuting(true);
    setQueryOutput(null);

    try {
      const startTime = performance.now();
      const response = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: finalQuery }),
      });
      const data = await response.json();
      const duration = (performance.now() - startTime).toFixed(2);

      if (response.ok && data.success) {
        setQueryOutput({
          success: true,
          message: `${data.message} (Elapsed: ${duration}ms)`,
          data: data.data,
          columns: data.columns,
        });
        // Refresh tables sidebar
        await fetchDatabaseInfo();
      } else {
        setQueryOutput({
          success: false,
          message: `Query failed`,
          error: data.error || 'Syntax or relational error occurred.',
        });
      }
    } catch (err: any) {
      setQueryOutput({
        success: false,
        message: 'Network execution failed',
        error: err.message,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getActiveTableRows = () => {
    const table = tables.find((t) => t.name === activeTable);
    return table ? table.rows : [];
  };

  const getActiveTableColumns = () => {
    const table = tables.find((t) => t.name === activeTable);
    return table ? table.columns : [];
  };

  return (
    <div id="database-module-container" className="h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Upper Header panel */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 text-amber-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              Oggy Sandbox Database Manager <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-500/20">SQLite C-Sandbox</span>
            </h3>
            <p className="text-xs text-slate-400">Fully compliant schema, execution loggers, and tabular browsers</p>
          </div>
        </div>
        <button
          onClick={fetchDatabaseInfo}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg transition-all"
          title="Refresh Schemas"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main content body splits - schemas vs visual workspace query area */}
      <div className="flex-1 flex min-h-0">
        
        {/* Tables & Schema list sidebar */}
        <div className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col">
          <div className="p-3 border-b border-slate-800 bg-slate-950/20">
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-400 flex items-center gap-2 uppercase">
              <Layers className="w-4 h-4 text-amber-400/80" /> active schemas
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoadingTables ? (
              <div className="text-center py-4 text-xs font-mono text-slate-500 animate-pulse">
                Scanning engine tables...
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-4 text-xs font-mono text-slate-500">
                No active schemas. Create your first table in the query field.
              </div>
            ) : (
              tables.map((table) => (
                <div
                  key={table.name}
                  onClick={() => setActiveTable(table.name)}
                  className={`flex flex-col p-2.5 rounded-lg cursor-pointer transition-all border ${
                    activeTable === table.name
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/40 hover:text-slate-100 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Table className="w-4 h-4 shrink-0" />
                    <span>{table.name}</span>
                    <span className="ml-auto bg-slate-800 text-[9px] px-1.5 py-0.2 rounded border border-slate-700 text-slate-400">
                      {table.rowCount} rows
                    </span>
                  </div>
                  <div className="mt-1.5 pl-6 space-y-0.5 border-l border-slate-800/80">
                    {table.columns.map((col) => (
                      <div key={col.name} className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
                        <span>{col.name}</span>
                        <span>{col.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Console and tables workspace */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
          
          {/* Query Console container */}
          <div className="p-3 bg-slate-900/40 border-b border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" /> SQL QUERY CONSOLE
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">PRESETS:</span>
                <button
                  onClick={() => {
                    setQuery('SELECT * FROM users');
                    executeQuery(undefined, 'SELECT * FROM users');
                  }}
                  className="text-[10px] font-mono text-amber-400 hover:underline"
                >
                  Get Users
                </button>
                <button
                  onClick={() => {
                    setQuery("INSERT INTO users (name, email, role) VALUES ('Ramesh', 'ramesh@studio.ai', 'Intern')");
                  }}
                  className="text-[10px] font-mono text-amber-400 hover:underline"
                >
                  Insert User
                </button>
                <button
                  onClick={() => {
                    setQuery('CREATE TABLE loggers (id INTEGER PRIMARY KEY, event TEXT, value REAL)');
                  }}
                  className="text-[10px] font-mono text-amber-400 hover:underline"
                >
                  Create Table
                </button>
              </div>
            </div>
            
            <form onSubmit={executeQuery} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Write your SQLite compliant queries e.g. SELECT * FROM projects..."
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500/50 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
              />
              <button
                type="submit"
                disabled={isExecuting}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/5 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                {isExecuting ? 'RUNNING...' : 'EXECUTE'}
              </button>
            </form>
          </div>

          {/* Lower Pane splits query output console logs vs visual table explorer grids */}
          <div className="flex-1 flex flex-col min-h-0">
            {queryOutput && (
              <div className="p-3 border-b border-slate-800 bg-slate-900/20 max-h-48 overflow-y-auto font-mono text-xs">
                {queryOutput.success ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                      <CheckCircle className="w-4 h-4" /> SUCCESS: {queryOutput.message}
                    </span>
                    {queryOutput.data && queryOutput.data.length > 0 && (
                      <div className="overflow-x-auto border border-slate-800/80 rounded mt-1">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-900/60 border-b border-slate-850">
                              {Object.keys(queryOutput.data[0]).map((col) => (
                                <th key={col} className="p-2 text-slate-400 text-[10px] border-r border-slate-850">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryOutput.data.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-slate-850 last:border-none">
                                {Object.values(row).map((val: any, cIdx) => (
                                  <th key={cIdx} className="p-2 text-slate-300 font-normal text-[10px] border-r border-slate-850">
                                    {String(val)}
                                  </th>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-rose-400 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">ERROR: {queryOutput.message}</span>
                      <p className="text-slate-400 text-[11px] mt-1">{queryOutput.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Visual Table explorer grid for selected active table */}
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                  Data Browser: {activeTable}
                </span>
              </div>
              
              <div className="flex-1 overflow-auto border border-slate-800 rounded-lg bg-slate-900/20">
                {getActiveTableRows().length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                    No records found for '{activeTable}'.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800">
                        {getActiveTableColumns().map((col) => (
                          <th key={col.name} className="p-3 text-slate-300 font-mono border-r border-slate-800 last:border-r-0">
                            <div className="flex flex-col">
                              <span className="font-bold">{col.name}</span>
                              <span className="text-[9px] text-slate-500 font-normal">{col.type}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getActiveTableRows().map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/40">
                          {getActiveTableColumns().map((col) => (
                            <td key={col.name} className="p-3 text-slate-300 font-mono border-r border-slate-850 last:border-r-0">
                              {row[col.name] !== null ? String(row[col.name]) : <span className="text-slate-600">NULL</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
