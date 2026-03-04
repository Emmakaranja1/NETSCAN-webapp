import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Search, 
  Activity, 
  Globe, 
  Shield, 
  Cpu, 
  Database, 
  Server,
  Wifi,
  MapPin,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { IpInfoResponse, LogEntry } from './types';

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IpInfoResponse | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  };

  useEffect(() => {
    addLog('System initialized. NetScan v1.0.4 ready.', 'success');
    addLog('Awaiting target input...', 'info');
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleScan = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) {
      addLog('Error: Target IP or Domain cannot be empty.', 'error');
      return;
    }

    setLoading(true);
    addLog(`Initiating scan sequence for: ${query}`, 'info');
    
    try {
      let result;
      addLog(`Connecting to Primary Node [IPWHOIS]...`, 'info');
      
      const response = await fetch(`https://ipwhois.app/json/${query}`);
      
      if (response.status === 403 || !response.ok) {
        addLog(`Primary Node 403: Access Denied. Initiating Failover...`, 'warning');
        
        // FAILOVER: Try ipapi.co (Alternative Provider)
        addLog(`Connecting to Secondary Node [IPAPI]...`, 'info');
        const fallbackRes = await fetch(`https://ipapi.co/${query}/json/`);
        
        if (!fallbackRes.ok) throw new Error(`FAILOVER_NODE_ERROR_${fallbackRes.status}`);
        
        const fallbackData = await fallbackRes.json();
        // Map fallback data to our standard format
        result = {
          success: !fallbackData.error,
          ip: fallbackData.ip,
          isp: fallbackData.org, // ipapi uses 'org' for ISP
          asn: fallbackData.asn,
          city: fallbackData.city,
          country: fallbackData.country_name,
          type: fallbackData.version,
          continent: fallbackData.continent_code,
          region: fallbackData.region,
          latitude: fallbackData.latitude,
          longitude: fallbackData.longitude,
          timezone: fallbackData.timezone,
          currency: fallbackData.currency
        };
      } else {
        result = await response.json();
      }

      if (result.success) {
        setData(result);
        addLog(`Scan complete. Target ${result.ip} resolved via ${result.isp ? 'Primary' : 'Secondary'} Node.`, 'success');
        addLog(`ISP: ${result.isp} | ASN: ${result.asn}`, 'info');
      } else {
        const reason = result.message || 'Target not found or invalid';
        addLog(`Scan failed: ${reason.toUpperCase()}`, 'error');
        setData(null);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown Connection Error';
      addLog(`Critical System Failure: ${errorMsg.toUpperCase()}`, 'error');
      addLog(`All diagnostic nodes unreachable. Check local firewall.`, 'error');
      console.error('Scan Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#00FF41] p-4 md:p-8 selection:bg-[#00FF41] selection:text-black relative overflow-hidden">
      {/* Scanline Overlay */}
      <div className="fixed inset-0 scan-line opacity-20 pointer-events-none z-50" />
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#00FF41]/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00FF41]/10 rounded-lg terminal-border">
            <Terminal className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-2">
              NETSCAN <span className="text-xs bg-[#00FF41] text-black px-1 font-black">v1.0.4</span>
            </h1>
            <p className="text-[10px] opacity-60 uppercase tracking-widest">Data Centre Operations & Diagnostics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest opacity-80">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
            <span>NBOX1-DC-NODE-01</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input & Logs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Input Section */}
          <section className="bg-[#0A0A0A] p-6 terminal-border rounded-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00FF41]/20" />
            <h2 className="text-xs font-bold mb-4 flex items-center gap-2 opacity-80">
              <Search className="w-3 h-3" /> TARGET_ACQUISITION
            </h2>
            <form onSubmit={handleScan} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ENTER IP OR DOMAIN..."
                  className="w-full bg-black border border-[#00FF41]/30 p-3 pl-4 pr-12 focus:outline-none focus:border-[#00FF41] transition-colors placeholder:opacity-30 text-sm"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#00FF41] hover:text-black transition-colors rounded"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => { setQuery('8.8.8.8'); handleScan(); }}
                  className="text-[10px] border border-[#00FF41]/20 px-2 py-1 hover:bg-[#00FF41]/10 transition-colors"
                >
                  [ GOOGLE_DNS ]
                </button>
                <button 
                  type="button"
                  onClick={() => { setQuery('1.1.1.1'); handleScan(); }}
                  className="text-[10px] border border-[#00FF41]/20 px-2 py-1 hover:bg-[#00FF41]/10 transition-colors"
                >
                  [ CLOUDFLARE ]
                </button>
              </div>
            </form>
          </section>

          {/* Terminal Logs */}
          <section className="bg-[#0A0A0A] terminal-border rounded-sm flex flex-col h-[400px]">
            <div className="p-3 border-b border-[#00FF41]/20 flex items-center justify-between bg-[#0F0F0F]">
              <h2 className="text-[10px] font-bold flex items-center gap-2">
                <Activity className="w-3 h-3" /> SYSTEM_LOGS
              </h2>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-[11px] scrollbar-thin scrollbar-thumb-[#00FF41]/20">
              <AnimatePresence initial={false}>
                {logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3"
                  >
                    <span className="opacity-40 shrink-0">[{log.timestamp}]</span>
                    <span className={cn(
                      "break-all",
                      log.type === 'error' && "text-red-500",
                      log.type === 'success' && "text-[#00FF41]",
                      log.type === 'warning' && "text-yellow-500",
                      log.type === 'info' && "text-[#00FF41]/80"
                    )}>
                      {log.type === 'error' && '! '}
                      {log.type === 'success' && '> '}
                      {log.message}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logEndRef} />
            </div>
          </section>
        </div>

        {/* Right Column: Dashboard Data */}
        <div className="lg:col-span-7 space-y-6">
          {data ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Main Info Card */}
              <div className="md:col-span-2 bg-[#0A0A0A] p-6 terminal-border rounded-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Globe className="w-32 h-32" />
                </div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] opacity-50 uppercase tracking-widest">Primary Address</span>
                    <h3 className="text-4xl font-black tracking-tighter">{data.ip}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] opacity-50 uppercase tracking-widest">Status</span>
                    <div className="flex items-center gap-2 text-[#00FF41]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-bold">ACTIVE</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] opacity-40 uppercase">Type</p>
                    <p className="text-xs font-bold">{data.type || 'IPv4'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] opacity-40 uppercase">Continent</p>
                    <p className="text-xs font-bold">{data.continent}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] opacity-40 uppercase">Region</p>
                    <p className="text-xs font-bold">{data.region}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] opacity-40 uppercase">City</p>
                    <p className="text-xs font-bold">{data.city}</p>
                  </div>
                </div>
              </div>

              {/* Infrastructure Details */}
              <div className="bg-[#0A0A0A] p-5 terminal-border rounded-sm space-y-4">
                <h4 className="text-[10px] font-bold flex items-center gap-2 opacity-60">
                  <Server className="w-3 h-3" /> INFRASTRUCTURE
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-[#00FF41]/10 pb-2">
                    <span className="text-[11px] opacity-50">ISP</span>
                    <span className="text-[11px] font-bold text-right">{data.isp}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#00FF41]/10 pb-2">
                    <span className="text-[11px] opacity-50">ASN</span>
                    <span className="text-[11px] font-bold">{data.asn}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#00FF41]/10 pb-2">
                    <span className="text-[11px] opacity-50">Organization</span>
                    <span className="text-[11px] font-bold text-right">{data.org || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Network Security */}
              <div className="bg-[#0A0A0A] p-5 terminal-border rounded-sm space-y-4">
                <h4 className="text-[10px] font-bold flex items-center gap-2 opacity-60">
                  <Shield className="w-3 h-3" /> SECURITY_CONTEXT
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-[#00FF41]/10 pb-2">
                    <span className="text-[11px] opacity-50">Country</span>
                    <span className="text-[11px] font-bold flex items-center gap-2">
                      {data.country}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#00FF41]/10 pb-2">
                    <span className="text-[11px] opacity-50">Timezone</span>
                    <span className="text-[11px] font-bold">{data.timezone}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#00FF41]/10 pb-2">
                    <span className="text-[11px] opacity-50">Currency</span>
                    <span className="text-[11px] font-bold">{data.currency}</span>
                  </div>
                </div>
              </div>

              {/* Geo Mapping (Visual Placeholder) */}
              <div className="md:col-span-2 bg-[#0A0A0A] p-5 terminal-border rounded-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-bold flex items-center gap-2 opacity-60">
                    <MapPin className="w-3 h-3" /> GEOGRAPHIC_COORDINATES
                  </h4>
                  <span className="text-[10px] font-mono opacity-50">
                    LAT: {data.latitude} | LON: {data.longitude}
                  </span>
                </div>
                <div className="h-32 bg-black border border-[#00FF41]/10 rounded relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="grid grid-cols-12 h-full">
                      {Array.from({ length: 144 }).map((_, i) => (
                        <div key={i} className="border-[0.5px] border-[#00FF41]/20" />
                      ))}
                    </div>
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-4 h-4 bg-[#00FF41] rounded-full animate-ping absolute" />
                    <div className="w-4 h-4 bg-[#00FF41] rounded-full relative" />
                    <span className="text-[8px] mt-2 font-bold tracking-widest">TARGET_LOCATED</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-[#00FF41]/20 rounded-sm">
              <div className="p-4 bg-[#00FF41]/5 rounded-full mb-4">
                <Cpu className="w-12 h-12 opacity-20" />
              </div>
              <h3 className="text-lg font-bold mb-2 opacity-40">NO ACTIVE SCAN DATA</h3>
              <p className="text-xs opacity-30 max-w-xs">Enter a target IP or domain in the acquisition module to begin diagnostic sequence.</p>
              
              <div className="mt-8 grid grid-cols-3 gap-8 opacity-20">
                <div className="flex flex-col items-center gap-2">
                  <Wifi className="w-6 h-6" />
                  <span className="text-[8px]">NETWORK</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Database className="w-6 h-6" />
                  <span className="text-[8px]">DATABASE</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Shield className="w-6 h-6" />
                  <span className="text-[8px]">SECURITY</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-12 pt-4 border-t border-[#00FF41]/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] uppercase tracking-[0.2em] opacity-40">
        <p>©  Data Centre Operations </p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#00FF41] transition-colors">Documentation</a>
          <a href="#" className="hover:text-[#00FF41] transition-colors">SOP_V1.2</a>
          <a href="#" className="hover:text-[#00FF41] transition-colors">Security_Policy</a>
        </div>
      </footer>
    </div>
  );
}

