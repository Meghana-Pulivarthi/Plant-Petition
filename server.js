const express = require("express");
const app = express();
const db = require("./db");
app.use(express.static("./public"));
const cookieSession = require("cookie-session");
const bcrypt = require("./bcrypt");

const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

//////////////////////Cookies////////////////////
const cookie_secret =
    process.env.cookie_secret || require("./secret.json").cookie_secret;
app.use(
    cookieSession({
        secret: cookie_secret,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

/* What we save in the cookies.s
signatureId
userId
*/

app.use((req, res, next) => {
    console.log("---------------------");
    console.log("req.url:", req.url);
    console.log("req.method:", req.method);
    console.log("req.session:", req.session);
    console.log("---------------------");
    next();
});

//////////////////////Cookies////////////////////

////////////To prevent clickjacking/////////////
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});
////////////To prevent clickjacking/////////////

app.get("/", (req, res) => {
    res.redirect("/register");
});

//////////////////////////Get Register/////////////////////
app.get("/register", (req, res) => {
    res.render("register");
});
//////////////////////////Get Register/////////////////////

//////////////////////////Post Register/////////////////////
app.post("/register", (req, res) => {
    console.log("pwd in register", req.body);
    bcrypt
        .hash(req.body.password)
        .then((hashpasswd) => {
            db.addUser(
                req.body.fname,
                req.body.lname,
                req.body.email,
                hashpasswd
            )
                .then((result) => {
                    console.log("Result in bcrypt.hash", result.rows);
                    req.session.userID = result.rows[0].id;
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("Error in  bcrypt hash", err);
                });
        })
        .catch((err) => {
            console.log("Error in Post Register ", err);
        });
});
//////////////////////////Post Register/////////////////////
//////////////////////////Get Login/////////////////////
app.get("/login", (req, res) => {
    res.render("login");
});
//////////////////////////Get Login/////////////////////

//////////////////////////Post Login/////////////////////
app.post("/login", (req, res) => {
    db.getEmail(req.body.email)
        .then((result) => {
            // console.log("result.rows[0].password", result.rows[0].password);
            // console.log("req.body.password", req.body.password);
            bcrypt
                .compare(req.body.password, result.rows[0].password)
                .then((match) => {
                    if (match) {
                        req.session.userID = result.rows[0].id;
                        if (req.session.signatureID) {
                            res.redirect("/thanks");
                        } else {
                            res.redirect("/petition");
                        }
                    } else {
                        res.render("login");
                    }
                })
                .catch((err) => {
                    console.log("Error in match", err);
                });
        })
        .catch((err) => {
            console.log("Error in get email", err);
        });
});
//////////////////////////Post Login/////////////////////

//////////////////////////Get Petition/////////////////////
app.get("/petition", (req, res) => {
    console.log("running GET / petition");

    if (req.session.signatureID) {
        console.log("redirect thanks   ");
        res.redirect("/thanks");
    } else {
        res.render("petition");
    }
});
//////////////////////////Get Petition/////////////////////

////////////////////////Post Petition////////////////
app.post("/petition", (req, res) => {
    db.addSigners(req.body.signature, req.session.userID)
        .then((result) => {
            // console.log("addSigners result", result);

            req.session.signatureID = result.rows[0].id;
            // console.log(result.rows[0].id);
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("err in db.addSigners:", err);

            res.render("petition");
        });
});

////////////////////////Post Petition////////////////

//////////////////////////Get Thanks/////////////////////

app.get("/thanks", (req, res) => {
    console.log("runnning GET / thanks");
    let dataUrl;
    let numOfSigners;
    ///////////////IMG TO URL///////////
    db.getDataURL(req.session.signatureID)
        .then((result) => {
            console.log("dataurl result", result);
            console.log("result.rows", result.rows[0]);
            dataUrl = result.rows[0].signature;
        })
        .catch((err) => {
            console.log("err in db.getDataURL:", err);
        });
    ///////////////IMG TO URL///////////

    db.countSigners()
        .then((result) => {
            if (req.session.signatureID) {
                ///////////COUNT SIGNERS///////////
                db.getSigners()
                    .then(({ rows }) => {
                        numOfSigners = rows.length;
                        // console.log("rows in getSigners: ", rows);
                        // console.log("num of signers: ", numOfSigners);
                        res.render("thanks", {
                            results: rows,
                            numOfSigners,
                            dataUrl,
                        });
                    })
                    .catch((err) => {
                        console.log("err in db.countSigners:", err);
                    });
                ///////////COUNT SIGNERS///////////
            } else {
                console.log("redirect petition");
                res.redirect("/petition");
            }
        })
        .catch((err) => {
            console.log("err in db.countSigners:", err);
        });
});

//////////////////////////Get Thanks/////////////////////

//////////////////////////Get signers/////////////////////

app.get("/signers", (req, res) => {
    // has my user already signed the petition? -> check cookie
    console.log("req.session: ", req.session);
    db.getSigners()
        .then((result) => {
            console.log("result in getSigners: ", result);
            if (req.session.signatureID) {
                res.render("signers", {
                    results: result.rows,
                });
            } else {
                res.redirect("/petition");
            }
        })
        .catch((err) => {
            console.log("err in db.getsigners:", err);
        });
});

//////////////////////////Get signers/////////////////////

app.get("/logout", (req, res) => {
    // req.session = null - destroys a session
    req.session = null;
    res.redirect("/login");
});
app.listen(process.env.PORT || 8080, () => {
    console.log("You got this petition");
});

app.get("/profile", (req, res) => {
    //     Redirected to immediately after successful registration
    // Renders a template with a form
    // if (req.session.userID) {
    res.render("profile");
    // } else {
    //     res.render("/login");
    // }
});

app.post("/profile", (req, res) => {
    if (req.body.age == "" && req.body.city == "" && req.body.url == "") {
        res.redirect("/petition");
    } else {
        let url = req.body.url;
        if (
            !url.startsWith("http://") &&
            !url.startsWith("https://") &&
            !url.startsWith("//")
        ) {
            url = "";
        }
        db.addProfiles(req.body.age, req.body.city, url, req.session.userID)
            .then((result) => {
                req.session.signatureID = result.rows[0].id;
                console.log(result.rows[0].id);
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("err in db.addProfiles:", err);

                res.render("profile");
            });
    }
});
app.get("/signers/:city", (req, res) => {
    if (req.session.signatureID) {
        db.getCity(req.params.city)
            .then((result) => {
                console.log("result in signers/:city", result.rows);
                const results = result.rows;
                res.render("signers", {
                    results,
                    city: req.params.city,
                });
            })
            .catch((err) => {
                console.log("error in signers/:city", err);
            });
    } else {
        res.redirect("/petition");
    }
});

// app.get("/edit", (req, res) => {
//     res.render("edit");
// });

// app.post("/edit", (req, res) => {
//     if (req.body.password != "") {
//         db.editWithoutPass(
//             req.body.fname,
//             req.body.lname,
//             req.body.email,
//             req.body.password
//         )
//             .then(() => {})
//             .catch((err) => {});
//     } else {
//         db.editWithPass(req.body.fname, req.body.lname, req.body.email)
//             .then(() => {})
//             .catch((err) => {});
//     }
// });
