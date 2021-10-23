const router        =   require("express").Router();
const passport      =   require("../config/passport");
const bcrypt        =   require("bcrypt");
const saltRounds    =   10;
const {User}        =   require("../model/user");
const {Article}     =   require("../model/article");

router.get("/", (req, res) => {
    res.send("Welcome!");
});


//--------------------------Sign up---------------------------------
router.route("/api/signup")
.post((req, res) => {
    const userId    =   req.body.userMemberId;
    const userEmail =   req.body.userMemberEmail;
    const userPass  =   req.body.userMemberPass;
    res.header("Access-Control-Allow-Origin", "*");
    bcrypt.hash(userPass, saltRounds, (err, hash) => {
        User.register(new User({username: userId, userId: userId, email: userEmail, password: hash}), userPass, (err, registeredUser) => {
            if(err){
                console.log(err);
                return res.json({
                    registration: false
                });
            }else{
                passport.authenticate("local")(req, res, () =>{
                    return res.json({
                        registration: true,
                    });
                })
            }
        });
    });
});

//--------------------------Sign in---------------------------------
router.route("/api/signin")
.post((req, res) => {
    const loginUser     =   new User({
        userEmail: req.body.userMemberEmail,
        password: req.body.userMemberPass,
    });
    User.findOne({email: req.body.userMemberEmail}, (err, foundUser) => {
        if(err){
            console.log(err);
        }else{
            if(!foundUser){
                return res.json({
                    loginSuccess: false,
                });
            }else{
                bcrypt.compare(req.body.userMemberPass, foundUser.password, (err, result) =>{
                    if (result === true){
                        req.login(loginUser, err=>{
                            if(err){
                                console.log(err);
                                return res.json({
                                    login: false,
                                });
                            }else{
                                passport.authenticate("local")(req, res, () =>{
                                    req.session.userId   = foundUser.userId;
                                    req.session.userEmail= foundUser.email;
                                    return res.json({
                                        authentication: true,
                                        userId: req.session.userId,
                                        userEmail: req.session.userEmail,
                                    });
                                })
                            }
                        });
                    }else{
                        console.log(err);
                        return res.json({
                            loginSuccess: false,
                        });
                    }
                });
            }
        }
    });
})


// ---------------- Email Validation Check ------------------------
router.route("/api/signup/check/email")
.post((req, res) => {
    const userEmail =   req.body.userMemberEmail;
    User.findOne({email: userEmail}, (err, foundUser) => {
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                return res.json({
                    validation: false,
                });
            }else{
                return res.json({
                    validation: true,
                });
            }
        }
    });
});
// ------------------ ID Validation Check ------------------------
router.route("/api/signup/check/id")
.post((req, res) => {
    const userId    =   req.body.userMemberId;
    User.findOne({userId: userId}, (err, foundUser) => {
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                return res.json({
                    validation: false,
                });
            }else{
                return res.json({
                    validation: true,
                });
            }
        }
    });
});
//--------------------------Auth Check---------------------------------
router.route("/checkAuthentication")
.get((req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    const isAuth     = req.isAuthenticated("local");
    const userId    = req.session.userId;
    const userEmail = req.session.userEmail;
    return res.json({
        isAuth,
        userId,
        userEmail,
    });
  });
//--------------------------Logout---------------------------------
router.route("/api/logout")
.post((req, res) => {
    if(req.isAuthenticated()){
        res.clearCookie("connect.sid");
        req.logOut(err => {
            res.json({
                logout: false,
            });
        });
        req.session.destroy();
        res.send("You're logged out");
    }else{
        res.send("Please, login first.");
    }
});
//--------------------------Delete Account---------------------------------
router.route("/api/account/removal")
.post((req, res) => {
    User.findOne({email: req.body.userEmail}, (err, foundUser) => {
        if(err){
            console.log(err);
        }else{
            if(!foundUser){
                return res.json({
                    accountRemoval: false,
                });
            }else{
                User.findOneAndRemove({email: foundUser.email}, err=>{
                    if(err){
                        console.log("Delete failed");
                    }else{
                        console.log("Delete Successfully!");
                    }
                });
            }
        }
    });
});
//--------------------------Change Password---------------------------------
router.route("/api/account/change")
.patch((req, res) => {
    User.findOne({email: req.body.userEmail}, (err, foundUser) => {
        if(err){
            console.log(err);
        }else{
            if(!foundUser){
                return res.json({
                    passChange: false,
                });
            }else{
                bcrypt.hash(req.body.userPass, saltRounds, (err, hash) => {
                    User.findOneAndUpdate({email: foundUser.email}, {$set: {password: hash}}, err=>{
                        if(err){
                            console.log("Change failed");
                        }else{
                            res.json({
                                change: "success"
                            });
                        }
                    });
                });
            }
        }
    });
});
//--------------------------Board---------------------------------
router.route("/api/board/boardlist")
.get((req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    Article.find((err, articles) => {
        if(err){
            console.log("Oops! Something went wrong.");
        }else{
           res.send(articles);
        }
    });
})
.post((req, res) => {
    if(req.isAuthenticated()){
        const articleData = new Article({
            userId: req.body.userId,
            title:req.body.title,
            content: req.body.content,
            heart: 0,
            brokenheart: 0,
        });
        articleData.save()
        .then(res.send("Article has successfully added"))
        .catch(err => console.log(err));
    }else{
        res.send("Please, login first.");
    };
})
.patch((req, res) => {
    if(JSON.stringify(req.body).includes("heart")){
        Article.updateOne({articleNum: req.body.postNum}, {$set:{heart:req.body.heart}}, err =>{
            if(!err){
                res.send("Successfully updated article");
            }else{
                res.send("Failed to update");
            }
        });
    }else{
        Article.updateOne({articleNum: req.body.postNum}, {$set:{brokenheart:req.body.brokenHeart}}, err =>{
            if(!err){
                res.send("Successfully updated article");
            }else{
                res.send("Failed to update");
            }
        });
    }
});


module.exports = router;