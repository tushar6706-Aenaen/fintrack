import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

export default function SupabaseDebug() {
    const [connectionStatus, setConnectionStatus] = useState('Testing...');
    const [user, setUser] = useState(null);
    const [tables, setTables] = useState([]);

    useEffect(() => {
        testConnection();
        checkAuth();
    }, []);

    const testConnection = async () => {
        try {
            const { data, error } = await supabase
                .from('savings_goals')
                .select('count', { count: 'exact', head: true });
            
            if (error) {
                setConnectionStatus(`❌ Error: ${error.message}`);
            } else {
                setConnectionStatus('✅ Connected to Supabase');
            }
        } catch (err) {
            setConnectionStatus(`❌ Connection failed: ${err.message}`);
        }
    };

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    };

    const testTables = async () => {
        const tablesToTest = ['savings_goals', 'expenses', 'categories', 'budgets'];
        const results = [];

        for (const table of tablesToTest) {
            try {
                const { data, error, count } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                
                results.push({
                    table,
                    status: error ? `❌ ${error.message}` : `✅ ${count || 0} rows`,
                    accessible: !error
                });
            } catch (err) {
                results.push({
                    table,
                    status: `❌ ${err.message}`,
                    accessible: false
                });
            }
        }
        setTables(results);
    };

    return (
        <Card className="max-w-2xl mx-auto bg-zinc-900 border-zinc-800">
            <CardHeader>
                <CardTitle className="text-zinc-50">Supabase Debug Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="text-zinc-300 font-medium mb-2">Connection Status</h3>
                    <p className="text-sm text-zinc-400">{connectionStatus}</p>
                </div>

                <div>
                    <h3 className="text-zinc-300 font-medium mb-2">Authentication</h3>
                    <p className="text-sm text-zinc-400">
                        {user ? `✅ Logged in as: ${user.email}` : '❌ Not authenticated'}
                    </p>
                    {user && (
                        <p className="text-xs text-zinc-500 mt-1">User ID: {user.id}</p>
                    )}
                </div>

                <div>
                    <h3 className="text-zinc-300 font-medium mb-2">Database Tables</h3>
                    <Button onClick={testTables} className="mb-3 bg-blue-600 text-white text-sm">
                        Test Table Access
                    </Button>
                    {tables.length > 0 && (
                        <div className="space-y-1">
                            {tables.map((table) => (
                                <div key={table.table} className="text-sm">
                                    <span className="text-zinc-300">{table.table}:</span>{' '}
                                    <span className="text-zinc-400">{table.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-zinc-300 font-medium mb-2">Environment</h3>
                    <p className="text-xs text-zinc-500">
                        Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
                    </p>
                    <p className="text-xs text-zinc-500">
                        Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
