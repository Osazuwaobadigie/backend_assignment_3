const http = require("http");
const { findUser } = require("./db.function");




function getBodyFromStream(req) {
  return new Promise((resolve, reject) => {
    const data = [];
    req.on("data", (chunk) => {
      data.push(chunk);
    });
    req.on("end", () => {
      const body = Buffer.concat(data).toString();
      if (body) {
        // assuming that the body is a json object
        resolve(JSON.parse(body));
        return;
      }
      resolve({});
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}

function authenticate(req, res, next) {
  const { username, password } = req.headers;
  console.log("authenticate", req.headers);
  const user = findUser(username);
  if (!user) {
    res.statusCode = 401;
    res.end();
    return;
  }
  if (user.username !== username || user.password !== password) {
    res.statusCode = 401;
    res.end();
    return;
  }
  next(req, res);
}

function getBooks(req, res) {
  console.log("getBooks", req.body);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ books: [{ name: "Harry Potter" }] }));
}





function getAuthors(req, res) {
  console.log("getBooks", req.body);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ authors: [{ name: "J.K. Rowling" }] }));
}






const server = http.createServer(async (req, res) => {
  // getBodyFromStream(req, res, getBooks);
  try {
    const body = await getBodyFromStream(req);
    req.body = body;
    if (req.url === "/books") {
      authenticate(req, res, getBooks);
    }
    if (req.url === "/authors") {
      authenticate(req, res, getAuthors);
    }
    
  } catch (error) {
    res.statusCode = 500;
    res.end(error.message);
  }
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
