/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, BookOpen, Loader2 } from 'lucide-react';
import { StoryPage } from '../types';
import { generateSegmentAudio } from '../services/geminiService';

interface Props {
  pages: StoryPage[];
  isLoading: boolean;
}

const StorybookView: React.FC<Props> = ({ pages, isLoading }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCacheRef = useRef<Map<number, AudioBuffer>>(new Map());

  const currentPage = pages[currentPageIndex];

  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudio = async () => {
    if (!currentPage) return;
    
    setIsAudioLoading(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      let buffer = audioCacheRef.current.get(currentPageIndex);
      
      if (!buffer) {
        buffer = await generateSegmentAudio(currentPage.text, audioContextRef.current, 'Kore');
        audioCacheRef.current.set(currentPageIndex, buffer);
      }

      stopAudio();

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      
      sourceRef.current = source;
      source.start(0);
      setIsPlaying(true);
    } catch (error) {
      console.error("Audio playback error:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) stopAudio();
    else playAudio();
  };

  const handleNext = () => {
    if (currentPageIndex < pages.length - 1) {
      stopAudio();
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      stopAudio();
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-brand-purple/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-brand-gold rounded-full border-t-transparent animate-spin"></div>
          <BookOpen className="absolute inset-0 m-auto text-brand-gold" size={32} />
        </div>
        <p className="text-brand-silver font-display font-bold uppercase tracking-widest animate-pulse">Forging your chronology...</p>
      </div>
    );
  }

  if (pages.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Book Interface */}
      <div className="glass rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative">
        <div className="flex flex-col md:flex-row h-[70vh]">
          
          {/* Left Page: Visual */}
          <div className="flex-1 relative bg-stone-900 overflow-hidden border-r border-white/5">
            {currentPage?.imageUrl ? (
              <img 
                src={currentPage.imageUrl} 
                alt={`Page ${currentPage.pageNumber}`} 
                className="w-full h-full object-cover transition-opacity duration-1000"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                 <Loader2 className="animate-spin text-white/20" size={48} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-8 left-8 flex items-center gap-3 glass px-4 py-2 rounded-full border border-white/10">
              <BookOpen size={16} className="text-brand-gold" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/80">The Chronology of Self</span>
            </div>
          </div>

          {/* Right Page: Narrative */}
          <div className="flex-1 bg-editorial-100 p-8 md:p-16 flex flex-col justify-center relative">
            <div className="space-y-8">
              <div className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.4em] mb-4">
                Section {currentPage.pageNumber} of {pages.length}
              </div>
              <p className="text-2xl md:text-3xl font-serif text-editorial-900 leading-relaxed italic">
                {currentPage.text}
              </p>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-12 left-16 right-16 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={togglePlay}
                  disabled={isAudioLoading}
                  className="w-14 h-14 rounded-full bg-editorial-900 text-white flex items-center justify-center hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                >
                  {isAudioLoading ? <Loader2 className="animate-spin" size={24} /> : 
                   isPlaying ? <Pause size={24} className="fill-current" /> : 
                   <Play size={24} className="fill-current ml-1" />}
                </button>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Narration</span>
                  <span className="text-sm font-serif text-editorial-900 font-bold">Kore Voice Engine</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={handlePrev} 
                  disabled={currentPageIndex === 0}
                  className="p-3 rounded-full hover:bg-stone-200 disabled:opacity-20 transition-colors"
                >
                  <ChevronLeft size={24} className="text-editorial-900" />
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={currentPageIndex === pages.length - 1}
                  className="p-3 rounded-full hover:bg-stone-200 disabled:opacity-20 transition-colors"
                >
                  <ChevronRight size={24} className="text-editorial-900" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Thumbnails */}
      <div className="flex justify-center mt-12 gap-4">
        {pages.map((page, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPageIndex(idx)}
            className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentPageIndex === idx ? 'border-brand-gold scale-110 shadow-lg' : 'border-white/10 opacity-40 hover:opacity-100'}`}
          >
            <img src={page.imageUrl} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default StorybookView;