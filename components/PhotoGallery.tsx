/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ArrowLeft, Plus, Share2, Grid } from 'lucide-react';

interface Props {
  albumId: string | null;
  onBack: () => void;
}

const PhotoGallery: React.FC<Props> = ({ albumId, onBack }) => {
  return (
    <div className="w-full h-full p-12 overflow-y-auto no-scrollbar">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="w-12 h-12 rounded-2xl glass flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                {albumId === 'KID' ? 'Little Explorers' : 
                 albumId === 'PRO' ? 'Professional Heights' : 
                 albumId === 'FRIENDS' ? 'The Inner Circle' : 'Legacy & Roots'}
              </h2>
              <p className="text-sm text-brand-silver uppercase tracking-widest font-bold mt-1">128 Memories Archived</p>
            </div>
          </div>

          <div className="flex gap-4">
             <button className="flex items-center gap-2 glass px-6 py-3 rounded-2xl border border-white/10 text-xs font-bold hover:bg-white/5 transition-all">
                <Share2 size={16} /> Share Collection
             </button>
             <button className="flex items-center gap-2 bg-brand-gold text-brand-dark px-6 py-3 rounded-2xl font-bold text-xs hover:scale-105 transition-all">
                <Plus size={16} /> Add Memory
             </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {[...Array(12)].map((_, i) => (
             <div 
               key={i} 
               className="aspect-[4/5] glass rounded-3xl overflow-hidden group relative cursor-pointer border border-white/5 card-3d"
             >
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col justify-end p-6">
                   <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-1">June 2022</span>
                   <h5 className="text-sm font-bold text-white leading-tight">A moment worth documenting forever.</h5>
                </div>
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                   <Grid size={32} className="text-white/5" />
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoGallery;