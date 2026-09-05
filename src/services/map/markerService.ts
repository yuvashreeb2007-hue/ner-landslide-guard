import { RiskLevel, IncidentType, SensorType } from '@/types';

export function getRiskColor(score: number): {
  bg: string;
  border: string;
  text: string;
  level: RiskLevel;
  glow: string;
} {
  if (score >= 81) {
    return {
      bg: '#dc2626',
      border: '#f87171',
      text: '#ffffff',
      level: 'CRITICAL',
      glow: 'rgba(220, 38, 38, 0.6)',
    };
  }
  if (score >= 61) {
    return {
      bg: '#ea580c',
      border: '#fb923c',
      text: '#ffffff',
      level: 'HIGH',
      glow: 'rgba(234, 88, 12, 0.5)',
    };
  }
  if (score >= 31) {
    return {
      bg: '#d97706',
      border: '#fcd34d',
      text: '#ffffff',
      level: 'MODERATE',
      glow: 'rgba(217, 119, 6, 0.4)',
    };
  }
  return {
    bg: '#059669',
    border: '#34d399',
    text: '#ffffff',
    level: 'LOW',
    glow: 'rgba(5, 150, 105, 0.3)',
  };
}

export function createRiskZoneIcon(
  L: any,
  riskScore: number,
  isSelected = false
) {
  const { bg, level } = getRiskColor(riskScore);
  const isCritical = level === 'CRITICAL';
  const size = isSelected ? 32 : 26;

  return L.divIcon({
    className: 'custom-risk-zone-marker',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        ${
          isCritical
            ? `<div style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                background: ${bg};
                opacity: 0.4;
                animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>`
            : ''
        }
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${bg};
          border: 2px solid ${isSelected ? '#ffffff' : '#080c14'};
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 800;
          font-size: ${isSelected ? '12px' : '10px'};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.8), 0 0 10px ${bg};
          transition: transform 0.15s ease-out;
        ">
          ${riskScore}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function createIncidentIcon(L: any, type: IncidentType) {
  let iconSvg = '';
  let bgColor = '#dc2626';

  switch (type) {
    case 'Landslide':
      bgColor = '#b91c1c';
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
        </svg>
      `;
      break;
    case 'Road Blockage':
      bgColor = '#c2410c';
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 15h16M4 9h16M9 4v16M15 4v16"/>
        </svg>
      `;
      break;
    case 'Crack':
      bgColor = '#d97706';
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      `;
      break;
    case 'Flood':
    case 'Flash Flood':
      bgColor = '#0284c7';
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        </svg>
      `;
      break;
    case 'Slope Movement':
    default:
      bgColor = '#7c2d12';
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v18h18"/>
          <path d="m19 9-5 5-4-4-3 3"/>
        </svg>
      `;
      break;
  }

  return L.divIcon({
    className: 'custom-incident-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${bgColor};
        border: 2px solid #ffffff;
        border-radius: 6px;
        transform: rotate(45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function createSensorIcon(L: any, type: SensorType | string, isCrit: boolean) {
  const color = isCrit ? '#ef4444' : '#06b6d4';
  return L.divIcon({
    className: 'custom-sensor-marker',
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background: #0f172a;
        border: 2px solid ${color};
        border-radius: 4px;
        box-shadow: 0 0 8px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="width: 6px; height: 6px; border-radius: 50%; background: ${color};"></div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export function createVillageIcon(L: any, population: number) {
  return L.divIcon({
    className: 'custom-village-marker',
    html: `
      <div style="
        background: #1e293b;
        color: #f1f5f9;
        border: 1.5px solid #64748b;
        border-radius: 12px;
        padding: 2px 6px;
        font-family: 'Inter', sans-serif;
        font-size: 10px;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        cursor: pointer;
      ">
        <span>🏘️</span>
        <span>${(population / 1000).toFixed(1)}k</span>
      </div>
    `,
    iconSize: [48, 20],
    iconAnchor: [24, 10],
  });
}

export function createFieldReportIcon(L: any, isVerified: boolean) {
  const color = isVerified ? '#10b981' : '#f59e0b';
  return L.divIcon({
    className: 'custom-field-report-marker',
    html: `
      <div style="
        width: 22px;
        height: 22px;
        background: ${color};
        border: 2px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 8px rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <span style="transform: rotate(45deg); font-size: 9px; font-weight: bold; color: #ffffff;">📋</span>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });
}

export function createGeolocationIcon(L: any) {
  return L.divIcon({
    className: 'custom-geolocation-marker',
    html: `
      <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: #38bdf8;
          opacity: 0.35;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0284c7;
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 10px #38bdf8;
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}
