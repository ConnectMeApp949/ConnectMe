const translations = {
  en: {
    // Tabs
    explore: 'Explore',
    wishlists: 'Favorites',
    bookings: 'Bookings',
    messages: 'Messages',
    profile: 'Profile',

    // Home
    searchPlaceholder: 'Search vendors...',
    featuredVendors: 'Featured Vendors',
    recentlyAdded: 'Recently Added',
    recentlyViewed: 'Recently Viewed',
    map: 'Map',

    // Auth
    logInOrSignUp: 'Log in or sign up',
    continueBtn: 'Continue',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    forgotPassword: 'Forgot password?',
    email: 'Email',
    password: 'Password',
    firstName: 'First name',
    lastName: 'Last name',

    // Vendor Detail
    bookNow: 'Book Now',
    instantBook: 'Instant Book',
    reviews: 'Reviews',
    availability: 'Availability',
    about: 'About',
    location: 'Location',
    reportVendor: 'Report this vendor',

    // Bookings
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    requestToBook: 'Request to book',
    confirmAndPay: 'Confirm and Pay',
    cancelBooking: 'Cancel Booking',
    modifyBooking: 'Modify Booking',
    viewReceipt: 'View Receipt',
    leaveReview: 'Leave a Review',
    leaveTip: 'Leave a Tip',

    // Profile
    accountSettings: 'Account Settings',
    getHelp: 'Get Help',
    viewProfile: 'View Profile',
    privacy: 'Privacy',
    legal: 'Legal',
    logOut: 'Log Out',
    darkMode: 'Dark Mode',
    language: 'Language',

    // Common
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    done: 'Done',
    next: 'Next',
    back: 'Back',
    search: 'Search',
    loading: 'Loading...',
    noResults: 'No results found',
    tryAgain: 'Try again',
  },
  es: {
    // Tabs
    explore: 'Explorar',
    wishlists: 'Favoritos',
    bookings: 'Reservas',
    messages: 'Mensajes',
    profile: 'Perfil',

    // Home
    searchPlaceholder: 'Buscar proveedores...',
    featuredVendors: 'Proveedores Destacados',
    recentlyAdded: 'Agregados Recientemente',
    recentlyViewed: 'Vistos Recientemente',
    map: 'Mapa',

    // Auth
    logInOrSignUp: 'Iniciar sesión o registrarse',
    continueBtn: 'Continuar',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    forgotPassword: '¿Olvidaste tu contraseña?',
    email: 'Correo electrónico',
    password: 'Contraseña',
    firstName: 'Nombre',
    lastName: 'Apellido',

    // Vendor Detail
    bookNow: 'Reservar Ahora',
    instantBook: 'Reserva Instantánea',
    reviews: 'Reseñas',
    availability: 'Disponibilidad',
    about: 'Acerca de',
    location: 'Ubicación',
    reportVendor: 'Reportar este proveedor',

    // Bookings
    upcoming: 'Próximas',
    completed: 'Completadas',
    cancelled: 'Canceladas',
    requestToBook: 'Solicitar reserva',
    confirmAndPay: 'Confirmar y Pagar',
    cancelBooking: 'Cancelar Reserva',
    modifyBooking: 'Modificar Reserva',
    viewReceipt: 'Ver Recibo',
    leaveReview: 'Dejar una Reseña',
    leaveTip: 'Dejar una Propina',

    // Profile
    accountSettings: 'Configuración de Cuenta',
    getHelp: 'Obtener Ayuda',
    viewProfile: 'Ver Perfil',
    privacy: 'Privacidad',
    legal: 'Legal',
    logOut: 'Cerrar Sesión',
    darkMode: 'Modo Oscuro',
    language: 'Idioma',

    // Common
    save: 'Guardar',
    cancel: 'Cancelar',
    submit: 'Enviar',
    done: 'Listo',
    next: 'Siguiente',
    back: 'Atrás',
    search: 'Buscar',
    loading: 'Cargando...',
    noResults: 'No se encontraron resultados',
    tryAgain: 'Intentar de nuevo',
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations['en'];

export default translations;
