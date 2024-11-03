// const asyncHandler = (requestHandler) => {
//   return (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//   };
// };

// export { asyncHandler };

const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
      try {
          await requestHandler(req, res, next);
      } catch (error) {
          res.status(500).json({
              success: false,
              message: error.message || "Something went wrong!"
          });
      }
  };
};

export { asyncHandler };












//const asyncHandler = () => {}->callback
//const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

// const asyncHandler = (fn ) => async(req, res, next)=>{
//     try{
//         await fn(req,res,next)
//     } catch (error){
//         res.status(err.code||500).json({
//             succes: false,
//             message: err.message
//         })
//     }
// }
