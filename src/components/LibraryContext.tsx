import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  coverFile?: string; // base64 data if uploaded file
  pdfUrl: string;
  pdfFile?: string; // base64 data if uploaded file
  category: string;
  subcategory: string; // Nueva estructura: categoría principal y subcategoría
  uploadDate: string;
  pages?: number;
}

interface LibraryState {
  books: Book[];
  currentBook: Book | null;
  isAuthenticated: boolean;
  currentView: 'home' | 'catalog' | 'viewer' | 'login' | 'admin';
  searchTerm: string;
  selectedCategory: string;
}

type LibraryAction = 
  | { type: 'SET_BOOKS'; payload: Book[] }
  | { type: 'ADD_BOOK'; payload: Book }
  | { type: 'UPDATE_BOOK'; payload: Book }
  | { type: 'DELETE_BOOK'; payload: string }
  | { type: 'SET_CURRENT_BOOK'; payload: Book | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_VIEW'; payload: LibraryState['currentView'] }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string };

const initialState: LibraryState = {
  books: [],
  currentBook: null,
  isAuthenticated: false,
  currentView: 'home',
  searchTerm: '',
  selectedCategory: 'all'
};

const libraryReducer = (state: LibraryState, action: LibraryAction): LibraryState => {
  switch (action.type) {
    case 'SET_BOOKS':
      return { ...state, books: action.payload };
    case 'ADD_BOOK':
      return { ...state, books: [...state.books, action.payload] };
    case 'UPDATE_BOOK':
      return {
        ...state,
        books: state.books.map(book => 
          book.id === action.payload.id ? action.payload : book
        )
      };
    case 'DELETE_BOOK':
      return {
        ...state,
        books: state.books.filter(book => book.id !== action.payload)
      };
    case 'SET_CURRENT_BOOK':
      return { ...state, currentBook: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    default:
      return state;
  }
};

// Utility functions for file handling
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const validatePdfFile = (file: File): boolean => {
  const allowedTypes = ['application/pdf'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const getDisplayUrl = (book: Book, type: 'cover' | 'pdf'): string => {
  if (type === 'cover') {
    return book.coverFile || book.coverUrl;
  } else {
    return book.pdfFile || book.pdfUrl;
  }
};

// Definición de categorías y subcategorías
export const CATEGORIES = {
  'Literatura General': [
    'Clásicos',
    'Literatura Latinoamericana',
    'Ciencia Ficción',
    'Romance',
    'Misterio',
    'Historia',
    'Biografía',
    'Ensayo'
  ],
  'Educación Primaria': [
    'Matemáticas',
    'Ciencias',
    'Lenguaje',
    'Historia',
    'Geografía',
    'Cuentos Infantiles',
    'Actividades'
  ]
};

const LibraryContext = createContext<{
  state: LibraryState;
  dispatch: React.Dispatch<LibraryAction>;
} | null>(null);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(libraryReducer, initialState);

  // Cargar datos del localStorage al inicio
  useEffect(() => {
    const savedBooks = localStorage.getItem('libraryBooks');
    const savedAuth = localStorage.getItem('libraryAuth');
    
    if (savedBooks) {
      dispatch({ type: 'SET_BOOKS', payload: JSON.parse(savedBooks) });
    } else {
      // Datos mock iniciales con nueva estructura
      const mockBooks: Book[] = [
        // Literatura General
        {
          id: '1',
          title: 'El Quijote',
          author: 'Miguel de Cervantes',
          description: 'La historia del ingenioso hidalgo Don Quijote de la Mancha',
          coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
          pdfUrl: '/mock-pdfs/quijote.pdf',
          category: 'Literatura General',
          subcategory: 'Clásicos',
          uploadDate: '2024-01-15',
          pages: 863
        },
        {
          id: '2',
          title: 'Cien Años de Soledad',
          author: 'Gabriel García Márquez',
          description: 'La saga de la familia Buendía en el pueblo ficticio de Macondo',
          coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
          pdfUrl: '/mock-pdfs/cien-anos.pdf',
          category: 'Literatura General',
          subcategory: 'Literatura Latinoamericana',
          uploadDate: '2024-01-10',
          pages: 417
        },
        {
          id: '3',
          title: 'La Casa de los Espíritus',
          author: 'Isabel Allende',
          description: 'Una saga familiar que abarca varias generaciones',
          coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
          pdfUrl: '/mock-pdfs/casa-espiritus.pdf',
          category: 'Literatura General',
          subcategory: 'Literatura Latinoamericana',
          uploadDate: '2024-01-05',
          pages: 433
        },

        // Educación Primaria
        {
          id: '4',
          title: 'Matemáticas Divertidas',
          author: 'Prof. Ana Martínez',
          description: 'Aprende matemáticas básicas con ejercicios y juegos',
          coverUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=400&fit=crop',
          pdfUrl: '/mock-pdfs/matematicas-1.pdf',
          category: 'Educación Primaria',
          subcategory: 'Matemáticas',
          uploadDate: '2024-02-01',
          pages: 120
        },
        {
          id: '5',
          title: 'Números y Operaciones',
          author: 'Dr. Carlos Ruiz',
          description: 'Suma, resta, multiplicación y división',
          coverUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=400&fit=crop',
          pdfUrl: '/mock-pdfs/numeros-operaciones.pdf',
          category: 'Educación Primaria',
          subcategory: 'Matemáticas',
          uploadDate: '2024-02-05',
          pages: 95
        },
        {
          id: '6',
          title: 'Mi Primer Libro de Ciencias',
          author: 'Dra. María López',
          description: 'Experimentos simples y conceptos básicos de ciencias naturales',
          coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
          pdfUrl: '/mock-pdfs/ciencias-primaria.pdf',
          category: 'Educación Primaria',
          subcategory: 'Ciencias',
          uploadDate: '2024-02-10',
          pages: 80
        },
        {
          id: '7',
          title: 'El Mundo que nos Rodea',
          author: 'Prof. Juan Fernández',
          description: 'Descubre la naturaleza, los animales y el medio ambiente',
          coverUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=400&fit=crop',
          pdfUrl: '/mock-pdfs/mundo-naturaleza.pdf',
          category: 'Educación Primaria',
          subcategory: 'Ciencias',
          uploadDate: '2024-02-12',
          pages: 110
        },
        {
          id: '8',
          title: 'Aprendiendo a Leer y Escribir',
          author: 'Lic. Carmen Silva',
          description: 'Métodos y ejercicios para desarrollar la lectoescritura',
          coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=400&fit=crop',
          pdfUrl: '/mock-pdfs/lectoescritura.pdf',
          category: 'Educación Primaria',
          subcategory: 'Lenguaje',
          uploadDate: '2024-02-15',
          pages: 150
        },
        {
          id: '9',
          title: 'Cuentos de la Abuela',
          author: 'Rosa Montero',
          description: 'Historias tradicionales y cuentos populares para niños',
          coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
          pdfUrl: '/mock-pdfs/cuentos-abuela.pdf',
          category: 'Educación Primaria',
          subcategory: 'Cuentos Infantiles',
          uploadDate: '2024-02-25',
          pages: 60
        },
        {
          id: '10',
          title: 'Cuaderno de Actividades',
          author: 'Equipo Editorial Educativo',
          description: 'Ejercicios, juegos y actividades para reforzar el aprendizaje',
          coverUrl: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=300&h=400&fit=crop',
          pdfUrl: '/mock-pdfs/actividades.pdf',
          category: 'Educación Primaria',
          subcategory: 'Actividades',
          uploadDate: '2024-03-01',
          pages: 100
        }
      ];
      dispatch({ type: 'SET_BOOKS', payload: mockBooks });
    }

    if (savedAuth === 'true') {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    }
  }, []);

  // Guardar libros en localStorage cuando cambie el estado
  useEffect(() => {
    localStorage.setItem('libraryBooks', JSON.stringify(state.books));
  }, [state.books]);

  // Guardar estado de autenticación
  useEffect(() => {
    localStorage.setItem('libraryAuth', state.isAuthenticated.toString());
  }, [state.isAuthenticated]);

  return (
    <LibraryContext.Provider value={{ state, dispatch }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary debe usarse dentro de LibraryProvider');
  }
  return context;
};