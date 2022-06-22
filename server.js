const express = require("express");
const app = express();
const db = require("./db");
app.use(express.static("./public"));
const cookieSession = require("cookie-session");

const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use((req, res, next) => {
    console.log("---------------------");
    console.log("req.url:", req.url);
    console.log("req.method:", req.method);
    console.log("req.session:", req.session);
    console.log("---------------------");
    next();
});
//////////////////////Cookies////////////////////

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

//////////////////////Cookies////////////////////

////////////To prevent clickjacking/////////////
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});
////////////To prevent clickjacking/////////////
app.get("/", (req, res) => {
    res.redirect("/petition");
});
//////////////////////////Get Petition/////////////////////
app.get("/petition", (req, res) => {
    console.log("running GET / petition");

    // has my user already signed the petition? -> check cookie
    // if yes redirect to thank you
    if (req.session.signed == true) {
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
    db.addSigners(req.body.fname, req.body.lname, req.body.signature)
        .then((result) => {
            // logic to insert your user's values into the signatures table
            console.log("addSigners result", result);

            req.session.signed = true;
            req.session.signaturesID = result.rows[0].id;
            // console.log(result.rows[0].id);
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
    db.getDataURL(req.session.signaturesID)
        .then((result) => {
            console.log("dataurl result", result);
            dataUrl = result.rows[0].signature;
        })
        .catch((err) => {
            console.log("err in db.getDataURL:", err);
        });
    ///////////////IMG TO URL///////////

    db.countSigners()
        .then((result) => {
            console.log("result in countSigners: ", result);

            console.log("req.session in countSigners: ", req.session);
            if (req.session.signed == true) {
                // if the user has signed obtain the user's signature from the db
                // and find out how many people have signed the petition
                // render the thank you template, pass along the user's signature DataURL
                // & number of signers
                ///////////COUNT SIGNERS///////////
                db.getSigners()
                    .then(({ rows }) => {
                        numOfSigners = rows.length;
                        console.log("num of signers: ", numOfSigners);
                        res.render("thanks", {
                            // data: dataUrl,
                            results: result.rows,
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
    req.session.signed = null;
    res.redirect("/petition");
});
app.listen(8080, () => {
    console.log("You got this petition");
});

// req.session = null - destroys a session
