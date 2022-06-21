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
        name: `session`,
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
    res.render("petition");
});
//////////////////////////Get Petition/////////////////////
app.get("/petition", (req, res) => {
    console.log("running GET / petition");

    // has my user already signed the petition? -> check cookie
    // if yes redirect to thank you
    if ((req.session.signed = true)) {
        res.redirect("/thanks");
    }
    // if no:
    else {
        res.render("/petittion");
    }
});
//////////////////////////Get Petition/////////////////////

////////////////////////Post Petition////////////////
app.post("/petition", (req, res) => {
    console.log(req.body.firstname);

    console.log("running POST / petition");
    db.addSigners(req.body.firstname, req.body.lastname, req.body.signatures)
        .then((result) => {
            // logic to insert your user's values into the signatures table
            req.session.signed = true;
            req.session.signaturesID = result.rows[0].id;
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
    db.getDataURL(req.session.signaturesID)
        .then((result) => {
            dataUrl = result.rows[0].signature;
        })
        .catch((err) => {
            console.log("err in db.getDataURL:", err);
        });

    db.countSigners()
        .then((result) => {
            req.session.numSignatures = result.rows[0].count;
            if ((req.session.signed = true)) {
                // if the user has signed obtain the user's signature from the db
                // and find out how many people have signed the petition
                // render the thank you template, pass along the user's signature DataURL
                // & number of signers
                res.render("thanks", {
                    data: dataUrl,
                    numSignatures: req.session.numSignatures,
                });
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
    console.log("runnning GET / signers");
    // has my user already signed the petition? -> check cookie

    db.getSigners()
        .then((result) => {
            if ((req.session.signaturesID = true)) {
                // if  the user has signed, get the information on first & last of
                // everyone who sigend the petition from the db
                // pass it along to your template render
                // should render the signers template
                res.render("signers", {
                    results: result.row,
                });
            } else {
                // if the user hasn't signed -> redirect to petition

                res.redirect("petition");
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
