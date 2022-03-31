const fs = require('fs');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const unlinkAsync = promisify(fs.unlink);

function readText() {
  try {
    const dataBuffer = fs.readFileSync('text.json');
    const dataJSON = dataBuffer.toString();
    return JSON.parse(dataJSON);
  } catch (e) {
    return '';
  }
}

exports.writeToFile = (req, res, next) => {
  const dataJSON = JSON.stringify(req.body.text);
  fs.writeFileSync('text.json', dataJSON);
  res.status(200).json({
    status: 'success',
    message: 'writed'
  });
};
exports.readFile = (req, res, next) => {
  const text = readText();
  res.status(200).json({
    status: 'success',
    message: 'read file',
    text
  });
};
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: user
    }
  });
});
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const user = await User.find();
  res.status(200).json({
    status: 'success',
    data: {
      data: user
    }
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm || req.body.role) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  if (user.photo) {
    const path = `./public/files/${user.photo}`;
    if (fs.existsSync(path)) {
      await unlinkAsync(path);
      // fs.unlink(path, function(err) {
      //   if (err) return next(new AppError('photo not found', 404));
      // });
    }
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});
