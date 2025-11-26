const mongoose = require('mongoose');

// Middleware para validar ObjectId de MongoDB

const validateId = (req, res, next) => {

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {

    return res.status(400).json({

      success: false,

      message: 'Invalid ID',

      error: `"${id}" Is not a valid MongoDB ObjectId`

    });

  }

  next();

};

module.exports = validateId;