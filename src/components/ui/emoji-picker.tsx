import { useState, useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { cn } from '@/lib/utils';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: { native: string }) => void;
  buttonClassName?: string;
}

export function EmojiPicker({ onEmojiSelect, buttonClassName }: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Check for dark mode using a data attribute on the document element (html)
  // This matches how our application handles theming
  const isDarkMode = typeof document !== 'undefined' ? 
    document.documentElement.classList.contains('dark') : false;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update theme when dark mode changes
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const updateTheme = () => {
      setTheme(isDarkMode ? 'dark' : 'light');
    };
    
    updateTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, [isDarkMode]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={cn(
          'text-gray-500 dark:text-gray-400',
          'hover:text-gray-700 dark:hover:text-gray-300',
          'transition-colors duration-200',
          'focus:outline-none',
          buttonClassName
        )}
        aria-label="Open emoji picker"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      </button>
      
      {showPicker && (
        <div 
          ref={pickerRef}
          className="absolute bottom-10 right-0 z-50"
        >
          <Picker
            data={data}
            onEmojiSelect={onEmojiSelect}
            theme={theme}
            skinTonePosition="none"
            previewPosition="none"
          />
        </div>
      )}
    </div>
  );
} 