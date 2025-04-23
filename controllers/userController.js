const UserService  = require("../services/UserService");

class UserController {
  static async logIn(req, res) {
    console.log('req body: ', req.body)
    try {
      const { user, token } = await UserService.logIn(req, res);
      return res
        .status(201)
        .send({ token, user, message: "Login bem sucedido" });
    } catch (e) {
      console.log("erro no login: ", e)
      return res
        .status(500)
        .send({ message: e.message });
    }
  }
}

module.exports = UserController;
