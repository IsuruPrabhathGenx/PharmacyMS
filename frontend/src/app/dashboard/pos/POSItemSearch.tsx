import React, { useState, useEffect, useRef } from 'react';
import { InventoryItem } from '@/types/inventory';
import { Input } from "@/components/ui/input";

interface POSItemSearchProps {
  inventory: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const POSItemSearch: React.FC<POSItemSearchProps> = ({
  inventory,
  onSelectItem,
  inputRef
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const localInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  
  // Use provided ref or local ref
  const searchInputRef = inputRef || localInputRef;
  
  // Update search results when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setFocusedIndex(-1);
      return;
    }
    
    const filtered = inventory.filter(item => {
      const termLower = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(termLower) ||
        item.code.toLowerCase().includes(termLower)
      );
    });
    
    // Sort results by relevance (exact match first, then starts with, then includes)
    const sorted = [...filtered].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aCode = a.code.toLowerCase();
      const bCode = b.code.toLowerCase();
      const term = searchTerm.toLowerCase();
      
      // Exact match has highest priority
      if (aName === term || aCode === term) return -1;
      if (bName === term || bCode === term) return 1;
      
      // Starts with has second highest priority
      if (aName.startsWith(term) || aCode.startsWith(term)) return -1;
      if (bName.startsWith(term) || bCode.startsWith(term)) return 1;
      
      // Otherwise sort alphabetically
      return aName.localeCompare(bName);
    });
    
    setSearchResults(sorted.slice(0, 10)); // Limit to 10 results for better UX
    setFocusedIndex(sorted.length > 0 ? 0 : -1);
  }, [searchTerm, inventory]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchResults.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < searchResults.length) {
          handleSelectItem(searchResults[focusedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setSearchTerm('');
        setSearchResults([]);
        break;
    }
  };
  
  // Scroll to focused item
  useEffect(() => {
    if (focusedIndex >= 0 && resultsContainerRef.current) {
      const container = resultsContainerRef.current;
      const focusedElement = container.children[focusedIndex] as HTMLElement;
      
      if (focusedElement) {
        // Check if element is not fully visible
        const containerRect = container.getBoundingClientRect();
        const focusedRect = focusedElement.getBoundingClientRect();
        
        if (focusedRect.bottom > containerRect.bottom) {
          // Need to scroll down
          container.scrollTop += focusedRect.bottom - containerRect.bottom;
        } else if (focusedRect.top < containerRect.top) {
          // Need to scroll up
          container.scrollTop -= containerRect.top - focusedRect.top;
        }
      }
    }
  }, [focusedIndex]);
  
  const handleSelectItem = (item: InventoryItem) => {
    onSelectItem(item);
    setSearchTerm('');
    setSearchResults([]);
  };
  
  return (
    <div className="relative w-full">
      <Input
        ref={searchInputRef}
        type="text"
        placeholder="Search items by name or code... (F1)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full"
      />
      
      {searchResults.length > 0 && (
        <div 
          ref={resultsContainerRef}
          className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {searchResults.map((item, index) => (
            <div
              key={item.id}
              className={`p-3 cursor-pointer ${
                index === focusedIndex ? 'bg-blue-100' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelectItem(item)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-500">
                Code: {item.code} | Type: {item.type}
                {item.hasUnitContains && item.unitContains && (
                  ` | ${item.unitContains.value} ${item.unitContains.unit} per unit`
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {searchTerm && searchResults.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center">
          No items found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};