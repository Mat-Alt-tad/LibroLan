import React, { useState } from 'react';
import { useLibrary, Book, fileToBase64, validateImageFile, validatePdfFile, getDisplayUrl, CATEGORIES } from './LibraryContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Plus, Edit, Trash2, LogOut, Upload, BookOpen, GraduationCap, Users, Image, FileText, X } from 'lucide-react';
import { toast } from "sonner@2.0.3"

export const AdminPage: React.FC = () => {
  const { state, dispatch } = useLibrary();
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    subcategory: '',
    coverUrl: '',
    coverFile: null as File | null,
    coverPreview: '',
    pdfUrl: '',
    pdfFile: null as File | null,
    pdfFileName: '',
    pages: ''
  });

  const handleOpenDialog = (book?: Book) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title,
        author: book.author,
        description: book.description,
        category: book.category,
        subcategory: book.subcategory,
        coverUrl: book.coverUrl,
        coverFile: null,
        coverPreview: getDisplayUrl(book, 'cover'),
        pdfUrl: book.pdfUrl,
        pdfFile: null,
        pdfFileName: book.pdfFile ? 'Archivo cargado' : '',
        pages: book.pages?.toString() || ''
      });
    } else {
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        description: '',
        category: '',
        subcategory: '',
        coverUrl: '',
        coverFile: null,
        coverPreview: '',
        pdfUrl: '',
        pdfFile: null,
        pdfFileName: '',
        pages: ''
      });
    }
    setShowBookDialog(true);
  };

  const handleCloseDialog = () => {
    setShowBookDialog(false);
    setEditingBook(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      toast.error('Por favor selecciona una imagen válida (JPEG, PNG, WebP) menor a 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(20);
      
      const preview = URL.createObjectURL(file);
      setUploadProgress(60);
      
      setFormData(prev => ({
        ...prev,
        coverFile: file,
        coverPreview: preview
      }));
      
      setUploadProgress(100);
      toast.success('Imagen de portada cargada correctamente');
    } catch (error) {
      toast.error('Error al cargar la imagen');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validatePdfFile(file)) {
      toast.error('Por favor selecciona un archivo PDF válido menor a 50MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(20);
      
      setFormData(prev => ({
        ...prev,
        pdfFile: file,
        pdfFileName: file.name
      }));
      
      setUploadProgress(100);
      toast.success('Archivo PDF cargado correctamente');
    } catch (error) {
      toast.error('Error al cargar el PDF');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const removeCoverImage = () => {
    if (formData.coverPreview && formData.coverPreview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.coverPreview);
    }
    setFormData(prev => ({
      ...prev,
      coverFile: null,
      coverPreview: ''
    }));
  };

  const removePdfFile = () => {
    setFormData(prev => ({
      ...prev,
      pdfFile: null,
      pdfFileName: ''
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      subcategory: '' // Reset subcategory when category changes
    }));
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.category || !formData.subcategory) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!formData.coverFile && !formData.coverUrl && !editingBook?.coverFile) {
      toast.error('Por favor proporciona una imagen de portada');
      return;
    }

    if (!formData.pdfFile && !formData.pdfUrl && !editingBook?.pdfFile) {
      toast.error('Por favor proporciona un archivo PDF');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      let coverFileData = editingBook?.coverFile;
      let pdfFileData = editingBook?.pdfFile;

      // Procesar imagen de portada
      if (formData.coverFile) {
        setUploadProgress(30);
        coverFileData = await fileToBase64(formData.coverFile);
      }

      // Procesar archivo PDF
      if (formData.pdfFile) {
        setUploadProgress(70);
        pdfFileData = await fileToBase64(formData.pdfFile);
      }

      setUploadProgress(90);

      const bookData: Book = {
        id: editingBook?.id || Date.now().toString(),
        title: formData.title,
        author: formData.author,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        coverUrl: formData.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
        coverFile: coverFileData,
        pdfUrl: formData.pdfUrl || '/mock-pdfs/default.pdf',
        pdfFile: pdfFileData,
        uploadDate: editingBook?.uploadDate || new Date().toISOString().split('T')[0],
        pages: formData.pages ? parseInt(formData.pages) : undefined
      };

      setUploadProgress(100);

      if (editingBook) {
        dispatch({ type: 'UPDATE_BOOK', payload: bookData });
        toast.success('Libro actualizado correctamente');
      } else {
        dispatch({ type: 'ADD_BOOK', payload: bookData });
        toast.success('Libro agregado correctamente');
      }

      handleCloseDialog();
    } catch (error) {
      toast.error('Error al guardar el libro');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBook = (bookId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este libro?')) {
      dispatch({ type: 'DELETE_BOOK', payload: bookId });
      toast.success('Libro eliminado correctamente');
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    dispatch({ type: 'SET_VIEW', payload: 'home' });
    toast.success('Sesión cerrada');
  };

  // Estadísticas por categorías
  const educationBooks = state.books.filter(book => book.category === 'Educación Primaria').length;
  const generalBooks = state.books.filter(book => book.category === 'Literatura General').length;

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
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Libro
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{state.books.length}</p>
                <p className="text-muted-foreground">Total de Libros</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <GraduationCap className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{educationBooks}</p>
                <p className="text-muted-foreground">Educación Primaria</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Upload className="h-10 w-10 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{generalBooks}</p>
                <p className="text-muted-foreground">Literatura General</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{new Set(state.books.map(book => book.author)).size}</p>
                <p className="text-muted-foreground">Autores</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Category Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-500" />
              Educación Primaria
            </h3>
            <div className="space-y-2">
              {CATEGORIES['Educación Primaria'].map((subcategory) => {
                const count = state.books.filter(book => 
                  book.category === 'Educación Primaria' && book.subcategory === subcategory
                ).length;
                return (
                  <div key={subcategory} className="flex justify-between items-center">
                    <span className="text-sm">{subcategory}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Literatura General
            </h3>
            <div className="space-y-2">
              {CATEGORIES['Literatura General'].map((subcategory) => {
                const count = state.books.filter(book => 
                  book.category === 'Literatura General' && book.subcategory === subcategory
                ).length;
                return (
                  <div key={subcategory} className="flex justify-between items-center">
                    <span className="text-sm">{subcategory}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Books List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Gestión de Libros</h2>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Libro
            </Button>
          </div>

          <div className="space-y-4">
            {state.books.map((book) => (
              <div key={book.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <img 
                  src={getDisplayUrl(book, 'cover')} 
                  alt={book.title}
                  className="w-16 h-20 object-cover rounded"
                />
                
                <div className="flex-1">
                  <h3 className="font-bold">{book.title}</h3>
                  <p className="text-muted-foreground">{book.author}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={book.category === 'Educación Primaria' ? "default" : "secondary"}
                    >
                      {book.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {book.subcategory}
                    </Badge>
                    {book.coverFile && (
                      <Badge variant="outline" className="text-xs text-green-600">
                        <Image className="h-3 w-3 mr-1" />
                        Imagen subida
                      </Badge>
                    )}
                    {book.pdfFile && (
                      <Badge variant="outline" className="text-xs text-blue-600">
                        <FileText className="h-3 w-3 mr-1" />
                        PDF subido
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Subido: {new Date(book.uploadDate).toLocaleDateString()}
                    {book.pages && ` • ${book.pages} páginas`}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(book)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBook(book.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>

      {/* Book Dialog */}
      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBook ? 'Editar Libro' : 'Agregar Nuevo Libro'}
            </DialogTitle>
          </DialogHeader>
          
          {isUploading && uploadProgress > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Procesando archivos...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
          
          <form onSubmit={handleSaveBook} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Autor *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Categorización */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CATEGORIES).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategoría *</Label>
                <Select 
                  value={formData.subcategory} 
                  onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                  disabled={!formData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una subcategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.category && CATEGORIES[formData.category as keyof typeof CATEGORIES].map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pages">Número de Páginas</Label>
                <Input
                  id="pages"
                  type="number"
                  value={formData.pages}
                  onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                />
              </div>
            </div>

            {/* Sección de archivos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Imagen de portada */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Imagen de Portada</Label>
                
                {formData.coverPreview ? (
                  <div className="relative">
                    <img 
                      src={formData.coverPreview} 
                      alt="Vista previa" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeCoverImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Image className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Arrastra una imagen aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, WebP (máx. 5MB)
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="coverFile" className="cursor-pointer">
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir Imagen
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="coverFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="coverUrl">O proporciona una URL</Label>
                    <Input
                      id="coverUrl"
                      type="url"
                      placeholder="https://..."
                      value={formData.coverUrl}
                      onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Archivo PDF */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Archivo PDF</Label>
                
                {formData.pdfFileName ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="font-medium">{formData.pdfFileName}</p>
                          <p className="text-sm text-muted-foreground">
                            Archivo PDF seleccionado
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removePdfFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Arrastra un PDF aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF (máx. 50MB)
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="pdfFile" className="cursor-pointer">
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir PDF
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="pdfFile"
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="pdfUrl">O proporciona una URL</Label>
                    <Input
                      id="pdfUrl"
                      placeholder="/ruta/al/archivo.pdf"
                      value={formData.pdfUrl}
                      onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? 'Procesando...' : (editingBook ? 'Actualizar' : 'Agregar')} Libro
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};