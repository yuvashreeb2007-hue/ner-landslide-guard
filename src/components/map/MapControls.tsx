'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Compass, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Crosshair, 
  RotateCcw,
  X
} from 'lucide-react';
import { searchNERLocations, SearchResultItem } from '@/services/map/geoService';
import { BaseTileKey } from '@/services/map/tileService';

interface MapControlsProps {
  activeBaseTile: BaseTileKey;
  onTileChange: (tile: BaseTileKey) => void;
  onLocationSelect: (lat: number, lng: number, zoom: number, name: string) => void;
  onLocateMe: () => void;
  onResetView: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isLocating?: boolean;
}

export function MapControls({
  activeBaseTile,
  onTileChange,
  onLocationSelect,
  onLocateMe,
  onResetView,
  isFullscreen,
  onToggleFullscreen,
  isLocating = false,
}: MapControlsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const results = searchNERLocations(searchQuery);
      setSearchResults(results);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (item: SearchResultItem) => {
    onLocationSelect(item.lat, item.lng, item.zoom, item.name);
    setSearchQuery(item.name);
    setShowDropdown(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 1. Location Search Input */}
      <div ref={searchContainerRef} className="relative min-w-[200px] sm:min-w-[260px]">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search district, highway, village..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-xl font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowDropdown(false);
              }}
              className="absolute right-2 text-slate-400 hover:text-white p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-eoc-card border border-eoc-border rounded-xl shadow-2xl z-[2000] overflow-hidden divide-y divide-slate-800 text-xs">
            {searchResults.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectResult(item)}
                className="w-full text-left p-2.5 hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-sky-400 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.district && (
                    <div className="text-[10px] text-slate-400 pl-4.5 font-mono">
                      {item.district}, {item.state}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-700">
                    {item.category}
                  </span>
                  {item.meta && (
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                      {item.meta}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Base Tile Selector */}
      <div className="flex items-center bg-slate-900/90 backdrop-blur-md rounded-lg p-0.5 border border-slate-700 text-xs font-mono shadow-xl">
        {(['dark', 'satellite', 'terrain'] as const).map((tile) => (
          <button
            key={tile}
            onClick={() => onTileChange(tile)}
            className={`px-2 py-1 rounded-md capitalize text-[10px] font-semibold transition-all ${
              activeBaseTile === tile
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tile}
          </button>
        ))}
      </div>

      {/* 3. Locate Me Button */}
      <button
        onClick={onLocateMe}
        disabled={isLocating}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-xl font-mono ${
          isLocating
            ? 'bg-sky-950 text-sky-300 border-sky-800 animate-pulse'
            : 'bg-slate-900/90 hover:bg-slate-800 text-sky-300 border-slate-700'
        }`}
        title="Locate Current Position"
      >
        <Crosshair className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin' : ''}`} />
        <span className="hidden md:inline">
          {isLocating ? 'Locating...' : 'Locate Me'}
        </span>
      </button>

      {/* 4. Reset to Northeast India View */}
      <button
        onClick={onResetView}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-xl font-mono"
        title="Reset Map to Full Northeast India Bounds"
      >
        <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
        <span className="hidden lg:inline">Reset NER View</span>
      </button>

      {/* 5. Fullscreen Mode Toggle */}
      <button
        onClick={onToggleFullscreen}
        className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-xl"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen GIS Operations Mode'}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
