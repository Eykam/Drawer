const express = require("express");
const mime = require("mime-types");
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const bodyParser = require("body-parser");

const { Filesystem } = require("./routes/files/Filesystem.js");
const FILESYSTEM = new Filesystem();

// deleteObjects([
//   "testFile.txt",
//   "testFolder/testFile3.txt",
//   "newDir2",
//   "newDir2/",
// ]);

// const getParams = [
//   "testFile3.txt",
//   "testFile2.txt",
//   "testFolder/testFolder2/testFile (11).txt",
// ];

// getObjects(getParams);

// const putParams = [
//   { name: "testFile12.txt", contentType: "text/plain", data: "Testing123..." },
//   {
//     name: "testFolder/testFile12.txt",
//     contentType: "text/plain",
//     data: "Testing12...",
//   },
//   { name: "testFolder/test123/", contentType: "dir", data: "" },
// ];
// putObjects(putParams);
// putObjects("testFolder/testFile3.txt", "text/plain", "Hello! Testing1...");
// getRoot();
// listObjects("testFolder/");

//======================================================= Server Config ==========================================================
const app = express();
const port = 8000; //process.env.PORT || 3008;

const FRONTEND_URL = "http://localhost:93";
const FRONTEND_DOMAIN = "localhost";

app.use(bodyParser.json());

app.use(
  cors({
    origin: [FRONTEND_DOMAIN],
    credentials: true,
  })
);

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use req.body.uploadPath to determine the destination folder
    const uploadPath = "./Files/" + req.body.uploadPath || "uploads/";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const isAuthenticated = (req, res, next) => {
  console.log("checking auth");
  if (req.isAuthenticated()) {
    return next();
  }
  // res.redirect(FRONTEND_URL); // Redirect to login page if not authenticated
  res.redirect("http://localhost:93");
};

// app.get("/", isAuthenticated, (req, res) => {
//   res.send("home");
// });

app.post("/checkAuth", (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).send();
  }

  return res.status(403).send();
});

app.get("/test", (req, res) => {
  res.send("test");
});

// app.get("/login", (req, res) => {
//   res.sendFile(path.join(__dirname, "./templates/login.html"));
// });

app.post("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) console.log(err);

    req.session.cookie.expires = new Date(1);

    return res.status(200).send();
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/success",
    failureRedirect: "/failure",
  })
);

app.get("/testAuth", isAuthenticated, (req, res) => {
  res.send("Authorized!");
});

app.get("/success", (req, res) => {
  res.status(200).send({ status: "success!" });
});

app.get("/failure", (req, res) => {
  res.status(403).send({ status: "failure!" });
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect(FRONTEND_URL);
});

app.post(
  "/upload",
  isAuthenticated,
  upload.array("files", 25),
  async (req, res) => {
    try {
      console.log("upload path", req.body.uploadPath);
      if (!req.files || req.files.length === 0) {
        return res.status(400).send("No files uploaded.");
      }

      const fileDetails = req.files.map((file) => ({
        filePath: file.path,
        fileName: file.filename,
      }));

      // You can now save 'fileDetails' to a database or perform other actions
      // ...

      res.status(200).json(fileDetails);
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.post("/:resource(*)", isAuthenticated, async (req, res) => {
  const resource = req.body.path;

  try {
    const filePath = path.join("./Files", resource);
    console.log("filepath", filePath);
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      const items = await fs.readdir(filePath, { withFileTypes: true });
      const contentList = items.map((item) => {
        // console.log("item", item);
        // console.log("mimetype:", mime.lookup(item.name));
        return {
          name: path.join(resource, item.name),
          dir: item.isDirectory(),
        };
      });

      res.send(JSON.stringify(contentList));
    } else {
      // res.sendFile(filePath);
      const fileContent = await fs.readFile(filePath);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${path.basename(resource)}`
      );
      res.setHeader("Content-Type", mime.lookup(filePath));
      res.send(fileContent);
    }
  } catch (error) {
    console.error(error);
    res.status(404).send("Resource not found");
  }
});

app.listen(port, "0.0.0.0", function () {
  console.log(`Server is running at http://localhost:${port}`);
});
