import React, { useState } from 'react';
import { useLibrary, getDisplayUrl } from './LibraryContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Maximize2, Minimize2, Download } from 'lucide-react';

export const BookViewer: React.FC = () => {
  const { state, dispatch } = useLibrary();
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!state.currentBook) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">No hay libro seleccionado</h3>
          <Button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'catalog' })}>
            Ir al Catálogo
          </Button>
        </div>
      </div>
    );
  }

  const book = state.currentBook;
  const totalPages = book.pages || 100; // Valor por defecto si no se especifica
  const progress = (currentPage / totalPages) * 100;
  const coverUrl = getDisplayUrl(book, 'cover');
  const pdfUrl = getDisplayUrl(book, 'pdf');

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDownloadPdf = () => {
    if (book.pdfFile) {
      // Si es un archivo base64, crear un blob y descargarlo
      const link = document.createElement('a');
      link.href = book.pdfFile;
      link.download = `${book.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (book.pdfUrl) {
      // Si es una URL, abrir en nueva pestaña
      window.open(book.pdfUrl, '_blank');
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-background`}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'catalog' })}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Catálogo
              </Button>
              <div>
                <h1 className="font-bold">{book.title}</h1>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              {(book.pdfFile || book.pdfUrl) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPdf}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {book.pdfFile ? 'Descargar' : 'Abrir'} PDF
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex">
        {/* Side Panel - Solo visible en desktop */}
        {!isFullscreen && (
          <aside className="hidden lg:block w-80 border-r bg-card p-6">
            <div className="mb-6">
              <img 
                src={coverUrl} 
                alt={book.title}
                className="w-full aspect-[3/4] object-cover rounded-lg mb-4"
              />
              <h3 className="font-bold mb-2">{book.title}</h3>
              <p className="text-muted-foreground mb-2">{book.author}</p>
              <p className="text-sm text-muted-foreground mb-4">{book.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Categoría:</span>
                  <span className="text-muted-foreground">{book.category}</span>
                </div>
                {book.gradeLevel && (
                  <div className="flex justify-between">
                    <span>Nivel:</span>
                    <span className="text-muted-foreground">{book.gradeLevel}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Páginas:</span>
                  <span className="text-muted-foreground">{totalPages}</span>
                </div>
                <div className="flex justify-between">
                  <span>Progreso:</span>
                  <span className="text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                {book.pdfFile && (
                  <div className="flex justify-between">
                    <span>Archivo:</span>
                    <span className="text-muted-foreground text-green-600">PDF subido</span>
                  </div>
                )}
              </div>
              
              {(book.pdfFile || book.pdfUrl) && (
                <Button 
                  className="w-full mt-4" 
                  onClick={handleDownloadPdf}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {book.pdfFile ? 'Descargar' : 'Abrir'} PDF Original
                </Button>
              )}
            </div>

            {/* Table of Contents Simulation */}
            <div>
              <h4 className="font-medium mb-3">Capítulos</h4>
              <div className="space-y-2">
                {Array.from({ length: Math.min(10, Math.floor(totalPages / 10)) }, (_, i) => (
                  <button
                    key={i}
                    className="block w-full text-left text-sm p-2 rounded hover:bg-accent transition-colors"
                    onClick={() => goToPage((i + 1) * 10)}
                  >
                    Capítulo {i + 1} - Página {(i + 1) * 10}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* PDF Viewer Area */}
        <div className="flex-1 flex flex-col">
          {/* Viewer Content */}
          <div className="flex-1 bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl aspect-[8.5/11] bg-white dark:bg-gray-800 shadow-lg">
              <div className="h-full p-8 flex flex-col justify-center items-center">
                {/* Simulación del contenido del PDF */}
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">{book.title}</h2>
                  <p className="text-lg text-muted-foreground">por {book.author}</p>
                  <div className="h-px bg-border my-6"></div>
                  <p className="text-sm leading-relaxed max-w-2xl">
                    Esta es una simulación del visor de PDF para la página {currentPage}. 
                    {book.pdfFile ? 
                      ' El archivo PDF real ha sido subido y está disponible para descarga.' :
                      ' En una implementación real, aquí se mostraría el contenido real del PDF usando una biblioteca como react-pdf o pdf.js.'
                    }
                  </p>
                  <div className="mt-8 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {book.description}
                    </p>
                    {book.gradeLevel && (
                      <p className="text-xs text-muted-foreground">
                        Nivel educativo: {book.gradeLevel}
                      </p>
                    )}
                  </div>
                  
                  {book.pdfFile && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        📄 Archivo PDF original disponible para descarga
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Navigation Controls */}
          <div className="border-t bg-card p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">Página</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 text-center text-sm border rounded"
                />
                <span className="text-sm">de {totalPages}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};