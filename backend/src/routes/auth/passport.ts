import passport from "passport";
import { Strategy } from "passport-local";
import dotenv from "dotenv";

dotenv.config();

const LocalStrategy = Strategy;
// const bcrypt = require("bcrypt");

const user = {
  username: process.env.AUTH_USER,
  passwordHash: process.env.AUTH_PASS,
  id: 1,
};

passport.use(
  new LocalStrategy((username, password, done) => {
    try {
      // Implement your own logic to fetch user from a database

      // Compare the provided password with the hashed password from the database
      // console.log("username", username);
      // console.log("user.username");

      if (user.username === username) {
        console.log("Username found!");
        if (user.passwordHash === password) {
          console.log("successfully authenticated!");
          return done(null, user);
        }

        console.log("Incorrect password!");
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, false, { message: "Incorrect username." });
      // const passwordMatch = bcrypt
      //   .compare(password, user.passwordHash)
      //   .then((match) => {
      //     if (!match) {
      //       return done(null, false, { message: "Incorrect password." });
      //     }

      //     return done(null, user);
      //   });
    } catch (error) {
      console.log("error in strategy", error);
      return done(error);
    }
  })
);

// Serialize user information for session storage
passport.serializeUser((user, done) => {
  console.log("Serializing!");
  console.log(user);

  done(null, user);
});

// Deserialize user information from session storage
passport.deserializeUser((id, done) => {
  try {
    // Implement your own logic to fetch user from a database
    const currUser = { id: 1, username: user.username };

    console.log("Deserializing!");
    console.log(currUser);

    done(null, currUser);
  } catch (error) {
    done(error);
  }
});
