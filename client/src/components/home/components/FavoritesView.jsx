import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Plus, ChevronRight, Trash2 } from 'lucide-react';

const FavoritesView = ({ setSearchValue, setActiveView, setShowMapOverlay, setIsSearching, setMapOverlayMode }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing favorites:', e);
        setFavorites([]);
      }
    }
  }, []);

  const removeFavorite = (e, address) => {
    e.stopPropagation();
    const updated = favorites.filter(f => f !== address);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 z-40 bg-zinc-950 pt-32 px-6 overflow-y-auto pb-60"
    >
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight text-white">Saved</h1>
          <p className="text-zinc-400 font-medium">Your favorite locations</p>
        </div>
        <button 
          onClick={() => setActiveView('home')}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {favorites.length > 0 ? (
            favorites.map((fav) => (
              <motion.div
                key={fav}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.01 }}
                onClick={() => {
                  if (setSearchValue) setSearchValue(fav);
                  if (setActiveView) setActiveView('home');
                }}
                className="flex items-center space-x-4 p-5 backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors shadow-xl cursor-pointer group"
              >
                <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center shrink-0">
                  <Star size={20} className="fill-yellow-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg mb-0.5 truncate text-white">{fav.split(',')[0]}</p>
                  <p className="text-xs text-zinc-400 truncate">{fav}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => removeFavorite(e, fav)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <ChevronRight size={16} className="text-zinc-500 group-hover:text-white" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 px-10"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star size={32} className="text-zinc-700" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Saved Places</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Locations you mark as favorites while searching will appear here for quick access.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setMapOverlayMode('favorite');
            setShowMapOverlay(true);
          }}
          className="w-full flex items-center justify-center space-x-2 p-5 border-2 border-dashed border-white/10 rounded-3xl text-zinc-500 hover:text-white hover:border-white/30 transition-all mt-4"
        >
          <MapPin size={18} />
          <span className="font-bold text-sm uppercase tracking-widest">Add New Location</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FavoritesView;
