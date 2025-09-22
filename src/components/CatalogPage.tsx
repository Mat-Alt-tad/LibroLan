import React from 'react';
import { useLibrary, getDisplayUrl, CATEGORIES } from './LibraryContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ArrowLeft, Search, BookOpen, Calendar, User, GraduationCap } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const { state, dispatch } = useLibrary();

  // Obtener todas las categorías y subcategorías
  const allSubcategories = [
    'all',
    ...Object.values(CATEGORIES).flat()
  ];
  
  const filteredBooks = state.books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         book.description.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         book.category.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         book.subcategory.toLowerCase().includes(state.searchTerm.toLowerCase());
    
    const matchesCategory = state.selectedCategory === 'all' || 
                           book.subcategory === state.selectedCategory ||
                           book.category === state.selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-2xl font-bold">Catálogo de Libros</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, autor, descripción o categoría..."
              value={state.searchTerm}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <Select
            value={state.selectedCategory}
            onValueChange={(value) => dispatch({ type: 'SET_SELECTED_CATEGORY', payload: value })}
          >
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <optgroup label="Categorías Principales">
                <SelectItem value="Educación Primaria">Educación Primaria</SelectItem>
                <SelectItem value="Literatura General">Literatura General</SelectItem>
              </optgroup>
              <optgroup label="Educación Primaria">
                {CATEGORIES['Educación Primaria'].map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </SelectItem>
                ))}
              </optgroup>
              <optgroup label="Literatura General">
                {CATEGORIES['Literatura General'].map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </SelectItem>
                ))}
              </optgroup>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredBooks.length} libro{filteredBooks.length !== 1 ? 's' : ''} encontrado{filteredBooks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">No se encontraron libros</h3>
            <p className="text-muted-foreground">
              Intenta cambiar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="aspect-[3/4] relative">
                  <img 
                    src={getDisplayUrl(book, 'cover')} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <Button 
                      size="sm"
                      className="opacity-0 hover:opacity-100 transition-opacity"
                      onClick={() => {
                        dispatch({ type: 'SET_CURRENT_BOOK', payload: book });
                        dispatch({ type: 'SET_VIEW', payload: 'viewer' });
                      }}
                    >
                      Leer
                    </Button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-bold mb-2 line-clamp-2 min-h-[3rem]">{book.title}</h4>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {new Date(book.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center gap-1">
                      {book.category === 'Educación Primaria' ? (
                        <GraduationCap className="h-3 w-3 text-green-600" />
                      ) : (
                        <BookOpen className="h-3 w-3 text-blue-600" />
                      )}
                      <Badge 
                        variant={book.category === 'Educación Primaria' ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {book.category}
                      </Badge>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {book.subcategory}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
                    {book.description}
                  </p>
                  
                  {book.pages && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {book.pages} páginas
                    </p>
                  )}
                  
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      dispatch({ type: 'SET_CURRENT_BOOK', payload: book });
                      dispatch({ type: 'SET_VIEW', payload: 'viewer' });
                    }}
                  >
                    Leer Libro
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};