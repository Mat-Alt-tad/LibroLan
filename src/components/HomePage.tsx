import React from 'react';
import { useLibrary, getDisplayUrl, CATEGORIES } from './LibraryContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { BookOpen, Library, Users, Calendar, GraduationCap, Brain } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { state, dispatch } = useLibrary();

  const totalPages = state.books.reduce((total, book) => total + (book.pages || 0), 0);
  const educationBooks = state.books.filter(book => book.category === 'Educación Primaria');
  const generalBooks = state.books.filter(book => book.category === 'Literatura General');
  const recentBooks = state.books
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Library className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold"></h1>
            </div>
            <nav className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'catalog' })}
              >
                Catálogo
              </Button>
              {state.isAuthenticated ? (
                <Button 
                  variant="outline"
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin' })}
                >
                  Administrar
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
                >
                  Acceso Admin
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Bienvenido a tu Biblioteca Personal</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Accede a tu colección de libros digitales offline - Desde educación primaria hasta literatura clásica
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'catalog' })}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Explorar Catálogo
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => {
                dispatch({ type: 'SET_SELECTED_CATEGORY', payload: 'Educación Primaria' });
                dispatch({ type: 'SET_VIEW', payload: 'catalog' });
              }}
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Educación Primaria
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{state.books.length}</p>
                <p className="text-muted-foreground">Total Libros</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <GraduationCap className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{educationBooks.length}</p>
                <p className="text-muted-foreground">Educación Primaria</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Library className="h-10 w-10 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{generalBooks.length}</p>
                <p className="text-muted-foreground">Literatura General</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{new Set(state.books.map(b => b.author)).size}</p>
                <p className="text-muted-foreground">Autores</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Books */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Libros Recientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] relative">
                  <img 
                    src={getDisplayUrl(book, 'cover')} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-bold mb-2 line-clamp-2">{book.title}</h4>
                  <p className="text-muted-foreground text-sm mb-2">{book.author}</p>
                  
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
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {book.description}
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      dispatch({ type: 'SET_CURRENT_BOOK', payload: book });
                      dispatch({ type: 'SET_VIEW', payload: 'viewer' });
                    }}
                  >
                    Leer Ahora
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Categories Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Education Categories */}
          <section>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-green-500" />
              Educación Primaria
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CATEGORIES['Educación Primaria'].map((subcategory) => {
                const categoryBooks = state.books.filter(book => 
                  book.category === 'Educación Primaria' && book.subcategory === subcategory
                );
                const icon = subcategory.includes('Matemáticas') ? Brain : 
                           subcategory.includes('Ciencias') ? BookOpen :
                           subcategory.includes('Cuentos') ? Library :
                           GraduationCap;
                const IconComponent = icon;
                
                return (
                  <Card 
                    key={subcategory} 
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      dispatch({ type: 'SET_SELECTED_CATEGORY', payload: subcategory });
                      dispatch({ type: 'SET_VIEW', payload: 'catalog' });
                    }}
                  >
                    <div className="text-center">
                      <IconComponent className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <h4 className="font-medium mb-1">{subcategory}</h4>
                      <p className="text-sm text-muted-foreground">
                        {categoryBooks.length} libro{categoryBooks.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* General Literature Categories */}
          <section>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Library className="h-6 w-6 text-blue-500" />
              Literatura General
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CATEGORIES['Literatura General'].map((subcategory) => {
                const categoryBooks = state.books.filter(book => 
                  book.category === 'Literatura General' && book.subcategory === subcategory
                );
                
                return (
                  <Card 
                    key={subcategory} 
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      dispatch({ type: 'SET_SELECTED_CATEGORY', payload: subcategory });
                      dispatch({ type: 'SET_VIEW', payload: 'catalog' });
                    }}
                  >
                    <div className="text-center">
                      <Library className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <h4 className="font-medium mb-1">{subcategory}</h4>
                      <p className="text-sm text-muted-foreground">
                        {categoryBooks.length} libro{categoryBooks.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};