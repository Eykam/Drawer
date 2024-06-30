import express, { NextFunction } from "express";
import mime from "mime-types";
import multer from "multer";
import path from "path";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import bodyParser from "body-parser";
import { S3Filesystem } from "./routes/files/Filesystem";
import dotenv from "dotenv";
import "./routes/auth/passport";

dotenv.config();

const FILESYSTEM = new S3Filesystem();
(async () => await FILESYSTEM.init())();
//======================================================= Server Config ==========================================================
const app = express();
const port = parseInt(process.env.PORT || "8000");

//#TODO: Add validation for env with zod
const FRONTEND_URL = process.env.PUBLIC_URL || "";
const FRONTEND_DOMAIN = process.env.PUBLIC_DOMAIN || "";

app.use(bodyParser.json());

app.use(
  cors({
    origin: [FRONTEND_DOMAIN],
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "",
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
    const uploadPath = "./Files/";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const isAuthenticated = (
  req: express.Request,
  res: express.Response,
  next: NextFunction
) => {
  console.log("checking auth");
  if (req.isAuthenticated()) {
    return next();
  }
  // res.redirect(FRONTEND_URL); // Redirect to login page if not authenticated
  res.redirect("http://localhost:93");
};

app.post("/checkAuth", (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).send();
  }

  return res.status(403).send();
});

app.get("/test", (req, res) => {
  return res.send("test");
});

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
  return res.send("Authorized!");
});

app.get("/success", (req, res) => {
  return res.status(200).send({ status: "success!" });
});

app.get("/failure", (req, res) => {
  return res.status(403).send({ status: "failure!" });
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    console.log("Logged out!");
  });

  return res.redirect(FRONTEND_URL);
});

// ============================================================================================

app.post("/rename", isAuthenticated, async (req, res) => {
  try {
    const source: string = req.body.source;
    const dest: string = req.body.dest;
    if (req.body.type === "dir") {
      console.log(`Dir Renaming ${source} => ${dest}`);
      const files = FILESYSTEM.fileList;

      await FILESYSTEM.renameObject(source, dest + "/");

      files.forEach(async (currFile) => {
        if (currFile.Key?.includes(source)) {
          console.log("currKey", currFile);
          let tempDest = currFile.Key.replace(source, dest + "/");
          console.log("tempDest", tempDest);
          await FILESYSTEM.renameObject(currFile.Key, tempDest);
        }
      });

      return res.status(200).send();
    } else {
      console.log(`File Renaming ${source} => ${dest}`);
      const status = await FILESYSTEM.renameObject(source, dest);

      if (status) {
        return res.status(200).send();
      }
    }
    res.status(400).send();
  } catch (err) {
    console.log("error renaming:", err);
  }
});

app.post("/delete", isAuthenticated, async (req, res) => {
  try {
    const names = req.body.names;

    const status = await FILESYSTEM.deleteObjects(names);

    if (status) {
      return res.status(200).send();
    }
    return res.status(400).send();
  } catch (err) {
    console.log("error renaming:", err);
  }
});

app.post("/mkdir", isAuthenticated, async (req, res) => {
  try {
    const name = req.body.name;

    const status = await FILESYSTEM.putObject(name, "dir");

    if (status) {
      return res.status(200).send();
    }
    return res.status(400).send();
  } catch (err) {
    console.log("error renaming:", err);
  }
});

app.post(
  "/upload",
  isAuthenticated,
  upload.array("files", 25),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).send("No files uploaded.");
      }

      console.log("req.files:", req.files);
      console.log("uploadPath", req.body.uploadPath);

      const fileRes = await FILESYSTEM.putObjects(
        req.files as Express.Multer.File[],
        req.body.uploadPath
      );

      console.log("putObjects res:", fileRes);

      // const fileDetails = req.files.map((file) => ({
      //   filePath: file.path,
      //   fileName: file.filename,
      // }));

      // You can now save 'fileDetails' to a database or perform other actions
      // ...

      return res.status(200).json({});
    } catch (error) {
      console.error("Error uploading files:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
);

app.post("/:resource(*)", isAuthenticated, async (req, res) => {
  const resource = req.body.path || "";
  const isDir = (path: string) => path[path.length - 1] === "/" || path === "";

  console.log(`Resource: ${resource} isDir: ${isDir(resource)}`);

  try {
    if (isDir(resource)) {
      const items = await FILESYSTEM.listObjects(resource);

      const contentList = items.map((item) => {
        console.log(item);
        return {
          name: item.Key,
          mimeType: isDir(item.Key || "") ? "dir" : mime.lookup(item.Key || ""),
          size: item.Size,
          lastModified: item.LastModified,
        };
      });

      return res.send(JSON.stringify(contentList));
    } else {
      const fileContent = await FILESYSTEM.getObject(resource);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${path.basename(resource)}`
      );

      console.log("fileContent:", fileContent);

      res.setHeader("Content-Type", mime.lookup(resource) || "");
      return res.send(fileContent.data);
    }
  } catch (error) {
    console.error(error);
    return res.status(404).send("Resource not found");
  }
});

// =========================================================================================
app.listen(port, "0.0.0.0", function () {
  console.log(`Server is running at http://localhost:${port}`);
});
