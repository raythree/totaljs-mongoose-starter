//
// If the error is a ValidationError extract all validation messages and
// return them, otherwise return null
//
module.exports = function (err) {
  if (err.name !== 'ValidationError') return null;

  const messages = [];
  if (!err.errors)  return null;

  Object.keys(err.errors).forEach((name) => {
    messages.push(name + ': ' + err.errors[name].message);
  });

  return messages.join('\n');
}
 