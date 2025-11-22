import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { casesApi, clientsApi, tasksApi, documentsApi } from '../services/api';

interface SearchResult {
  id: number | string;
  type: 'case' | 'client' | 'task' | 'document';
  title: string;
  subtitle?: string;
  status?: string;
}

export const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: cases = [] } = useQuery({
    queryKey: ['cases'],
    queryFn: () => casesApi.getAll(),
    enabled: query.length > 0,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll(),
    enabled: query.length > 0,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getAll(),
    enabled: query.length > 0,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.getAll(),
    enabled: query.length > 0,
  });

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search cases
    cases
      .filter((case_: any) => 
        case_.title?.toLowerCase().includes(searchTerm) ||
        case_.caseType?.toLowerCase().includes(searchTerm) ||
        case_.description?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5)
      .forEach((case_: any) => {
        searchResults.push({
          id: case_.id,
          type: 'case',
          title: case_.title,
          subtitle: case_.caseType?.replace(/_/g, ' '),
          status: case_.status,
        });
      });

    // Search clients
    clients
      .filter((client: any) => {
        const fullName = client.clientType === 'INDIVIDUAL'
          ? `${client.firstName} ${client.lastName}`
          : client.companyName;
        return (
          fullName?.toLowerCase().includes(searchTerm) ||
          client.email?.toLowerCase().includes(searchTerm) ||
          client.cnp?.includes(searchTerm) ||
          client.cui?.includes(searchTerm)
        );
      })
      .slice(0, 5)
      .forEach((client: any) => {
        const title = client.clientType === 'INDIVIDUAL'
          ? `${client.firstName} ${client.lastName}`
          : client.companyName;
        searchResults.push({
          id: client.id,
          type: 'client',
          title,
          subtitle: client.clientType === 'INDIVIDUAL' ? `CNP: ${client.cnp}` : `CUI: ${client.cui}`,
        });
      });

    // Search tasks
    tasks
      .filter((task: any) => 
        task.title?.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5)
      .forEach((task: any) => {
        searchResults.push({
          id: task.id,
          type: 'task',
          title: task.title,
          subtitle: `Priority: ${task.priority}`,
          status: task.status,
        });
      });

    // Search documents
    documents
      .filter((doc: any) => 
        doc.title?.toLowerCase().includes(searchTerm) ||
        doc.fileName?.toLowerCase().includes(searchTerm) ||
        doc.documentType?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5)
      .forEach((doc: any) => {
        searchResults.push({
          id: doc.id,
          type: 'document',
          title: doc.title,
          subtitle: doc.documentType?.replace(/_/g, ' '),
          status: doc.status,
        });
      });

    setResults(searchResults);
    setSelectedIndex(0);
  }, [query, cases, clients, tasks, documents]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const routes = {
      case: `/cases/${result.id}`,
      client: `/clients/${result.id}`,
      task: `/tasks/${result.id}`,
      document: `/documents/${result.id}`,
    };
    
    navigate(routes[result.type]);
    setQuery('');
    setIsOpen(false);
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      case: 'bg-blue-100 text-blue-800',
      client: 'bg-green-100 text-green-800',
      task: 'bg-purple-100 text-purple-800',
      document: 'bg-amber-100 text-amber-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status: string) => {
    if (status === 'COMPLETED' || status === 'DONE' || status === 'SIGNED') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'IN_PROGRESS') {
      return 'bg-blue-100 text-blue-800';
    } else if (status === 'DRAFT') {
      return 'bg-gray-100 text-gray-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-lg">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search cases, clients, tasks, documents..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg
              className="h-4 w-4 text-gray-400 hover:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-md shadow-lg max-h-96 overflow-auto">
          <ul className="py-2">
            {results.map((result, index) => (
              <li key={`${result.type}-${result.id}`}>
                <button
                  onClick={() => handleSelectResult(result)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                    index === selectedIndex ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeBadgeColor(
                            result.type
                          )}`}
                        >
                          {result.type.toUpperCase()}
                        </span>
                        {result.status && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(
                              result.status
                            )}`}
                          >
                            {result.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-md shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">No results found</p>
        </div>
      )}

      {/* Search Hint */}
      {isOpen && query.length > 0 && query.length < 2 && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-md shadow-lg p-4">
          <p className="text-xs text-gray-500 text-center">
            Type at least 2 characters to search
          </p>
        </div>
      )}
    </div>
  );
};
