/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/



import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Loader2, Footprints, Car, CloudRain, Sparkles, ScrollText, Sword } from 'lucide-react';
import { RouteDetails, AppState, StoryStyle } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

interface Props {
  onRouteFound: (details: RouteDetails) => void;
  appState: AppState;
  externalError?: string | null;
}

type TravelMode = 'WALKING' | 'DRIVING';

const STYLES: { id: StoryStyle; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'NOIR', label: 'Noir Thriller', icon: CloudRain, desc: 'Gritty, mysterious, rain-slicked streets.' },
    { id: 'CHILDREN', label: 'Children\'s Story', icon: Sparkles, desc: 'Whimsical, magical, and full of wonder.' },
    { id: 'HISTORICAL', label: 'Historical Epic', icon: ScrollText, desc: 'Grand, dramatic, echoing the past.' },
    { id: 'FANTASY', label: 'Fantasy Adventure', icon: Sword, desc: 'An epic quest through a magical realm.' },
];

const RoutePlanner: React.FC<Props> = ({ onRouteFound, appState, externalError }) => {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [travelMode, setTravelMode] = useState<TravelMode>('WALKING');
  const [selectedStyle, setSelectedStyle] = useState<StoryStyle>('NOIR');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalError) {
        setError(externalError);
    }
  }, [externalError]);

  useEffect(() => {
    let isMounted = true;
    const initAutocomplete = () => {
        if (!window.google?.maps?.places) return false;
        try {
             const setupAutocomplete = (
                 inputElement: HTMLInputElement | null,
                 setAddress: (addr: string) => void
             ) => {
                 if (!inputElement) return;
                 const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
                     fields: ['formatted_address', 'geometry', 'name'],
                     types: ['geocode', 'establishment']
                 });
                 autocomplete.addListener('place_changed', () => {
                     if (!isMounted) return;
                     const place = autocomplete.getPlace();
                     if (!place.geometry || !place.geometry.location) {
                         if (inputElement.value && window.google.maps.Geocoder) {
                             const geocoder = new window.google.maps.Geocoder();
                             geocoder.geocode({ address: inputElement.value }, (results: any, status: any) => {
                                 if (status === 'OK' && results[0]) {
                                     setAddress(results[0].formatted_address);
                                     inputElement.value = results[0].formatted_address;
                                 }
                             });
                         }
                         return;
                     }
                     const address = place.formatted_address || place.name;
                     setAddress(address);
                     inputElement.value = address;
                 });
             };
             setupAutocomplete(startInputRef.current, setStartAddress);
             setupAutocomplete(endInputRef.current, setEndAddress);
             return true;
        } catch (e) {
            console.error("Failed to initialize Places Autocomplete:", e);
            return false;
        }
    };

    // Retry loop until Google Maps is ready
    const checkInterval = setInterval(() => {
        if (initAutocomplete()) {
            clearInterval(checkInterval);
        }
    }, 1000);

    return () => { 
        isMounted = false; 
        clearInterval(checkInterval); 
    };
  }, []);

  const handleCalculate = () => {
    const finalStart = startInputRef.current?.value || startAddress;
    const finalEnd = endInputRef.current?.value || endAddress;
    if (!finalStart || !finalEnd) {
      setError("Please select both a start and end location.");
      return;
    }
    if (!window.google?.maps) {
         setError("Maps API is still loading or key is invalid.");
         return;
    }
    setError(null);
    setIsLoading(true);
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: finalStart,
        destination: finalEnd,
        travelMode: window.google.maps.TravelMode[travelMode],
      },
      (result: any, status: any) => {
        setIsLoading(false);
        if (status === window.google.maps.DirectionsStatus.OK) {
          const leg = result.routes[0].legs[0];
          if (leg.duration.value > 14400) {
            setError("Journey is too long (limit 4 hours).");
            return;
          }
          onRouteFound({
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            distance: leg.distance.text,
            duration: leg.duration.text,
            durationSeconds: leg.duration.value,
            travelMode: travelMode,
            voiceName: 'Kore',
            storyStyle: selectedStyle
          });
        } else {
          setError("Route calculation failed. Check your locations or API key.");
        }
      }
    );
  };

  const isLocked = appState > AppState.ROUTE_CONFIRMED;

  return (
    <div className={`transition-all duration-700 ${isLocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
      <div className="space-y-6 glass p-8 rounded-[2.5rem] shadow-2xl border border-white/10">
        <div className="space-y-1">
            <h2 className="text-2xl font-display font-black text-white tracking-tight">Plan Your Journey</h2>
            <p className="text-brand-silver text-[10px] font-bold uppercase tracking-widest">Map your route to documentation</p>
        </div>

        <div className="space-y-3">
          <div className="relative group h-14 glass border border-white/10 focus-within:border-brand-gold/50 rounded-2xl transition-all overflow-hidden">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-silver group-focus-within:text-brand-gold transition-colors z-10" size={18} />
            <input
                ref={startInputRef}
                type="text"
                placeholder="Starting Point"
                className="w-full h-full bg-transparent p-0 pl-12 pr-4 text-white placeholder-brand-silver/50 outline-none font-medium text-sm"
                onChange={(e) => setStartAddress(e.target.value)}
                disabled={isLocked}
            />
          </div>

          <div className="relative group h-14 glass border border-white/10 focus-within:border-brand-gold/50 rounded-2xl transition-all overflow-hidden">
            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-silver group-focus-within:text-brand-gold transition-colors z-10" size={18} />
            <input
                ref={endInputRef}
                type="text"
                placeholder="Destination"
                className="w-full h-full bg-transparent p-0 pl-12 pr-4 text-white placeholder-brand-silver/50 outline-none font-medium text-sm"
                onChange={(e) => setEndAddress(e.target.value)}
                disabled={isLocked}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
                <div className="flex gap-2 glass p-1.5 rounded-2xl border border-white/10">
                    {(['WALKING', 'DRIVING'] as TravelMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setTravelMode(mode)}
                            disabled={isLocked}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                                travelMode === mode 
                                    ? 'bg-brand-gold text-brand-dark shadow-lg' 
                                    : 'text-brand-silver hover:bg-white/5'
                            }`}
                        >
                            {mode === 'WALKING' ? <Footprints size={14} /> : <Car size={14} />}
                            <span>{mode === 'WALKING' ? 'Walk' : 'Drive'}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="space-y-3">
            <label className="text-[10px] font-bold text-brand-silver uppercase tracking-[0.2em]">Narrative Style</label>
            <div className="grid grid-cols-2 gap-3">
                {STYLES.map((style) => {
                    const Icon = style.icon;
                    const isSelected = selectedStyle === style.id;
                    return (
                        <button
                            key={style.id}
                            onClick={() => setSelectedStyle(style.id)}
                            disabled={isLocked}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                                isSelected
                                    ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                                    : 'border-white/5 bg-white/5 text-brand-silver hover:border-white/20'
                            }`}
                        >
                            <Icon size={18} className="shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{style.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        {error && (
          <p className="text-red-400 text-[10px] font-bold uppercase text-center">{error}</p>
        )}

        <button
          onClick={handleCalculate}
          disabled={isLoading || isLocked}
          className="w-full bg-brand-gold text-brand-dark py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl active:scale-95"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles size={16} /> Plan Journey</>}
        </button>
      </div>
    </div>
  );
};

export default RoutePlanner;