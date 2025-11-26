
// Global error handling middleware

const errorHandler = (err, req, res, next) => {

  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.error('❌ ERROR FOUND:');

  console.error('Name:', err.name);

  console.error('Message:', err.message);

  console.error('Stack:', err.stack);

  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Cast Error to invalid IDs 

  if (err.name === 'CastError') {

    return res.status(400).json({

      success: false,

      message: 'Recurso no encontrado',

      error: 'ID no válido'

    });

  }

  // Validation Error

  if (err.name === 'ValidationError') {

    const messages = Object.values(err.errors).map(error => error.message);

    return res.status(400).json({

      success: false,

      message: 'Error de validación',

      errors: messages

    });

  }

  // Duplicate Key Error

  if (err.code === 11000) {

    const field = Object.keys(err.keyPattern)[0];

    return res.status(400).json({

      success: false,

      message: 'Valor duplicado',

      error: `El campo "${field}" ya existe en la base de datos`

    });

  }

  // Generic Server Error

  res.status(err.statusCode || 500).json({

    success: false,

    message: err.message || 'Server Error',

    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })

  });

};

module.exports = errorHandler;