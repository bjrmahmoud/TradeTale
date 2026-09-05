// Generates high-fidelity SVG candlestick charts encoded as Data URLs
// Visualizes realistic pre-trade theses (entry, stop, target lines) and post-trade executions

export function generatePreTradeChartSvg(params: {
  ticker: string;
  timeframe: string;
  direction: 'long' | 'short';
  entry: number;
  stop: number;
  target: number;
  setupName: string;
}): string {
  const { ticker, timeframe, direction, entry, stop, target, setupName } = params;
  const isLong = direction === 'long';

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="100%" height="100%" style="background-color: #0d131f;">
  <defs>
    <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#161f30" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#0b0f17" stop-opacity="0.8"/>
    </linearGradient>
    <linearGradient id="targetZone" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.05"/>
    </linearGradient>
    <linearGradient id="stopZone" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ef4444" stop-opacity="0.05"/>
    </linearGradient>
  </defs>

  <!-- Canvas Background -->
  <rect width="1200" height="675" fill="#0c121e"/>

  <!-- Horizontal Grid Lines -->
  <line x1="60" y1="120" x2="1140" y2="120" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="60" y1="220" x2="1140" y2="220" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="60" y1="320" x2="1140" y2="320" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="60" y1="420" x2="1140" y2="420" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="60" y1="520" x2="1140" y2="520" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>

  <!-- Vertical Grid Lines -->
  <line x1="240" y1="60" x2="240" y2="580" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="440" y1="60" x2="440" y2="580" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="640" y1="60" x2="640" y2="580" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="840" y1="60" x2="840" y2="580" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="1040" y1="60" x2="1040" y2="580" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>

  <!-- FVG / Liquidity Sweep Zone -->
  <rect x="360" y="300" width="340" height="70" fill="#3b82f6" fill-opacity="0.12" stroke="#3b82f6" stroke-dasharray="4 2" stroke-width="1"/>
  <text x="375" y="325" fill="#60a5fa" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600">4H FAIR VALUE GAP (FVG)</text>

  <!-- Pre-Trade Candles leading to thesis -->
  <!-- Candle 1 (Bearish) -->
  <line x1="120" y1="210" x2="120" y2="340" stroke="#ef4444" stroke-width="1.5"/>
  <rect x="113" y="240" width="14" height="70" fill="#ef4444" rx="1"/>

  <!-- Candle 2 (Bearish) -->
  <line x1="160" y1="280" x2="160" y2="390" stroke="#ef4444" stroke-width="1.5"/>
  <rect x="153" y="295" width="14" height="80" fill="#ef4444" rx="1"/>

  <!-- Candle 3 (Doji Pullback) -->
  <line x1="200" y1="350" x2="200" y2="430" stroke="#94a3b8" stroke-width="1.5"/>
  <rect x="193" y="380" width="14" height="12" fill="#94a3b8" rx="1"/>

  <!-- Candle 4 (Deep Sweep wick) -->
  <line x1="240" y1="360" x2="240" y2="470" stroke="#10b981" stroke-width="1.5"/>
  <rect x="233" y="370" width="14" height="45" fill="#10b981" rx="1"/>

  <!-- Candle 5 (Bullish Rejection) -->
  <line x1="280" y1="330" x2="280" y2="420" stroke="#10b981" stroke-width="1.5"/>
  <rect x="273" y="340" width="14" height="60" fill="#10b981" rx="1"/>

  <!-- Candle 6 (Confirmation) -->
  <line x1="320" y1="290" x2="320" y2="380" stroke="#10b981" stroke-width="1.5"/>
  <rect x="313" y="300" width="14" height="70" fill="#10b981" rx="1"/>

  <!-- Candle 7 (Setup Retest) -->
  <line x1="360" y1="310" x2="360" y2="390" stroke="#ef4444" stroke-width="1.5"/>
  <rect x="353" y="325" width="14" height="40" fill="#ef4444" rx="1"/>

  <!-- Candle 8 (Entry Invalidation Pinbar) -->
  <line x1="400" y1="310" x2="400" y2="415" stroke="#10b981" stroke-width="1.5"/>
  <rect x="393" y="320" width="14" height="35" fill="#10b981" rx="1"/>

  <!-- Planned Setup Horizon Box -->
  <!-- Target Box -->
  <rect x="420" y="${isLong ? 150 : 490}" width="420" height="${isLong ? 180 : 160}" fill="url(#targetZone)" rx="4"/>
  <!-- Stop Box -->
  <rect x="420" y="${isLong ? 330 : 250}" width="420" height="80" fill="url(#stopZone)" rx="4"/>

  <!-- Target Level Line -->
  <line x1="410" y1="${isLong ? 150 : 570}" x2="840" y2="${isLong ? 150 : 570}" stroke="#10b981" stroke-width="2.5" stroke-dasharray="6 3"/>
  <rect x="850" y="${isLong ? 136 : 556}" width="160" height="28" fill="#065f46" rx="4" stroke="#10b981" stroke-width="1"/>
  <text x="860" y="${isLong ? 155 : 575}" fill="#6ee7b7" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700">TARGET: ${target.toFixed(2)}</text>

  <!-- Entry Level Line -->
  <line x1="410" y1="330" x2="840" y2="330" stroke="#38bdf8" stroke-width="2.5"/>
  <rect x="850" y="316" width="160" height="28" fill="#0c4a6e" rx="4" stroke="#38bdf8" stroke-width="1"/>
  <text x="860" y="335" fill="#bae6fd" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700">ENTRY: ${entry.toFixed(2)}</text>

  <!-- Stop Loss Level Line -->
  <line x1="410" y1="${isLong ? 410 : 250}" x2="840" y2="${isLong ? 410 : 250}" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6 3"/>
  <rect x="850" y="${isLong ? 396 : 236}" width="160" height="28" fill="#7f1d1d" rx="4" stroke="#ef4444" stroke-width="1"/>
  <text x="860" y="${isLong ? 415 : 255}" fill="#fca5a5" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700">STOP: ${stop.toFixed(2)}</text>

  <!-- Header Ticker Telemetry -->
  <rect x="60" y="30" width="360" height="50" fill="#121824" rx="8" stroke="#1f293d"/>
  <circle cx="85" cy="55" r="8" fill="#10b981"/>
  <text x="105" y="60" fill="#f8fafc" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700">${ticker} • ${timeframe}</text>
  <text x="235" y="60" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="13">${direction.toUpperCase()} | ${setupName}</text>

  <!-- Watermark -->
  <text x="960" y="630" fill="#334155" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700">ACT I: PRE-TRADE THESIS</text>
</svg>
`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generatePostTradeChartSvg(params: {
  ticker: string;
  timeframe: string;
  direction: 'long' | 'short';
  entry: number;
  stop: number;
  target: number;
  exitPrice: number;
  realizedR: number;
  outcomeType: 'target_hit' | 'stopped_out' | 'early_close';
}): string {
  const { ticker, timeframe, direction, entry, target, exitPrice, realizedR, outcomeType } = params;
  const isWin = realizedR > 0;
  const isLong = direction === 'long';

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="100%" height="100%" style="background-color: #0b0f17;">
  <!-- Canvas Background -->
  <rect width="1200" height="675" fill="#0b0f17"/>

  <!-- Horizontal Grid Lines -->
  <line x1="60" y1="120" x2="1140" y2="120" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="60" y1="220" x2="1140" y2="220" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="60" y1="320" x2="1140" y2="320" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="60" y1="420" x2="1140" y2="420" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="60" y1="520" x2="1140" y2="520" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>

  <!-- Vertical Grid Lines -->
  <line x1="240" y1="60" x2="240" y2="580" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="440" y1="60" x2="440" y2="580" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="640" y1="60" x2="640" y2="580" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="840" y1="60" x2="840" y2="580" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="1040" y1="60" x2="1040" y2="580" stroke="#1c273c" stroke-width="1" stroke-dasharray="3 3"/>

  <!-- Historic Context Candles -->
  <rect x="113" y="240" width="14" height="70" fill="#ef4444" rx="1"/>
  <rect x="153" y="295" width="14" height="80" fill="#ef4444" rx="1"/>
  <rect x="233" y="370" width="14" height="45" fill="#10b981" rx="1"/>
  <rect x="273" y="340" width="14" height="60" fill="#10b981" rx="1"/>
  <rect x="313" y="300" width="14" height="70" fill="#10b981" rx="1"/>
  <rect x="353" y="325" width="14" height="40" fill="#ef4444" rx="1"/>
  <rect x="393" y="320" width="14" height="35" fill="#10b981" rx="1"/>

  <!-- Entry Fill Marker -->
  <circle cx="440" cy="330" r="9" fill="#38bdf8" stroke="#0b0f17" stroke-width="3"/>
  <path d="M 440 315 L 440 280" stroke="#38bdf8" stroke-width="2" stroke-dasharray="2 2"/>
  <rect x="385" y="250" width="110" height="26" fill="#0284c7" rx="4"/>
  <text x="395" y="268" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">FILL: ${entry.toFixed(2)}</text>

  <!-- Post-Entry Progression Candles -->
  <!-- Candle 9 -->
  <line x1="440" y1="310" x2="440" y2="355" stroke="#10b981" stroke-width="1.5"/>
  <rect x="433" y="315" width="14" height="30" fill="#10b981" rx="1"/>

  <!-- Candle 10 (Explosive Displacement) -->
  <line x1="480" y1="240" x2="480" y2="330" stroke="#10b981" stroke-width="2"/>
  <rect x="473" y="250" width="14" height="75" fill="#10b981" rx="1"/>

  <!-- Candle 11 -->
  <line x1="520" y1="210" x2="520" y2="280" stroke="#10b981" stroke-width="1.5"/>
  <rect x="513" y="220" width="14" height="50" fill="#10b981" rx="1"/>

  <!-- Candle 12 (Minor Pullback) -->
  <line x1="560" y1="230" x2="560" y2="290" stroke="#ef4444" stroke-width="1.5"/>
  <rect x="553" y="240" width="14" height="30" fill="#ef4444" rx="1"/>

  ${outcomeType === 'early_close' ? `
    <!-- Early Fear Close Marker -->
    <circle cx="560" cy="255" r="9" fill="#f59e0b" stroke="#0b0f17" stroke-width="3"/>
    <line x1="560" y1="255" x2="560" y2="185" stroke="#f59e0b" stroke-width="2"/>
    <rect x="480" y="155" width="160" height="30" fill="#b45309" rx="4" stroke="#f59e0b" stroke-width="1"/>
    <text x="492" y="175" fill="#fef3c7" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">FEAR CLOSE @ ${exitPrice.toFixed(2)}</text>

    <!-- Post exit market reached full target anyway! -->
    <line x1="600" y1="180" x2="600" y2="260" stroke="#10b981" stroke-width="1.5"/>
    <rect x="593" y="190" width="14" height="60" fill="#10b981" opacity="0.6" rx="1"/>
    <line x1="640" y1="140" x2="640" y2="210" stroke="#10b981" stroke-width="2"/>
    <rect x="633" y="145" width="14" height="55" fill="#10b981" opacity="0.6" rx="1"/>
    <path d="M 570 250 Q 610 200, 680 150" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 4" fill="none"/>
    <text x="690" y="155" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="11">Reached Target (+3.2R)</text>
  ` : outcomeType === 'stopped_out' ? `
    <!-- Stop Violation Path -->
    <line x1="480" y1="330" x2="480" y2="430" stroke="#ef4444" stroke-width="2"/>
    <rect x="473" y="340" width="14" height="80" fill="#ef4444" rx="1"/>
    <circle cx="480" cy="420" r="9" fill="#ef4444" stroke="#0b0f17" stroke-width="3"/>
    <rect x="400" y="440" width="160" height="30" fill="#7f1d1d" rx="4" stroke="#ef4444" stroke-width="1"/>
    <text x="410" y="460" fill="#fecaca" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">STOP OUT: ${exitPrice.toFixed(2)}</text>
  ` : `
    <!-- Full Target Hit Path -->
    <line x1="600" y1="170" x2="600" y2="250" stroke="#10b981" stroke-width="1.5"/>
    <rect x="593" y="180" width="14" height="60" fill="#10b981" rx="1"/>
    <line x1="640" y1="130" x2="640" y2="200" stroke="#10b981" stroke-width="2"/>
    <rect x="633" y="140" width="14" height="55" fill="#10b981" rx="1"/>
    <circle cx="640" cy="150" r="10" fill="#10b981" stroke="#0b0f17" stroke-width="3"/>
    <rect x="660" y="135" width="180" height="32" fill="#065f46" rx="4" stroke="#10b981" stroke-width="1"/>
    <text x="672" y="156" fill="#a7f3d0" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700">TARGET EXIT: ${exitPrice.toFixed(2)}</text>
  `}

  <!-- Header Outcome Telemetry Banner -->
  <rect x="60" y="30" width="460" height="54" fill="#161f30" rx="8" stroke="${isWin ? '#10b981' : '#ef4444'}" stroke-width="1.5"/>
  <text x="80" y="63" fill="#f8fafc" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700">${ticker} • ${timeframe}</text>
  <rect x="230" y="42" width="${realizedR >= 0 ? 90 : 100}" height="30" fill="${isWin ? '#065f46' : '#7f1d1d'}" rx="4"/>
  <text x="242" y="62" fill="${isWin ? '#34d399' : '#f87171'}" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800">
    ${realizedR >= 0 ? '+' : ''}${realizedR.toFixed(2)}R
  </text>
  <text x="345" y="63" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="13">
    ${isWin ? 'Compliant Target Hit' : 'Rule / Stop Invalidation'}
  </text>

  <!-- Watermark -->
  <text x="940" y="630" fill="#334155" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700">ACT III: POST-TRADE OUTCOME</text>
</svg>
`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
