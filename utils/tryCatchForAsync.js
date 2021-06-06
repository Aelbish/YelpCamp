//This is a reusable function to avoid writing try catch for every async function
//This function will catch error
module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch((e) => next(e));
  };
};
