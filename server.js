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
    //     call the bcrypt.hash function and pass it the password from req.body
    // call a function to insert the hashed password that bcrypt.hash returned plus
    // the first, last, and email from req.body into the database and create a new user
    // after the query, put the newly created user's id into the session so that
    // the user is logged in. Any time you want to check to see if a user is logged in you can check to see if req.session.userId exists
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
                    res.redirect("/petition");
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
    if (req.body.userID) {
        res.render("petition");
    } else {
        res.render("login");
    }
});
//////////////////////////Get Login/////////////////////

//////////////////////////Post Login/////////////////////
app.post("/login", (req, res) => {
    //             Pass req.body.email to a function that does a query to find user info by email
    //REQ.BODY gets data from html
    // console.log("req.body.email", req.body.email);
    db.getEmail(req.body.email)
        .then((result) => {
            // console.log("result.rows[0].password", result.rows);
            bcrypt
                .compare(req.body.password, result.rows[0].password)
                .then((match) => {
                    if (match) {
                        req.session.userID = result.rows[0].id;
                        if (req.session.signatureID) {
                            res.redirect("/thanks");
                        } else {
                            res.render("petititon");
                        }
                    } else {
                        res.render("login");
                    }
                })
                .catch((err) => {
                    console.log("Error in match", err);
                });
            // Use bcrypt.compare to see if the password the user typed in the login form (req.body.password)
            // is the same as the one that was hashed and stored in the database and returned from the above query.
            // If there is no match, re-render the form with an error message
            // If there is a match, log the user in. That is, set req.session.userId to the id returned by the above query.
            // Tomorrow, we will learn how to make the query that finds the user info by email address
            //also find the signature id from the user table. For now, we do not know if the user signed after they successfully log in. To find out you can do another query that finds the signature id from the signatures table by the user id. Once you have the signature id you can set req.session.signatureId
            // If the user has signed, send them to /thanks after log in. If the user has not signed, send them to /petition after log in.
        })
        .catch((err) => {
            console.log("Error in get email", err);
        });
});
//////////////////////////Post Login/////////////////////

//////////////////////////Get Petition/////////////////////
app.get("/petition", (req, res) => {
    console.log("running GET / petition");

    // has my user already signed the petition? -> check cookie
    // if yes redirect to thank you
    if (req.session.signatureID) {
        console.log("redirect thanks   ");
        res.redirect("/thanks");
    }
    // if no:
    else {
        res.render("petition");
    }
});
//////////////////////////Get Petition/////////////////////

////////////////////////Post Petition////////////////
app.post("/petition", (req, res) => {
    // console.log("req.session.userID: ", req.session.userID);
    // console.log("req.body.signature: ", req.body.signature);
    db.addSigners(req.body.signature, req.session.userID)
        .then((result) => {
            // logic to insert your user's values into the signatures table
            // console.log("addSigners result", result);

            req.session.signatureID = result.rows[0].id;
            console.log(result.rows[0].id);
            // if it worked successfully store the signature's id in the cookie and
            // redirect the user to thank-you
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("err in db.addSigners:", err);
            // if anything went wrong rerender the petition template with the error message

            res.render("petition");
        });
});

////////////////////////Post Petition////////////////

//////////////////////////Get Thanks/////////////////////

app.get("/thanks", (req, res) => {
    console.log("runnning GET / thanks");
    // has my user already signed the petition? -> check cookie
    let dataUrl;
    let numOfSigners;
    ///////////////IMG TO URL///////////
    db.getDataURL(req.session.usersID)
        .then((result) => {
            console.log("dataurl result", result);
            console.log("result.rows", result.rows[0]);
            dataUrl = result.rows[0];
        })
        .catch((err) => {
            console.log("err in db.getDataURL:", err);
        });
    ///////////////IMG TO URL///////////

    db.countSigners()
        .then((result) => {
            // console.log("result in countSigners: ", result);

            // console.log("req.session in countSigners: ", req.session);
            if (req.session.signatureID) {
                // if the user has signed obtain the user's signature from the db
                // and find out how many people have signed the petition
                // render the thank you template, pass along the user's signature DataURL
                // & number of signers
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
                // if the user hasn't signed -> redirect to petition
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
            if (req.session.signed == true) {
                // if  the user has signed, get the information on first & last of
                // everyone who sigend the petition from the db
                // pass it along to your template render
                // should render the signers template
                res.render("signers", {
                    results: result.rows,
                });
            } else {
                // if the user hasn't signed -> redirect to petition

                res.redirect("/petition");
            }
        })
        .catch((err) => {
            console.log("err in db.getsigners:", err);
        });
});

//////////////////////////Get signers/////////////////////

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});
app.listen(process.env.PORT || 8080, () => {
    console.log("You got this petition");
});

// req.session = null - destroys a session

// app.get("/profile", (req, res) => {
//     res.render("/profile");
// });

// app.post("profile", (req, res) => {});
// app.get("/signers/:cit", (req, res) => {});
