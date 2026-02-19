/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Achievement, Book, UserStats } from '../types';
import { Book as BookIcon, Award, FileText, ExternalLink, Scroll } from 'lucide-react';

interface Props {
  achievements: Achievement[];
  books: Book[];
  onAlbumClick: (type: string) => void;
  stats: UserStats;
}

const VirtualOffice: React.FC<Props> = ({ achievements, books, onAlbumClick, stats }) => {
  const [hoveredBook, setHoveredBook] = useState<Book | null>(null);

  return (
    <div className="w-full h-full p-8 lg:p-12 office-scene overflow-hidden flex flex-col lg:flex-row gap-12">
      
      {/* LEFT: Achievement Wall & Bookshelf (Background Layers) */}
      <div className="flex-1 flex flex-col gap-12">
        {/* Achievement Wall */}
        <section className="wall-perspective">
          <h3 className="text-sm font-bold text-brand-gold tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
            <Award size={18} /> Achievement Wall
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((item) => (
              <div 
                key={item.id}
                className="card-3d glass rounded-2xl p-6 glow-border relative group cursor-pointer border border-white/5"
              >
                <div className="absolute top-4 right-4 text-white/20 group-hover:text-brand-gold transition-colors">
                  <FileText size={20} />
                </div>
                <div className="text-2xl font-bold text-brand-gold mb-1">{item.metric}</div>
                <div className="text-sm font-bold text-white mb-2 leading-tight">{item.title}</div>
                <div className="text-[10px] text-brand-silver leading-relaxed">{item.description}</div>
                
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.date}</span>
                   <ExternalLink size={12} className="text-brand-gold" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Bookshelf */}
        <section className="flex-1">
          <h3 className="text-sm font-bold text-brand-purple tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
            <BookIcon size={18} /> Transformation Library
          </h3>
          <div className="flex items-end gap-1 overflow-x-auto pb-4 no-scrollbar">
             {books.map((book) => (
                <div 
                  key={book.id}
                  onMouseEnter={() => setHoveredBook(book)}
                  onMouseLeave={() => setHoveredBook(null)}
                  className={`w-12 hover:w-48 h-64 transition-all duration-500 rounded-t-lg rounded-b-sm relative cursor-pointer group shadow-2xl ${
                    book.category === 'BUSINESS' ? 'bg-gradient-to-b from-brand-blue to-indigo-900' : 'bg-gradient-to-b from-brand-purple to-indigo-950'
                  }`}
                >
                  {/* Spine View */}
                  <div className="absolute inset-0 flex items-center justify-center transform -rotate-90 origin-center whitespace-nowrap group-hover:opacity-0 transition-opacity">
                    <span className="text-xs font-bold text-white/80 tracking-widest uppercase">{book.title}</span>
                  </div>

                  {/* Expanded View Content */}
                  <div className="absolute inset-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-2">{book.category}</div>
                      <div className="text-sm font-bold text-white mb-4 leading-tight">{book.title}</div>
                      <div className="text-[11px] text-white/70 italic">"{book.lessonsLearned}"</div>
                    </div>
                    <div className="text-[10px] text-brand-silver font-bold">{book.dateRead}</div>
                  </div>
                </div>
             ))}
             {/* Filler books */}
             {[...Array(15)].map((_, i) => (
               <div key={i} className="w-8 h-60 bg-white/5 rounded-t-lg border-x border-white/5"></div>
             ))}
          </div>
        </section>
      </div>

      {/* RIGHT: The Desk Surface (Foreground) */}
      <div className="lg:w-96 flex flex-col gap-8">
        {/* Stats Widget */}
        <div className="glass rounded-[2rem] p-8 border border-white/10 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl"></div>
          <h3 className="text-xs font-bold text-brand-gold tracking-widest uppercase mb-8 flex items-center justify-between">
            Life Metrics <BarChart3 size={14} />
          </h3>
          
          <div className="space-y-6">
            <StatBar label="Sobriety" value={stats.sobrietyDays} max={1000} suffix=" Days" color="from-brand-purple to-purple-400" />
            <StatBar label="Flight Experience" value={stats.flightHours} max={1000} suffix=" Hours" color="from-brand-blue to-blue-400" />
            <StatBar label="Certifications" value={stats.totalCertifications} max={20} suffix="" color="from-brand-gold to-yellow-200" />
          </div>
        </div>

        {/* Photo Albums on Desk */}
        <div className="flex-1 glass rounded-[2rem] p-8 border border-white/10">
          <h3 className="text-xs font-bold text-brand-silver tracking-widest uppercase mb-8 flex items-center justify-between">
            Photo Archives <ImageIcon size={14} />
          </h3>
          <div className="grid grid-cols-2 gap-4">
             <AlbumCard title="Kid-Friendly" color="bg-pink-500/20" onClick={() => onAlbumClick('KID')} />
             <AlbumCard title="Professional" color="bg-blue-500/20" onClick={() => onAlbumClick('PRO')} />
             <AlbumCard title="Friends" color="bg-green-500/20" onClick={() => onAlbumClick('FRIENDS')} />
             <AlbumCard title="Family" color="bg-orange-500/20" onClick={() => onAlbumClick('FAMILY')} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBar = ({ label, value, max, suffix, color }: { label: string, value: number, max: number, suffix: string, color: string }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-[11px] font-bold mb-2">
        <span className="text-brand-silver uppercase">{label}</span>
        <span className="text-white">{value}{suffix}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(124,58,237,0.3)]`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const AlbumCard = ({ title, color, onClick }: { title: string, color: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`${color} hover:bg-white/10 aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group border border-white/5`}
  >
    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center group-hover:scale-110 transition-transform">
      <Scroll size={20} className="text-white/50" />
    </div>
    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{title}</span>
  </button>
);

import { ImageIcon, BarChart3 } from 'lucide-react';

export default VirtualOffice;